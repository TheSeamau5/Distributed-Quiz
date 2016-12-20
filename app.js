'use strict';

const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const uuid = require('uuid/v4');

const Game = require('./lib/game');
const Player = require('./lib/player');

// Function to route a static file to the client directory
function staticFile(filename) {
	return path.join(__dirname, 'client', filename);
}

const app = express();
const httpserver = http.Server(app);
const io = socketio.listen(httpserver);

app.use('/', express.static(path.join(__dirname, 'client')));

app.get('/', (req, res) => {
	res.sendFile(staticFile('index.html'));
});

let game = null;

io.on('connection', (socket) => {

	if (game && game.admin) {
		socket.emit('not admin', {});
	} else {
		socket.emit('admin', {});
	}

  	socket.on('create new game', (data) => {
		game = new Game();
		let admin = new Player(socket, data.name);
		game.addPlayer(admin);
		socket.emit('game created', {
			name: admin.name,
			id: admin.id
		});
  	});

  	socket.on('join game', (data) => {
    	if (game) {
    		if (data.name === 'Admin Reset') {
    			game = null;
			} else {
				let player = new Player(socket, data.name);
				socket.emit('game joined', {
					name: player.name,
					id: player.id,
					players: game.players.map((player) => ({
						name: player.name,
						id: player.id
					}))
				});
				game.addPlayer(player);
			}
    	}
	});
});


if (module === require.main) {
	httpserver.listen(process.env.PORT || 8080);
}

module.exports = app;
