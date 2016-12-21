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

	resetGame() {
		this.admin = null;
		this.players = [];
		this.isPlaying = false;
		this.correction = 0;
	  	this.buzzBuffer = [];
	  	this.isWaitingForBuzzes = false;
	  	this.currentQuestionIndex = 0;
	}

	getTime() {
		return Date.now() + Math.round(this.correction);
	}

	correct(correction=0) {
		this.correction = this.correction + correction;
	}

	syncClocks() {
		if (this.players.length > 1) {
			console.log("Sync Clocks");

			const timeRequests = this.players.map((player, index) => {
				return player.getTime()
					.then((time) => ({
							index: index,
							time: time
						})
					);
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
			  		player.waitForAnswer(currentPlayer);
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

	getScoreTable() {
		return this.players.map((player) => ({
			name: player.name,
			id: player.id,
			score: player.score
		}));
	}

	sendGameOver() {
		const scoreTable = this.getScoreTable();
		this.players.forEach((player) => {
			player.sendGameOver(scoreTable);
		});
		this.resetGame();
	}

	getCurrentAnswer() {
		if (this.currentQuestionIndex < QUESTIONS.length + 1) {
			return QUESTIONS[this.currentQuestionIndex - 1].answer;
		} else {
		  	return null;
		}
	}

	processAnswer(answer, player) {
		console.log("Provided Answer: ");
		console.log(answer);
		console.log("Correct Answer: ");
		console.log(this.getCurrentAnswer());
		const correctAnswer = this.getCurrentAnswer();
		if (answer === this.getCurrentAnswer()) {
			player.score = player.score + 10;
		  	this.players.forEach((player) => {
				player.sendAnswerIsCorrect(correctAnswer);
		  	});
		} else {
		  	player.score = player.score - 5;
		  	this.players.forEach((player) => {
				player.sendAnswerIsIncorrect(correctAnswer);
		  	});
		}
	}

	handleBuzz(player, socket, data) {
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
	}

	addPlayer(player) {
		if (!this.isPlaying) {

			player.onBuzz = (socket, data) => {
				this.handleBuzz(player, socket, data)
		  	};

			player.onAnswer = (socket, data) => {
				this.processAnswer(data.answer, player);
			};

			if (!this.admin) {
				player.onStartGame = (socket, data) => {
					this.sendNextQuestion();
				};

				player.onNextQuestion = (socket, data) => {
					this.sendNextQuestion();
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