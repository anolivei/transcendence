import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { GameService } from './game.service';
import { UserData } from './types';
import { SocketWithAuth } from 'src/types';

@WebSocketGateway({
  namespace: 'game',
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(GameGateway.name);
  private players: UserData[] = [];
  constructor(private readonly gameService: GameService) {}

  @WebSocketServer() io: Namespace;

  afterInit(): void {
    this.logger.log(`Websocket Gateway initialized.`);
  }

  handleConnection(client: SocketWithAuth) {
    const sockets = this.io.sockets;

    this.players = this.gameService.populateUserList(client, this.io);

    this.logger.log(`WS Client with id: ${client.id} connected!`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
  }

  handleDisconnect(client: SocketWithAuth) {
    this.gameService.waitReconnect(client, this.io);

    this.logger.log(`Disconnected socket id: ${client.id}`);
    this.logger.debug(`Number of connected sockets: ${this.io.sockets.size}`);
  }

  @SubscribeMessage('join_queue')
  handleJoinQueueEvent(client: SocketWithAuth) {
    this.gameService.updatePlayerUsernameByUserID(client.userID);
    this.players = this.gameService.joinQueue(client);
    let availablePlayers = this.gameService.findPlayerByStatus('searching');
    availablePlayers = availablePlayers.filter(p => {
      return p.userID !== client.userID;
    });

    if (availablePlayers.length > 0) {
      const roomID = availablePlayers[0].roomID;
      const room = this.gameService.joinRoom(client, roomID, this.io);
      this.io.to(roomID).emit('status_changed', 'readyToPlay');
      this.io.to(roomID).emit('time_to_be_ready', room.ExpiredAt);
    } else {
      this.gameService.createRoom(client);
      client.emit('status_changed', 'searching');
    }
  }

  @SubscribeMessage('exit_queue')
  handleExitQueueEvent(client: SocketWithAuth) {
    this.players = this.gameService.removeUserFromQueue(client.userID);
    client.emit('status_changed', 'connected');
  }

  @SubscribeMessage('send_key')
  handleKeyEvent(client: SocketWithAuth, data) {
    const { type, key } = data;
    const direction =
      type === 'keyup' ? 'STOP' : key.replace('Arrow', '').toUpperCase();
    const player = this.gameService.findPlayerByUserID(client.userID);
    const match = this.gameService.findMatchByRoomID(player.roomID);
    if (match && match.player1.userID === player.userID)
      match.player1.direction = direction;
    else if (match && match.player2.userID === player.userID)
      match.player2.direction = direction;
    this.gameService.updateMatch(match);
  }

  @SubscribeMessage('playing')
  async handlePlayingEvent(client: SocketWithAuth) {
    this.gameService.updatePlayerUsernameByUserID(client.userID);
    const player = this.gameService.findPlayerByUserID(client.userID);
    const room = this.gameService.findRoomByRoomID(player.roomID);
    room.IsReady = true;
    const users = room.users.map(user => {
      if (user.socketID === player.socketID) user.status = 'playing';
      return user;
    });
    player.status = 'playing';
    this.gameService.updatePlayer(player);
    room.users = users;
    this.gameService.updateRoom(room);
    if (
      room.users[0].status === 'playing' &&
      room.users[1].status === 'playing'
    ) {
      const matchData = this.gameService.loadGame(room);
      this.io.to(room.ID).emit('status_changed', 'playing');
      await this.gameService.updatePlayerStatus(
        room.users[0].userID,
        'playing',
      );
      await this.gameService.updatePlayerStatus(
        room.users[1].userID,
        'playing',
      );
      this.io.emit('refresh_list', ``);
      this.gameService.gameInProgress(matchData.roomID, this.io);
    }
  }

  @SubscribeMessage('pause')
  handlePausePlaying(client: SocketWithAuth, data) {
    const { type } = data;
    if (type === 'keydown') {
      this.gameService.pauseMatch(client.userID, this.io);
    }
  }

  @SubscribeMessage('resume')
  handleResumePlaying(client: SocketWithAuth) {
    this.gameService.resumeMatch(client.userID, this.io);
  }

  @SubscribeMessage('give_up')
  handleGiveUpMatch(client: SocketWithAuth) {
    const match = this.gameService.findMatchByUserID(client.userID);
    this.gameService.updatePlayerUsernameByUserID(match.player1.userID);
    this.gameService.updatePlayerUsernameByUserID(match.player2.userID);
    this.gameService.giveUpMatch(match, this.io, client);
  }

  @SubscribeMessage('request_match')
  handleRequestMatch(client: SocketWithAuth, data) {
    const { guestID } = data;
    this.gameService.updatePlayerUsernameByUserID(client.userID);
    this.gameService.updatePlayerUsernameByUserID(guestID);
    this.gameService.requestMatch(this.io, client, guestID);
  }

  @SubscribeMessage('cancel_request_match')
  handleCancelRequestMatch(client: SocketWithAuth, data) {
    this.gameService.cancelRequestMatch(this.io, client.userID, data.type);
  }

  @SubscribeMessage('response_resquest_match')
  handleResponseRequestMatch(client: SocketWithAuth, data) {
    const { response } = data;
    this.gameService.responseRequestMatch(this.io, client, response);
  }
}
