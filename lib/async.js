const Promise = require('bluebird');

// Function that evaluates a list of promises, only keeping the promises that are successful
function optional(promises) {
	return Promise.all(
		promises.map((promise) => promise.reflect()))
				.filter((inspection) => inspection.isFulfilled())
				.map((inspection) => inspection.value());
}

module.exports = {
	optional: optional
};