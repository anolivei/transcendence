import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { GameService } from './game.service';
import { UserData } from './types';

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

  handleConnection(client: Socket) {
    const sockets = this.io.sockets;

    this.players = this.gameService.populateUserList(client);

    this.logger.log(`WS Client with id: ${client.id} connected!`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);

    client.emit('status_changed', `connected`);
  }

  handleDisconnect(client: Socket) {
    //todo: derrubar das salas e mudar status dos players
    const sockets = this.io.sockets;

    this.players = this.gameService.removePlayerFromList(client);

    this.logger.log(`Disconnected socket id: ${client.id}`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
  }

  @SubscribeMessage('join_queue')
  handleJoinQueueEvent(client: Socket, body: string) {
    this.players = this.gameService.joinQueue(client, body);
    let availablePlayers = this.gameService.findPlayerByStatus('searching');
    availablePlayers = availablePlayers.filter(p => {
      return p.socketID !== client.id;
    });

    if (availablePlayers.length > 0) {
      const roomID = availablePlayers[0].socketID;
      this.players = this.gameService.joinRoom(client, roomID);
      this.io.to(roomID).emit('status_changed', 'playing');
    } else {
      this.gameService.createRoom(client);
      client.emit('status_changed', 'searching');
    }
  }

  @SubscribeMessage('exit_queue')
  handleExitQueueEvent(client: Socket) {
    this.players = this.gameService.removeUserFromQueue(client);
    client.emit('status_changed', 'connected');
  }

  @SubscribeMessage('playing')
  handlePlayingEvent(client: Socket) {
	const player = this.gameService.findPlayerBySocketID(client.id)
	const room = this.gameService.findRoomByRoomID(player.roomID)
	const users = room.users.map(user => {
		if (user.socketID === player.socketID)
			user.status = 'playing'
		return user
	})
	player.status = 'playing'
	this.gameService.updatePlayer(player)
	room.users = users
	this.gameService.updateRoom(room)
	if (room.users[0].status === 'playing' && room.users[1].status === 'playing') {
    	let matchData = this.gameService.loadGame(room);
    	this.gameService.gameInProgress(matchData, this.io);
	}
  }
}
