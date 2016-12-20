'use strict';

const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const Game = require('./lib/game');
const Player = require('./lib/player');

const ADMIN_RESET = 'Admin Reset';

class App {
	constructor() {
		this.app = express();
		this.httpserver = http.Server(this.app);
		this.io = socketio.listen(this.httpserver);
		this.game = null;

		// Setup Http routes
		this._setupRoutes();

		// Setup Socket Connection
		this._setupSocketConnection();
	}

	_setupRoutes() {
		this.app.use('/', express.static(path.join(__dirname, 'client')));

		this.app.get('/', (req, res) => {
			res.sendFile(path.join(__dirname, 'client', 'index.html'));
		});
	}

	_setupSocketConnection() {
		this.io.on('connection', (socket) => {
			if (this.game && this.game.admin) {
				App.notifyIsNotAdmin(socket);
			} else {
				App.notifyIsAdmin(socket);
			}

			this._setupSocketRoutes(socket);
		});
	}

	_setupSocketRoutes(socket) {
		socket.on('create new game', (data) => {
			this.onCreateNewGame(socket, data);
		});

		socket.on('join game', (data) => {
			this.onJoinGame(socket, data);
		});
	}

	onCreateNewGame(socket, data) {
		this.game = new Game();

		let adminPlayer = new Player(socket, data.name);
		this.game.addPlayer(adminPlayer);

		App.notifyGameCreated(socket, adminPlayer);
	}

	onJoinGame(socket, data) {
		if (this.game) {
			if (data.name === ADMIN_RESET) {
				this.game.resetGame();
			} else {
				let player = new Player(socket, data.name);

				App.notifyGameJoined(socket, player, this.game);

				this.game.addPlayer(player);
			}
		}
	}

	static notifyIsAdmin(socket) {
		socket.emit('admin', {});
	}

	static notifyIsNotAdmin(socket) {
		socket.emit('not admin', {});
	}

	static notifyGameCreated(socket, player) {
		socket.emit('game created', {
			name: player.name,
			id: player.id
		});
	}

	static notifyGameJoined(socket, player, game) {
		socket.emit('game joined', {
			name: player.name,
			id: player.id,
			players: game.players.map((player) => ({
				name: player.name,
				id: player.id
			}))
		})
	}

	run() {
		if (module === require.main) {
			this.httpserver.listen(process.env.PORT || 8080);
		}

		module.exports = this.app;
	}
}

const app = new App();
app.run();
