const socket = io();
const canvas = document.getElementById('canvas');
const canvasContainer = document.getElementById('canvas-container');
const playerContainer = document.getElementById('player-container');

var penWidth = 10;

let context = canvas.getContext('2d');
let painting = false;

var urlArr = window.location.href.split('/');
var urlEnd = urlArr[urlArr.length-1];
const code = urlEnd.split('?')[0];
const email = urlEnd.split('?')[1].replace('email=', '');

let usersList = [];

socket.emit('joinRoom', {code, email});


//resizing canvas
canvas.height = canvasContainer.offsetHeight;
canvas.width = canvasContainer.offsetWidth;

function draw(e){
  if(painting){
    let mousePos = getMousePos(canvas, e);
    
    context.lineWidth = penWidth;
    context.lineCap = "round";
    context.lineTo(mousePos.x, mousePos.y);
    socket.emit('draw', {code, mousePos});

    context.stroke();
  }else {
    return;
  }
}
canvas.addEventListener('mousedown', (e)=>{painting = true;});

canvas.addEventListener('mouseup', (e)=>{
  painting = false
  context.beginPath();
});
canvas.addEventListener('mouseleave', (e)=>{
  painting = false
  context.beginPath();
});

canvas.addEventListener('mousemove', draw);

socket.on('data', ({word1, word2, word3})=>{
  console.log(word1);
  console.log(word2);
  console.log(word3);
});

socket.on('getDraw', ({mousePos})=>{
  context.lineWidth = penWidth;
  context.lineCap = "round";
  context.lineTo(mousePos.x, mousePos.y);
  context.stroke();
}); 

socket.on('userList', ({users})=>{
  usersList = users;
  playerContainer.innerHTML = '';
  users.forEach(user => {
    let div = document.createElement('div');

    div.setAttribute('class', 'player');
    div.innerHTML = user.nickname;
    
    playerContainer.appendChild(div);  
  });
});

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor(evt.clientX - rect.left),
    y: Math.floor(evt.clientY - rect.top)
  };
}
