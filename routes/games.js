const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const io = require('../socketio');
const Game = require('../models/Game');
const User = require('../models/User');

let messageWhite = false;
let rounds = 0;
const MAX_ROUNDS = 10;
const TIME_PER_ROUND = 1000 * 60 * 2; // 2 minutes

const userHandler = require('../utils/userHandler');
const wordHandler = require('../utils/wordHandler');
const roomHandler = require('../utils/roomHandler');

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
  socket.on('joinRoom', async ({code, email}) => {
    const user = await User.findOne({email:email});
    if(!userHandler.getCurrentUser(email)){
      userHandler.userJoin(socket.id, email, code, user.nickname);
    }

    socket.join(code);

    // Welcome current user
    io.in(code).emit('sendMessage', {message: "Welcome " + user.nickname + "!", nickname: 'join', messageWhite});
    io.in(code).emit('userList', {users:userHandler.getRoomUsers(code)});  
    messageWhite=!messageWhite;

    let users =  userHandler.getRoomUsers(code);
    if(users.length>1){
      roomHandler.setDrawUser(users[Math.floor(Math.random()*users.length)].email, code);
      io.in(code).emit('setDrawer', {drawerEmail: roomHandler.getDrawUser(code).email});
      startRound(code); 
    }

    socket.on('draw', ({mousePos, code, color, email})=>{
      if(userHandler.getRoomUsers(code).length>1){
        io.in(code).emit('getDraw', {mousePos, color});
      }
    });
  
    socket.on('chatMessage', ({code, message, email})=>{
      let word = wordHandler.getWord(code);
      if(typeof word != 'undefined'){
        
      }else{

      }
      io.in(code).emit('sendMessage', {message, nickname: getCurrentUser(email).nickname, messageWhite});
      messageWhite = !messageWhite;
    });
  
    socket.on('disconnect', ()=>{
      const user = userHandler.userLeave(socket.id);
      if(user){ 
        socket.broadcast.to(code).emit('sendMessage', {message: user.nickname + " has left", nickname: 'leave', messageWhite});
        socket.broadcast.to(code).emit('userList', {users:userHandler.getRoomUsers(code)});
        messageWhite=!messageWhite;
      }
    });

    socket.on('clearCanvas', ({code})=>{
      socket.broadcast.to(code).emit('clearCanvas');
    });

    socket.on('liftedMouse', ()=>{
      io.in(code).emit('resetPrevMouse');
    });

    socket.on('setDrawWord', ({drawWord, code})=>{
      let dashes = drawWord.replace(/([a-zA-Z])/g, '_ ');
      wordHandler.addWord(drawWord, code);
      socket.broadcast.to(code).emit('setDashes', {dashes});
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

function startRound(code){
  let word1 = words[Math.floor(Math.random()*words.length)];
  let word2 = words[Math.floor(Math.random()*words.length)];
  let word3 = words[Math.floor(Math.random()*words.length)];
  rounds++;
  
  io.in(code).emit('startRound', ({word1, word2, word3, rounds}));

  setTimeout(()=>{
    rounds++;
    wordHandler.deleteWord(code);
  }, TIME_PER_ROUND);

  setTimeout(()=>{
    
  }, TIME_PER_ROUND/4);

  setTimeout(()=>{
    
  }, TIME_PER_ROUND/2);

  setTimeout(()=>{
    
  }, (TIME_PER_ROUND/4)*3);

}



module.exports = router;