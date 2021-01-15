var socketIO = require('socket.io');
var io = socketIO();
var socketApi = {};

socketApi.io = io;

io.on('connection', function(socket){
    console.log('connected!', socket.id);
  });

socketApi.sendNotificaton = function() {
    io.sockets.emit('hello', {msg: 'Hello wold'});
}


module.exports = socketApi;