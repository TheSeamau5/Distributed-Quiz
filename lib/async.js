const Promise = require('bluebird');

function optional(promises) {
	return Promise.all(
		promises.map((promise) => promise.reflect()))
				.filter((inspection) => inspection.isFulfilled())
				.map((inspection) => inspection.value());
}

module.exports = {
	optional: optional
};