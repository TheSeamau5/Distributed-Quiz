'use strict';

const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');


// // Express App
// const app = express();
//
// // Route any queries for static files to the client directory
// app.use('/', express.static(path.join(__dirname, 'client')));
//
// // Http Server
// const httpserver = require('http').Server(app);
//
// // Socket Server
// const io = require('socket.io').listen(httpserver);
//

// Import the Socket container
const Socket = require('./lib/socket');

// Import the clock libraries
const MasterClock = require('./lib/master-clock');
const SlaveClockProxy = require('./lib/slave-clock-proxy');

// Create the Master Clock
// const masterClock = new MasterClock([]);

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

    // Create the Master Clock
    this.masterClock = new MasterClock();

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
      this.masterClock.addSlaveClock(new SlaveClockProxy(new Socket(socket)));

      setInterval(() => {
        this.masterClock.sync();
      }, 3000);
    });
  }

  static getHomePage(req, res) {
    res.sendFile(staticFile('index.html'));
  }

  run() {
    this.httpserver.listen(process.env.PORT || 8080);
    module.exports = this.app;
  }
}

const app = new App();
app.run();


// let USERS = [];
//
// // Home Route
// app.get('/', (req, res) => {
//   res.sendFile(staticFile('index.html'));
// });
//
// // Socket Routes
// io.on('connection', function(socket) {
//   console.log('Connection established');
//
//   const slaveClockProxy = new SlaveClockProxy(new Socket(socket));
//   masterClock.addSlaveClock(slaveClockProxy);
//
//   setInterval(() => {
//     masterClock.sync();
//   }, 1000);
//
//   socket.on('create new user', function() {
//     let index = USERS.length;
//     USERS.push({
//       score: 0
//     });
//     socket.emit('new user', {
//       id: index
//     });
//   });
// });
//
// // Start the server
// if (module === require.main) {
//   httpserver.listen(process.env.PORT || 8080);
// }
//
// module.exports = app;