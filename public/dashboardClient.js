const socket = io();
const createGameBtn = document.getElementById('create-game-btn');

var userInfo;

fetch('./api/user_data')
  .then(response=>response.json())
  .then(data=>{
    userInfo = data
    socket.emit('start', userInfo);
  })
  .catch(err=>console.log(err));npm

createGameBtn.addEventListener('click', (e)=>{
  socket.emit('createGame');
});

socket.on('createdNewGame', ({id})=>{
  alert('Your game has been created with code: ' + id);
});

