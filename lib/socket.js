class Socket {

  constructor(socket) {
    this.socket = socket;

    this.onCreateUser = (data) => {
      console.log('Create User');
      console.log(data);
    };

    this.onRespondTime = (data) => {
      console.log('Respond Time');
      console.log(data);
    };


    this._setupListeners();
  }

  _setupListeners() {
    this.socket.on('create user', (data) => {
      this.onCreateUser(data);
    });

    this.socket.on('respond time', (data) => {
      this.onRespondTime(data);
    });

    let id = 0;

    this.socket.on('create new game', (data) => {
      console.log('Create New Game');
      id = id + 1;
      this.socket.emit('game created', {
        name: data.name,
        id: id
      });
    });

    this.socket.on('start game', (data) => {
      this.socket.emit('next question', {
        statement: 'What is the Capital of India?',
        choices: [
          'Mumbai',
          'New Delhi',
          'Bangalore',
          'Kolkata'
        ]
      });
    });
  }

  emit(message, payload) {
    this.socket.emit(message, payload);
  }

}

module.exports = Socket;