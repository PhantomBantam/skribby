const socket = io();
const createGameBtn = document.getElementById('create-game-btn');
const gameCodeInput = document.getElementById('game-code-input');
const joinBtn = document.getElementById('join-btn');

var userInfo;

fetch('./api/user_data')
  .then(response=>response.json())
  .then(data=>{
    userInfo = data.user
    socket.emit('start', userInfo);
  })
  .catch(err=>console.log(err));

createGameBtn.addEventListener('click', (e)=>{
  socket.emit('createGame');
});

joinBtn.addEventListener('click', (e)=>{
  socket.emit('joinGame', {code:gameCodeInput.value});
});
    
socket.on('createdNewGame', ({id})=>{
  alert('Your game has been created with code: ' + id);
});

socket.on('game', ({game})=>{
  if(game==null){
    alert("Game not found");
  }else{
    window.location.href = '/games/' + game.code + "?email="+userInfo.email;
  }
})
