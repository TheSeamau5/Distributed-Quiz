const MasterClock = require('./master-clock');
const uuid = require('uuid/v4');

// Game States
const NOT_STARTED = 'Not Started';
const PLAYING = 'Playing';
const FINISHED = 'Finished';

class Game {

  constructor(name, admin) {
    this.masterClock = new MasterClock([admin.clock]);
    this.id = uuid();
    this.name = name;
    this.admin = admin;
    this.players = [admin];
    this.state = NOT_STARTED;
  }

  addPlayer(player) {
    this.players.push(player);
    this.masterClock.addSlaveClock(player.clock);
  }

  run() {
    setInterval(() => {
      this.masterClock.sync();
    }, 2000);
  }
}

module.exports = Game;