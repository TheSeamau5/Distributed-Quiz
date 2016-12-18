const async = require('./async');

class Game {
  constructor() {
    this.admin = null;
    this.players = [];
    this.isPlaying = false;
    this.correction = 0;

    setInterval(() => {
      this.syncClocks();
    }, 3000);
  }

  getTime() {
    return Date.now() + Math.round(this.correction);
  }

  correct(correction=0) {
    this.correction = this.correction + correction;
  }

  syncClocks() {
    console.log("Sync Clocks");

    const timeRequests = this.players.map((player, index) => {
      return player.getTime()
        .then((time) => {
          return {
            index: index,
            time: time
          };
        });
    });

    return async.optional(timeRequests)
      .then((timeResponses) => {
        const localtime = this.getTime();

        const numberOfClocks = timeResponses.length + 1;

        let averageTime = localtime;

        timeResponses.forEach((timeResponse) => {
          averageTime = averageTime + timeResponse.time;
          console.log(`Time Difference ${timeResponse.index}: ${localtime - timeResponse.time}`);
        });

        averageTime = averageTime / numberOfClocks;

        const localcorrection = averageTime - localtime;
        this.correct(localcorrection);

        timeResponses.forEach((timeResponse) => {
          const correction = averageTime - timeResponse.time;
          this.players[timeResponse.index].correct(correction);
        });
      });
  }

  addPlayer(player) {
    if (!this.isPlaying) {

      if (!this.admin) {

        player.onStartGame = (socket, data) => {
          socket.emit('next question', {
            statement: 'What is the Capital of India?',
            choices: [
              'Mumbai',
              'New Delhi',
              'Bangalore',
              'Kolkata'
            ]
          });
        };

        this.admin = player;
      }

      this.players.push(player);
    }

  }


}

module.exports = Game;