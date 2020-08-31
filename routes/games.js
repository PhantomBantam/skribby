const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const io = require('../socketio');
const Game = require('../models/Game');

let words = [];
setWords();

router.get('/', (req, res)=>{
  if(req.isAuthenticated()){
    res.render('dashboard');
  } else {
    res.render('login');
  }
});

router.get('/:gameCode', async (req, res)=>{  
  let game = await Game.findOne({code:req.params.gameCode});
  if(game!=null){
    setWords();
    res.render('game');  
  }else{
    res.send('Game with code: ' + req.params.gameCode + " can't be found!");
  }
});

io.on('connection', socket=>{

  let word1 = words[Math.floor(Math.random()*words.length)];
  let word2 = words[Math.floor(Math.random()*words.length)];
  let word3 = words[Math.floor(Math.random()*words.length)];
  
  //io.emit instead of socket.emit because you want to emit to everyone
  io.emit('data', ({word1, word2, word3}))


  // socket.on('joinRoom', ({ username, room }) => {
  //   const user = userJoin(socket.id, username, room);
  //   socket.join(user.room);
  //   // Welcome current user
  //   socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));
  //   // Broadcast when a user connects
  //   socket.broadcast
  //     .to(user.room)
  //     .emit(
  //       'message',
  //       formatMessage(botName, `${user.username} has joined the chat`)
  //     );

  //   // Send users and room info
  //   io.to(user.room).emit('roomUsers', {
  //     room: user.room,
  //     users: getRoomUsers(user.room)
  //   });
  // });

  socket.on('joinRoom', ({code, nickname})=>{
    //copy da above
    socket.join(code);

  });


  socket.on('draw', ({mousePos})=>{
    console.log(mousePos);
    socket.broadcast.emit('getDraw', {mousePos});
  });
});

function setWords(){
  fs.readFile('./words.txt', (err, data)=>{
    let raw = Array.from(data.toString().split('\n'));
    for(let i = 0; i<raw.length; i++){
      raw[i] = raw[i].toLowerCase();
    }
    
    words = (raw);
  });
}



module.exports = router;