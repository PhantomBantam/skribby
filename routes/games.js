const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const io = require('../socketio');
const Game = require('../models/Game');
const User = require('../models/User');

let messageWhite = false;

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('../utils/userList');

let words = [];
let drawerName = '';
setWords()

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
  
  socket.emit('data', ({word1, word2, word3}));

  socket.on('joinRoom', async ({code, email}) => {
    const user = await User.findOne({email:email});
    if(!getCurrentUser(email)){
      userJoin(socket.id, email, code, user.nickname);
    }

    socket.join(code);

    // Welcome current user
    io.in(code).emit('sendMessage', {message: "Welcome " + user.nickname + "!", nickname: 'join', messageWhite});
    io.in(code).emit('userList', {users:getRoomUsers(code)});  
    messageWhite=!messageWhite;
    
    console.log('hey');

    socket.on('draw', ({mousePos, code, color})=>{
      socket.broadcast.to(code).emit('getDraw', {mousePos, color});
    });
  
    socket.on('chatMessage', ({code, message, email})=>{
      io.in(code).emit('sendMessage', {message, nickname: getCurrentUser(email).nickname, messageWhite});
      messageWhite = !messageWhite;
    });
  
    socket.on('disconnect', ()=>{
      const user = userLeave(socket.id);
      if(user){ 
        socket.broadcast.to(code).emit('sendMessage', {message: user.nickname + " has left", nickname: 'leave', messageWhite});
        socket.broadcast.to(code).emit('userList', {users:getRoomUsers(code)});
        messageWhite=!messageWhite;
      }
    });
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