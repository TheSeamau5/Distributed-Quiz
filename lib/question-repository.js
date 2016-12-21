const QUESTIONS = [{
	statement: "Which of the following is NOT a type of consistency?",
	answer: "Forward Consistency",
	choices: [
		"Strict Consistency",
		"FIFO Consistency",
		"Causal Consistency"
	]
}, {
	statement: "In name space distribution, what is true about the update propagation properties on a global system?",
	answer: "It is Lazy in nature",
	choices: [
		"It is Active in nature",
		"It is Immediate in nature",
		"None of the above"
	]
}, {
	statement: "In mutual exclusion algorithms, how many messages per entry/exit can Token Ring handle?",
	answer: "1 to infinity",
	choices: [
		"0 to infinity",
		"2(n-1)",
		"3"
	]
}, {
	statement: "What is the correct definition of a Causal consistency model?",
	answer: "All processes see causally-related shared accesses in the same order.",
	choices: [
		"All processes see immediate shared accesses in random order.",
		"All processes see writes from each other in the order they were used. Writes from different processes may not always be seen in that order ",
		"Absolute time ordering of all shared accesses matters."
	]
}, {
	statement: "What does EAI stands for?",
	answer: "Enterprise  Application  Integration",
	choices: [
		"Entire  Analogous Integration",
		"Enumerated  Asynchronous  Integration",
		"Enterprise  Allotment  Implementation"
	]
}, {
	statement: "When constructing a server as a Finite-state machine, what characteristics are true?",
	answer: "Parallelism, non-blocking system calls",
	choices: [
		"Parallelism, blocking system calls",
		"No parallelism, blocking system calls",
		"Periodicity, non-blocking system calls"
	]
}, {
	statement: "What is the third layer of the OSI model?",
	answer: "Network Layer",
	choices: [
		"Data Layer",
		"Presentation Layer",
		"Transport Layer"
	]
}, {
	statement: "In the Message-Queuing model, what does the GET primitive mean?",
	answer: "Block until the specified queue is nonempty, and remove the first message",
	choices: [
		"Append a message to a specified queue",
		"Allow until the specified queue is near empty, and append to the last message",
		"Check a specified queue for messages, and remove the first. Never block."
	]
}, {
	statement: "When it comes to scalability limitations, what would an example of centralized data be?",
	answer: "A single on-line telephone book",
	choices: [
		"A single server for all users",
		"A redundant on-line repository",
		"Doing routing based on complete information"
	]
}, {
	statement: "What is an example of a Generic DNS zone?",
	answer: ".org",
	choices: [
		".us",
		".ec",
		".nl"
	]
},];



module.exports = QUESTIONS;

