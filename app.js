'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const request = require('request');

const Game = require('./lib/game');
const Player = require('./lib/player');

// Special reset option available to admin
// This is to be used if anything goes wrong during the demo
const ADMIN_RESET = 'Admin Reset';


// The Application
class App {
	constructor() {
		// Initialize the express app, the http server, and the socket io port
		this.app = express();
		this.httpserver = http.Server(this.app);
		this.io = socketio.listen(this.httpserver);

		// Initialize the game
		this.game = null;

		this.host = (process.env.ENVIRONMENT === 'production') ? 'https://distributed-quiz.herokuapp.com' : 'localhost';
		this.port = process.env.PORT || 8080;

		// Setup templating
		this._setupTemplating();
		// Setup Http routes
		this._setupRoutes();

		// Setup Socket Connection
		this._setupSocketConnection();

		// Run the App
		this.run();
	}

	_setupTemplating() {
		this.app.set('view engine', 'ejs');
		this.app.set('views', __dirname + '/client');
	}

	_setupRoutes() {
		// Lets us import files from the server on the client side
		this.app.use('/', express.static(path.join(__dirname, 'client')));

		// Sets up the home directory
		this.app.get('/', (req, res) => {
			res.render('index', {
				HOST: this.host,
				PORT: this.port
			});
		});
	}

	_setupSocketConnection() {
		// Handle response on new socket connection
		this.io.on('connection', (socket) => {
			// We have two types of players, a normal player and an admin player
			// An admin player creates the game and moves the game forward
			// A normal player only answers questions and waits for the next question to be served
			if (this.game && this.game.admin) {
				App.notifyIsNotAdmin(socket);
			} else {
				App.notifyIsAdmin(socket);
			}

			// Setup the main socket routes
			this._setupSocketRoutes(socket);
		});
	}

	_setupSocketRoutes(socket) {
		// Handle creation of new game
		socket.on('create new game', (data) => {
			this.onCreateNewGame(socket, data);
		});

		// Handle joining of game
		socket.on('join game', (data) => {
			this.onJoinGame(socket, data);
		});
	}

	onCreateNewGame(socket, data) {
		// Create a new game
		this.game = new Game();

		// Set the new player as an admin player and add the admin player to the game
		let adminPlayer = new Player(socket, data.name);
		this.game.addPlayer(adminPlayer);

		// Notify to admin player that the game has just been created
		App.notifyGameCreated(socket, adminPlayer);
	}

	onJoinGame(socket, data) {
		// If game exists
		if (this.game && this.game.admin) {
			// Reset the game in the case of an admin reset
			if (data.name === ADMIN_RESET) {
				this.game.resetGame();
			} else {
				// Create the new player
				let player = new Player(socket, data.name);

				// Notify all other players that the player has been added
				App.notifyGameJoined(socket, player, this.game);

				// Add the player to the game
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

	// Run the server by listening to the main port or port 8080
	run() {
		if (module === require.main) {
			this.httpserver.listen(this.port);
			console.log(`Server Listening on port ${this.port}`);
		}

		module.exports = this.app;
	}
}

// Create the app and run it
const app = new App();
