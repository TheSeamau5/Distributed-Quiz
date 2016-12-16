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
  }

  emit(message, payload) {
    this.socket.emit(message, payload);
  }

}

module.exports = Socket;