const express = require('express');
const io = require('../socketio');
const Game = require('../models/Game');
const passport = require('passport');

const router = express.Router();

router.get('/', (req, res)=>{

  if(req.isAuthenticated()){
    res.render('dashboard', {nickname:req.user.nickname});
  } else {
    res.render('login');
  }
});

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

io.on('connect', socket=>{
  socket.on('createGame', async ()=>{
    let id = makeid(7);
    let found = await Game.findOne({code:id});
    while(found!=null){
      id = makeid(7);
      found = await Game.findOne({code:id});  
    }

    let game = new Game({
      code:id
    });
    
    game.save()
      .then(()=>{
        socket.emit('createdNewGame', {id});
      })
  });

  socket.on('joinGame', async({code})=>{
    try{
      let game = await Game.findOne({code:code});
      socket.emit('game', {game});  
    }catch(err){console.log(err);}
  })
});

module.exports = router;