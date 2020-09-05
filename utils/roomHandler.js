class RoomHandler {
  constructor(){
    this.drawUsers = [];
    this.rounds = [];
  }
  setDrawUser(email, room) {
    const user = {email, room};
    this.drawUsers.push(user);
    return user;
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
  
}

module.exports = new RoomHandler();