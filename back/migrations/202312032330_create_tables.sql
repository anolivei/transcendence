CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'offline',
    two_factor_enabled BOOLEAN DEFAULT false,
    total_games INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_losses INT DEFAULT 0,
    ladder_level INT
);

CREATE TABLE Friends (
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (friend_id) REFERENCES Users(user_id)
);

CREATE TABLE ChatMessages (
    message_id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT,
    channel_id INT,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id),
    FOREIGN KEY (channel_id) REFERENCES Channels(channel_id)
);

CREATE TABLE Channels (
    channel_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) DEFAULT 'public',
    password VARCHAR(255),
    owner_id INT,
    FOREIGN KEY (owner_id) REFERENCES Users(user_id)
);

CREATE TABLE ChannelMembers (
    channel_id INT NOT NULL,
    user_id INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'member', -- 'member', 'blocked', 'removed', 'muted'
    FOREIGN KEY (channel_id) REFERENCES Channels(channel_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE AdminActions (
    action_id SERIAL PRIMARY KEY,
    channel_id INT NOT NULL,
    target_user_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'mute', 'remove', 'block'
    executed_by INT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES Channels(channel_id),
    FOREIGN KEY (target_user_id) REFERENCES Users(user_id),
    FOREIGN KEY (executed_by) REFERENCES Users(user_id)
);

CREATE TABLE Games (
    game_id SERIAL PRIMARY KEY,
    player1_id INT NOT NULL,
    player2_id INT NOT NULL,
    player1_score INT DEFAULT 0,
    player2_score INT DEFAULT 0,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    FOREIGN KEY (player1_id) REFERENCES Users(user_id),
    FOREIGN KEY (player2_id) REFERENCES Users(user_id)
);

CREATE TABLE MatchHistory (
    history_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    result VARCHAR(10) NOT NULL,
    game_type VARCHAR(50),
    game_duration INTERVAL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (game_id) REFERENCES Games(game_id)
);

CREATE TABLE Achievements (
    achievement_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE UserAchievements (
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    date_achieved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (achievement_id) REFERENCES Achievements(achievement_id)
);

CREATE TABLE GameQueue (
    queue_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    priority INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
