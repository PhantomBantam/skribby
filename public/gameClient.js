const socket = io();
const canvas = document.getElementById('canvas');
const canvasContainer = document.getElementById('canvas-container');

var penWidth = 10;

let context = canvas.getContext('2d');
let painting = false;

var urlArr = window.location.href.split('/');
var urlEnd = urlArr[urlArr.length-1];
const code = urlEnd.split('?')[0];
const nickname = urlEnd.split('?')[1].replace('nickname=', '');

socket.emit('joinRoom', {code, nickname});


//resizing canvas
canvas.height = canvasContainer.offsetHeight;
canvas.width = canvasContainer.offsetWidth;

function draw(e){
  if(painting){
    let mousePos = getMousePos(canvas, e);
    
    context.lineWidth = penWidth;
    context.lineCap = "round";
    context.lineTo(mousePos.x, mousePos.y);
    socket.emit('draw', {mousePos});

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


function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor(evt.clientX - rect.left),
    y: Math.floor(evt.clientY - rect.top)
  };
}
