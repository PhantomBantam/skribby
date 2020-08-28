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
      context.lineWidth = 10;
      context.lineCap = "round";
      context.lineTo(e.clientX - canvasContainer.offsetLeft-20,
         e.clientY - canvasContainer.offsetTop-10);
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

