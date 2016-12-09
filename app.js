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

// Mongoose (MongoDB driver)
const mongoose = require('mongoose');

// NConf for key-value store in json file
const nconf = require('nconf');

// Get the keys.json file with all the MongoDB info
nconf.argv().env().file('keys.json');

// Get the MongoDB Credentials from the keys.json file
const mongoUser = nconf.get('mongoUser');
const mongoPass = nconf.get('mongoPass');
const mongoHost = nconf.get('mongoHost');
const mongoPort = nconf.get('mongoPort');
const mongoDatabase = nconf.get('mongoDatabase');

// Construct the URI to connect to the MongoDB database
const dbURI = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/${mongoDatabase}`;

// Connect to the database
mongoose.connect(dbURI);

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