const async = require('./async');

class MasterClock {

  constructor(slaveClocks = []) {
    this.slaveClocks = slaveClocks;
    this.correction = 0;
  }

  addSlaveClock(clock) {
    this.slaveClocks.push(clock);
  }

  getTime() {
    return Date.now() + Math.round(this.correction);
  }

  correct(correction=0) {
    this.correction = this.correction + correction;
  }

  sync() {
    // 1. request time
    // 2. collect time
    // 3. average time
    // 4. calculate time corrections
    // 5. broadcast corrections
    const timeRequests = this.slaveClocks.map((slaveClock, index) => {
      return slaveClock.getTime()
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
        console.log('');

        const numberOfClocks = timeResponses.length + 1;

        // Calculate the average time
        let averageTime = localtime;

        timeResponses.forEach((timeResponse) => {
          averageTime = averageTime + timeResponse.time;
          console.log(`Time Difference ${timeResponse.index}: ${localtime - timeResponse.time}`);
        });

        averageTime = averageTime / numberOfClocks;

        // Calculate and broadcast the time corrections
        const localcorrection = averageTime - localtime;
        this.correct(localcorrection);

        timeResponses.forEach((timeResponse) => {
          const correction = averageTime - timeResponse.time;
          this.slaveClocks[timeResponse.index].correct(correction);
        });
      });
  }
}

module.exports = MasterClock;