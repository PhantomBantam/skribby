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
const timer = document.getElementById('timer');

const word1Btn = document.getElementById('word-1');
const word2Btn = document.getElementById('word-2');
const word3Btn = document.getElementById('word-3');

let context = canvas.getContext('2d');
let painting = false;

let currentDrawer = '';
let drawWord = '';
let currentDashes = '';
let prevMousePos = {};
let usersList = [];

var urlArr = window.location.href.split('/');
var urlEnd = urlArr[urlArr.length-1];
const code = urlEnd.split('?')[0];
const email = urlEnd.split('?')[1].replace('email=', '');
let penColor = 'black';

socket.emit('joinRoom', {code, email});

//resizing canvas
canvas.height = canvasContainer.offsetHeight;
canvas.width = canvasContainer.offsetWidth;

setToolListeners();


word1Btn.addEventListener('click', setWord);
word2Btn.addEventListener('click', setWord);
word3Btn.addEventListener('click', setWord);

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
  if(currentDrawer==email){
    socket.emit('liftedMouse');
  }
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

socket.on('startRound', ({word1, word2, word3, rounds})=>{
  alert('Starting Round ' + rounds + "!");
  if(currentDrawer == email){
    wordChooser.setAttribute('style', 'display:block');
    word1Btn.innerHTML = word1;
    word2Btn.innerHTML = word2;
    word3Btn.innerHTML = word3;
  } else {
    drawWord = '';
  }
});

socket.on('getDraw', ({mousePos, color, penWidth})=>{
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
    
    let pointsDiv = document.createElement('div');
    pointsDiv.setAttribute('class', 'points');
    pointsDiv.innerHTML = 'Points - 0';

    div.appendChild(pointsDiv);
    
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
  console.log(dashes);
  currentDashes = dashes;
  wordDisplay.innerHTML = dashes;
});

socket.on('correctGuess', ({message})=>{
  let div = document.createElement('div');
  div.setAttribute('class', 'message correct');
  div.innerHTML = message;
  chatMessages.appendChild(div);    
  chatMessages.scrollTo(0,chatMessages.scrollHeight);  
});

socket.on('giveFullDrawing', ({drawing})=>{
  for(var i = 1; i<drawing.drawing.length; i++){
    if(drawing.drawing[i-1].color!='lifted' && drawing.drawing[i].color!='lifted'){
      context.lineJoin = "round";
      context.beginPath();  
      context.moveTo(drawing.drawing[i-1].x, drawing.drawing[i-1].y);
      console.log(drawing.drawing[i-1].color);
      context.lineTo(drawing.drawing[i].x, drawing.drawing[i].y)
      context.closePath();
      context.strokeStyle = drawing.drawing[i].color;
      context.lineWidth = drawing.drawing[i].penWidth;
      context.stroke();    
    }
  }
});

socket.on('time', ({time})=>{
  console.log(time);
  timer.innerHTML = 'Time Left: ' + time;
})

socket.on('autoWord', ({word, user})=>{
  if(user==email){
    drawWord = word;
    wordChooser.setAttribute('style', 'display:none');
    wordDisplay.innerHTML = word;
    socket.emit('setDrawWord', {drawWord:word, code});  
  }
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

function draw(e){
  if(painting && currentDrawer == email){
    let mousePos = getMousePos(canvas, e);
    socket.emit('draw', {code, mousePos, color: penColor, penWidth: penWidthSlider.value});
  }else {
    return;
  }
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor(evt.clientX - rect.left),
    y: Math.floor(evt.clientY - rect.top)
  };
}

function setWord(e){
  drawWord = (e.target.innerHTML);
  wordChooser.setAttribute('style', 'display:none');
  wordDisplay.innerHTML = drawWord;
  socket.emit('setDrawWord', {drawWord, code});
}

