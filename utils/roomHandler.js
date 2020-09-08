class RoomHandler {
  constructor(){
    this.drawUsers = [];
    this.rounds = [];
    this.roundTimers = [];
    this.intervals = [];
    this.drawings = [];
  }

  setDrawUser(email, room) {
    const user = {email, room};    
    const index = this.drawUsers.findIndex(user => user.room === room);

    if (index !== -1) {
      this.drawUsers[index] = user;
    }else{
      this.drawUsers.push(user);
    }
    return user;
  }

  setRoundTimer(seconds, room) {
    let timer = {seconds, room};
    this.roundTimers.push(timer);
    return timer;
  }

  addInterval(interval, code){
    this.intervals.push({interval, code});
  }

  decrementTimer(room){
    const index = this.roundTimers.findIndex(user => user.room === room);

    if (index !== -1) {
      this.roundTimers[index].seconds--;
      return this.roundTimers[index].seconds;
    }
  }
  
  getDrawUser(room) {
    return this.drawUsers.find(user => user.room === room);
  }
  
  deleteDrawUser(room) {
    const index = this.drawUsers.findIndex(user => user.room === room);

    if (index !== -1) {
      return this.drawUsers.splice(index, 1)[0];
    }
  }
  
  addPixel(x, y, penWidth, color, code){
    let drawing = this.drawings.find(drawing => drawing.room === code);
    if (typeof drawing != 'undefined') {
      drawing.drawing.push({x, y, penWidth, color});
    } else{
      this.drawings.push({drawing:[{x, y, penWidth, color}], room: code});
    }
  }

  getDrawing(code){
    return this.drawings.find(drawing => drawing.room === code);
  }

  clearDrawing(code){
    let drawing = this.drawings.find(drawing => drawing.room === code);
    if (typeof drawing != 'undefined') {
      drawing.drawing = [];
    } 
  }
}

module.exports = new RoomHandler();