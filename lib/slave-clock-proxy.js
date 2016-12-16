const Promise = require('bluebird');

class SlaveClockProxy {

  constructor(socket) {
    this.socket = socket;
  }

  // Query time from slave clock using Cristian's Algorithm
  getTime() {
    return new Promise((resolve) => {
      const sendTime = Date.now();
      this.socket.emit('request time', {});
      this.socket.onRespondTime = function (data) {
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

module.exports = SlaveClockProxy;