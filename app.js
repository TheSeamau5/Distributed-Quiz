'use strict';

const express = require('express');
const path = require('path');

const app = express();
app.use('/', express.static(path.join(__dirname, 'client')));

const httpserver = require('http').Server(app);
const io = require('socket.io').listen(httpserver);

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

// Home Route
app.get('/', (req, res) => {
  res.sendFile(staticFile('index.html'));
});

// Socket Routes
io.on('connection', function(socket) {
  console.log('Connection established');
  socket.emit('acknowledge connection', {});
});

// Start the server
if (module === require.main) {
  httpserver.listen(process.env.PORT || 8080);
}

module.exports = app;