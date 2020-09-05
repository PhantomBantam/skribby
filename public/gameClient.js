const socket = io();
const canvas = document.getElementById('canvas');
const canvasContainer = document.getElementById('canvas-container');
const playerContainer = document.getElementById('player-container');
const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementById('chat-messages');
const toolsContainter = document.getElementById('tools-container');
const wordChooser = document.getElementById("word-chooser");
const wordDisplay = document.getElementById('word-display');
const penWidthSlider = document.getElementById('pen-width');

const word1Btn = document.getElementById('word-1');
const word2Btn = document.getElementById('word-2');
const word3Btn = document.getElementById('word-3');

var penWidth = penWidthSlider.value;

let context = canvas.getContext('2d');
let painting = false;

let currentDrawer = '';
let drawWord = '';
let currentDashes = '';

var urlArr = window.location.href.split('/');
var urlEnd = urlArr[urlArr.length-1];
const code = urlEnd.split('?')[0];
const email = urlEnd.split('?')[1].replace('email=', '');

let penColor = 'black';

let prevMousePos = {};

setToolListeners();

word1Btn.addEventListener('click', setWord);
word2Btn.addEventListener('click', setWord);
word3Btn.addEventListener('click', setWord);

function setWord(e){
  drawWord = (e.target.innerHTML);
  wordChooser.setAttribute('style', 'display:none');
  wordDisplay.innerHTML = drawWord;
  socket.emit('setDrawWord', {drawWord, code});
}

let usersList = [];

socket.emit('joinRoom', {code, email});

//resizing canvas
canvas.height = canvasContainer.offsetHeight;
canvas.width = canvasContainer.offsetWidth;

function draw(e){
  if(painting && currentDrawer == email){
    let mousePos = getMousePos(canvas, e);
    socket.emit('draw', {code, mousePos, color: penColor, email});
  }else {
    return;
  }
}

canvas.addEventListener('mousedown', (e)=>{painting = true;});

canvas.addEventListener('mouseup', (e)=>{
  painting = false
  context.beginPath();
  if(currentDrawer==email){
    socket.emit('liftedMouse');
  }
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

penWidthSlider.addEventListener("click", (e)=>{
  penWidth = e.target.value;
});

canvas.addEventListener('mousemove', draw);

socket.on('startRound', ({word1, word2, word3, rounds})=>{
  alert('Starting Round ' + rounds + "!");
  console.log(currentDrawer + " " + email);
  if(currentDrawer == email){
    console.log('RANNN');
    wordChooser.setAttribute('style', 'display:block');
    word1Btn.innerHTML = word1;
    word2Btn.innerHTML = word2;
    word3Btn.innerHTML = word3;
  } else {
    drawWord = '';
  }
});

socket.on('getDraw', ({mousePos, color})=>{
  context.lineJoin = "round";

  context.beginPath();
  if(prevMousePos.x){
    context.moveTo(prevMousePos.x, prevMousePos.y);
  }
  context.lineTo(mousePos.x, mousePos.y)
  context.closePath();
  context.strokeStyle = color;
  context.lineWidth = penWidth;
  context.stroke();

  prevMousePos.x = mousePos.x;
  prevMousePos.y = mousePos.y;
}); 

socket.on('resetPrevMouse', ()=>{
  prevMousePos = {};
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
  console.log(message);
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
  chatMessages.scrollTo(0,chatMessages.scrollHeight);
}); 

socket.on('notEnoughPlayers', ()=>{
  alert('waiting for players');
  clearCanvas();
});

socket.on('clearCanvas', clearCanvas);

socket.on('setDrawer', ({drawerEmail})=>{
  currentDrawer = drawerEmail;
  if(email == drawerEmail){
    toolsContainter.setAttribute('style', 'display:block');
  }else{
    toolsContainter.setAttribute('style', 'display:none');
  }
});

socket.on('setDashes', ({dashes})=>{
  currentDashes = dashes;
  wordDisplay.innerHTML = dashes;
});

function clearCanvas(){
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function setToolListeners(){
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
  document.getElementById('delete-btn').addEventListener('click', (e)=>{
    clearCanvas();
    socket.emit('clearCanvas', {code});
  });
  
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor(evt.clientX - rect.left),
    y: Math.floor(evt.clientY - rect.top)
  };
}
