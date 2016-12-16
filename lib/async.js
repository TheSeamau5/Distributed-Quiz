const Promise = require('bluebird');

function optional(promises) {
  return Promise.all(promises.map(function(promise) {
    return promise.reflect();
  }))
    .filter(function(inspection) {
      return inspection.isFulfilled();
    })
    .map(function(inspection) {
      return inspection.value();
    });
}

module.exports = {
  optional: optional
};