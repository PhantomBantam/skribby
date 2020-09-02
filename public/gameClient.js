const socket = io();
const canvas = document.getElementById('canvas');
const canvasContainer = document.getElementById('canvas-container');
const playerContainer = document.getElementById('player-container');
const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementById('chat-messages');

var penWidth = 10;

let context = canvas.getContext('2d');
let painting = false;

var urlArr = window.location.href.split('/');
var urlEnd = urlArr[urlArr.length-1];
const code = urlEnd.split('?')[0];
const email = urlEnd.split('?')[1].replace('email=', '');

let penColor = 'black';
document.getElementById('red-btn').addEventListener('click', (e)=>{
  penColor = 'red';
});
document.getElementById('orange-btn').addEventListener('click', (e)=>{
  penColor = 'orange';
});
document.getElementById('yellow-btn').addEventListener('click', (e)=>{
  penColor = 'yellow';
});
document.getElementById('green-btn').addEventListener('click', (e)=>{
  penColor = 'green';
});
document.getElementById('blue-btn').addEventListener('click', (e)=>{
  penColor = 'blue';
});
document.getElementById('purple-btn').addEventListener('click', (e)=>{
  penColor = 'purple';
});
document.getElementById('white-btn').addEventListener('click', (e)=>{
  penColor = 'white';
});
document.getElementById('black-btn').addEventListener('click', (e)=>{
  penColor = 'black';
});


let usersList = [];

socket.emit('joinRoom', {code, email});

//resizing canvas
canvas.height = canvasContainer.offsetHeight;
canvas.width = canvasContainer.offsetWidth;

function draw(e){
  if(painting){
    let mousePos = getMousePos(canvas, e);
    context.strokeStyle = penColor;
    context.lineWidth = penWidth;
    context.lineCap = "round";
    context.lineTo(mousePos.x, mousePos.y);
    socket.emit('draw', {code, mousePos, color: penColor});

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

chatForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  let message = (e.target.children[0].value);

  if(message!=''){
    e.target.elements.msg.value = "";
    socket.emit('chatMessage', {code, message, email});
  }
});

canvas.addEventListener('mousemove', draw);

socket.on('data', ({word1, word2, word3})=>{
  console.log(word1);
  console.log(word2);
  console.log(word3);
});

socket.on('getDraw', ({mousePos, color})=>{

  console.log('HEY');
  console.log(color);
  context.strokeStyle = color;
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

socket.on('sendMessage', ({message, nickname, messageWhite})=>{
  let div = document.createElement('div');
  if(messageWhite){
    div.setAttribute('class', 'message white');
  }else{
    div.setAttribute('class', 'message');
  }
  console.log(nickname);
  let current = div.getAttribute('class');

  switch(nickname){
    case 'leave': 
      div.innerHTML = message;
      div.setAttribute('class', current + " leaveMsg");
      break;

    case 'join': 
      div.innerHTML = message;
      div.setAttribute('class', current + " joinMsg");
      break;

    
    default: 
      div.innerHTML = nickname + ": " +  message;
    
  }
  chatMessages.appendChild(div);    
}); 

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor(evt.clientX - rect.left),
    y: Math.floor(evt.clientY - rect.top)
  };
}
