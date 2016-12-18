const Promise = require('bluebird');

class Player {

  constructor(socket) {
    this.score = 0;
    this.socket = socket;

    // Event Handlers
    this.onRespondTime = null;
    this.onStartGame = null;

    // Setup Socket Handlers
    this._setupSocketHandlers();
  }

  _setupSocketHandlers() {
    this.socket.on('respond time', (data) => {
      if (this.onRespondTime) {
        this.onRespondTime(this.socket, data);
      }
    });

    this.socket.on('start game', (data) => {
      if (this.onStartGame) {
        this.onStartGame(this.socket, data);
      }
    });

  }


  getTime() {
    return new Promise((resolve) => {
      const sendTime = Date.now();
      this.socket.emit('request time', {});
      this.onRespondTime = (socket, data) => {
        console.log(data);
        const receiveTime = Date.now();
        const roundTripTime = receiveTime - sendTime;
        const remoteTime = data.timestamp;
        const time = remoteTime + Math.round(roundTripTime / 2);
        resolve(time);
      };
    });
  }

  correct(correction) {
    this.socket.emit('correct time', {
      correction: correction
    });
  }

}

module.exports = Player;