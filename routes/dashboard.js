const express = require('express');
const io = require('../socketio');
const Game = require('../models/Game');


const router = express.Router();

router.get('/', (req, res)=>{
  console.log(req.authInfo);
  console.log('hey');
  if(req.isAuthenticated()){
    res.render('dashboard');
  } else {
    res.render('dashboard');
  }
});

router.get('/api/user_data', (req, res)=>{
  if(req.user === undefined){
    res.json({});
  }else{
    res.json({
      user: req.user
    });
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
});

module.exports = router;