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

  if (game) {
    let player = new Player(socket);
    game.addPlayer(player);
  }

  socket.on('create new game', (data) => {
    game = new Game();
    let admin = new Player(socket);
    game.addPlayer(admin);
    socket.emit('game create', {
      name: data.name,
      id: 0
    });
  });

});


if (module === require.main) {
  httpserver.listen(process.env.PORT || 8080);
}

module.exports = app;
