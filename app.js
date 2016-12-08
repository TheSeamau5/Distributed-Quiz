'use strict';

const express = require('express');
const path = require('path');

const app = express();

app.use('/', express.static(path.join(__dirname, 'client')));

function staticFile(filename) {
  return path.join(__dirname, 'client', filename);
}

// Home Route
app.get('/', (req, res) => {
  res.sendFile(staticFile('index.html'));
});


// Start the server
if (module === require.main) {
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;