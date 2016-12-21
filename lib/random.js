// Function to generate a random uniformly distributed integer from 0 to n - 1
function randInt(n) {
	return Math.floor(Math.random() * n);
}

module.exports = {
	randInt: randInt
};