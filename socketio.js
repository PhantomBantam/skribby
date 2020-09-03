var socketIO = require('socket.io');
var io = null;

module.exports = {

    connect: function(server) {
        io = socketIO(server);
    },

    emit: function(event, values) {
        if (io) {
            io.sockets.emit(event, values);
        }
    },

    on: function(event, callback) {
      if(io){
        io.sockets.on(event, callback);
      }  
    },

    to: function(room) {
      if(io){
        return io.to(room);
      }  
      return null;
    }, 
    in: function(room) {
      if(io){
        return io.in(room);
      }  
      return null;
    }

}
