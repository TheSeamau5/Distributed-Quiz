'use strict';

const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const uuid = require('uuid/v4');


// Import the game libraries
const Game = require('./lib/game');
const Player = require('./lib/player');

const SlaveClockProxy = require('./lib/slave-clock-proxy');

// Function to route a static file to the client directory
function staticFile(filename) {
  return path.join(__dirname, 'client', filename);
}

class App {

  constructor() {
    // Create the express app
    this.app = express();

    // Create the http server
    this.httpserver = http.Server(this.app);

    // Create the socket
    this.io = socketio.listen(this.httpserver);

    // Create the Game
    this.game = null;

    // Setup routes
    this._setupHttpRoutes();
    this._setupSocketConnection();
  }

  _setupHttpRoutes() {
    this.app.use('/', express.static(path.join(__dirname, 'client')));
    this.app.get('/', (req, res) => {
      this.getHomePage(req, res);
    });
  }

  _setupSocketConnection() {
    this.io.on('connection', (socket) => {
      const playerClock = new SlaveClockProxy(socket);
      const player = new Player(uuid(), 'player', playerClock);
      this.addPlayer(player);
      this.game.run();
    });
  }

  static getHomePage(req, res) {
    res.sendFile(staticFile('index.html'));
  }

  addPlayer(player) {
    if (!this.game) {
      this.game = new Game('game', player);
    } else {
      this.game.addPlayer(player);
    }
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
