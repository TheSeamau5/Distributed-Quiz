'use strict';

const express = require('express');
const path = require('path');

// Express App
const app = express();

// Route any queries for static files to the client directory
app.use('/', express.static(path.join(__dirname, 'client')));

// Http Server
const httpserver = require('http').Server(app);

// Socket Server
const io = require('socket.io').listen(httpserver);

// Import the Socket container
const Socket = require('./lib/socket');

// Import the clock libraries
const MasterClock = require('./lib/master-clock');
const SlaveClockProxy = require('./lib/slave-clock-proxy');

// Create the Master Clock
const masterClock = new MasterClock([]);

// Function to route a static file to the client directory
function staticFile(filename) {
  return path.join(__dirname, 'client', filename);
}

const QUESTIONS = [{
  question: 'What is the capital of France?',
  choices: {
    correct: 'Paris',
    alternatives: [
      'Madrid',
      'London',
      'Rome'
    ]
  }
}];


let USERS = [];

// Home Route
app.get('/', (req, res) => {
  res.sendFile(staticFile('index.html'));
});

// Socket Routes
io.on('connection', function(socket) {
  console.log('Connection established');

  const slaveClockProxy = new SlaveClockProxy(new Socket(socket));
  masterClock.addSlaveClock(slaveClockProxy);

  setInterval(() => {
    masterClock.sync();
  }, 1000);

  socket.on('create new user', function() {
    let index = USERS.length;
    USERS.push({
      score: 0
    });
    socket.emit('new user', {
      id: index
    });
  });
});

// Start the server
if (module === require.main) {
  httpserver.listen(process.env.PORT || 8080);
}

module.exports = app;