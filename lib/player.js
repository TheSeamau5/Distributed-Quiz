const Promise = require('bluebird');
const uuid = require('uuid/v4');

class Player {

	constructor(socket, name) {
		this.score = 0;
		this.socket = socket;
		this.name = name;
		this.id = uuid();

		// Event Handlers
		this.onRespondTime = null;
		this.onStartGame = null;
		this.onNextQuestion = null;
		this.onBuzz = null;
		this.onAnswer = null;

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

		this.socket.on('next question', (data) => {
			if (this.onNextQuestion) {
				this.onNextQuestion(this.socket, data);
			}
		});

		this.socket.on('buzz', (data) => {
			if (this.onBuzz) {
				this.onBuzz(this.socket, data);
			}
		});

		this.socket.on('select answer', (data) => {
			if (this.onAnswer) {
				this.onAnswer(this.socket, data);
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

	answer() {
		this.socket.emit('answer', {});
	}

  	waitForAnswer(player) {
		this.socket.emit('wait for answer', {
			name: player.name,
			id: player.id
		});
  	}

  	sendNextQuestion(question) {
		this.socket.emit('next question', question);
  	}

  	sendGameOver(scoreTable) {
		this.socket.emit('game over', {
			scoreTable: scoreTable
		});
  	}

  	sendNewPlayerJoined(player) {
		this.socket.emit('new player joined', {
			id: player.id,
			name: player.name
		});
  	}

  	sendAnswerIsCorrect(answer) {
		this.socket.emit('correct', {
			answer: answer,
			score: this.score
		});
  	}

  	sendAnswerIsIncorrect(answer) {
		this.socket.emit('incorrect', {
			answer: answer,
			score: this.score
		});
  	}

}

module.exports = Player;