class RoomHandler {
  constructor(){
    this.drawUsers = [];
    this.rounds = [];
    this.roundTimers = [];
    this.intervals = [];
    this.drawings = [];
    this.dashes = [];
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
    const index = this.roundTimers.findIndex(timer => timer.room === room);

    if (index !== -1) {
      this.roundTimers[index] = timer;
    }else{
      this.roundTimers.push(timer);
    }
    return timer;
  }

  setDashes(newDash, room) {
    let dash = {newDash, room};
    const index = this.dashes.findIndex(d => d.room === room);

    if (index !== -1) {
      this.dashes[index] = dash;
    }else{
      this.dashes.push(dash);
    }
    return dash;
  }

  getDash(room) {
    return this.dashes.find(dash => dash.room === room);
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

  getTime(room) {
    return this.roundTimers.find(timer => timer.room === room);
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