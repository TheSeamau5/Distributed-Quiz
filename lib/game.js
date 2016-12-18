const async = require('./async');
const random = require('./random');
const QUESTIONS = require('./question-repository');

class Game {
  constructor() {
    this.admin = null;
    this.players = [];
    this.isPlaying = false;
    this.correction = 0;
    this.buzzBuffer = [];
    this.isWaitingForBuzzes = false;
    this.currentQuestionIndex = 0;

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

  static getQuestion(index) {
    const question = QUESTIONS[index];

    if (question) {
      let choices = question.choices.slice();
      choices.splice(random.randInt(choices.length), 0, question.answer);

      return {
        statement: question.statement,
        choices: choices
      };

    } else {
      return null;
    }
  }

  evaluateBuzz() {
    if (this.buzzBuffer.length === 0) {
      setTimeout(() => {
        this.evaluateBuzz();
      }, 3000);
    } else {
      this.buzzBuffer.sort((i1, i2) => i1.timestamp - i2.timestamp);
      const currentPlayer = this.buzzBuffer[0].player;

      this.players.forEach((player) => {
        if (player == currentPlayer) {
          player.answer();
        } else {
          player.waitForAnswer();
        }
      });

      this.isWaitingForBuzzes = false;
      this.buzzBuffer = [];
    }
  }

  sendNextQuestion() {
    if (this.currentQuestionIndex < QUESTIONS.length) {
      let question = Game.getQuestion(this.currentQuestionIndex);
      this.currentQuestionIndex = this.currentQuestionIndex + 1;
      this.players.forEach((player) => {
        player.sendNextQuestion(question);
      });
    } else {
      this.sendGameOver();
    }
  }

  sendGameOver() {
    this.players.forEach((player) => {
      player.sendGameOver();
    });
  }

  addPlayer(player) {
    if (!this.isPlaying) {

      player.onBuzz = (socket, data) => {
        console.log(`Buzzed at ${data.timestamp}`);
        if (!this.isWaitingForBuzzes) {
          this.isWaitingForBuzzes = true;
          this.buzzBuffer = [];

          setTimeout(() => {
            this.evaluateBuzz();
          }, 3000);
        }
        const bufferItem = {
          player: player,
          timestamp: data.timestamp
        };
        this.buzzBuffer.push(bufferItem);
      };

      if (!this.admin) {

        player.onStartGame = (socket, data) => {
          this.sendNextQuestion();
        };

        player.onNextQuestion = (socket, data) => {

        };

        this.admin = player;
      }

      this.players.push(player);

      this.players.forEach((p) => {
        p.sendNewPlayerJoined(player);
      });
    }
  }
}

module.exports = Game;