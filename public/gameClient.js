const socket = io();
const canvas = document.getElementById('canvas');
const canvasContainer = document.getElementById('canvas-container');

window.addEventListener('load', ()=>{
  let context = canvas.getContext('2d');
  let painting = false;

  //resizing canvas
  canvas.height = canvasContainer.offsetHeight;
  canvas.width = canvasContainer.offsetWidth;
  
  function draw(e){
    if(painting){
      let {x, y} = getMousePos(canvas, e);
      
      context.lineWidth = 10;
      context.lineCap = "round";
      context.lineTo(x, y);
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
});

socket.on('data', ({word1, word2, word3})=>{


  console.log(word1);
  console.log(word2);
  console.log(word3);
})


function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}
