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
    
    if(users.length>1 && typeof roomHandler.getDrawUser(code)=='undefined'){
      roomHandler.setDrawUser(users[Math.floor(Math.random()*users.length)].email, code);
      io.in(code).emit('setDrawer', {drawerEmail: roomHandler.getDrawUser(code).email});
      startRound(code); 
    } else {
      let word = wordHandler.getWord(code);
      if(typeof word!='undefined'){
        socket.emit('setDashes', {dashes: convertToDashes(word.word)});
        socket.emit('giveFullDrawing', {drawing: roomHandler.getDrawing(code)});
      }
    }

    socket.on('draw', ({mousePos, code, color, penWidth})=>{
      if(userHandler.getRoomUsers(code).length>1){
        roomHandler.addPixel(mousePos.x, mousePos.y, penWidth, color, code);
        io.in(code).emit('getDraw', {mousePos, color, penWidth});
      }
    });
  
    socket.on('chatMessage', ({code, message, email})=>{
      let word = wordHandler.getWord(code);
      if(typeof word != 'undefined'){
        if(message.toLowerCase().trim() == word.word.trim()){
          socket.emit('correctGuess', {message: message + " is correct!"});
          userHandler.setGuessed(email, true);
          return;
        }
      }
      let nickname = userHandler.getCurrentUser(email).nickname;
      if(userHandler.getCurrentUser(email).guessed){
        socket.emit('correctGuess', {message: nickname + ": " + message});
      }else{
        io.in(code).emit('sendMessage', {message, nickname, messageWhite});
        messageWhite = !messageWhite;  
      }
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
      roomHandler.addPixel(0, 0, 0, 'lifted', code);
      io.in(code).emit('resetPrevMouse');
    });

    socket.on('setDrawWord', ({drawWord, code})=>{
      wordHandler.addWord(drawWord, code);
      socket.broadcast.to(code).emit('setDashes', {dashes: convertToDashes(drawWord)});
    });
  });
});

function convertToDashes(word){
  let dashes = word.replace(/([a-zA-Z])/g, '_ ');
  return dashes;
}


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
  roomHandler.setRoundTimer(TIME_PER_ROUND, code);
  
  let interval = setInterval(()=>{
    let time = roomHandler.decrementTimer(code);

    if(time<TIME_PER_ROUND/4){

    }else if(time<TIME_PER_ROUND/2){

    }else if(time<(TIME_PER_ROUND/4)*3){
      
    }else if(time==0){

    }

  }, 1000);

  roomHandler.addInterval(interval, code);
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