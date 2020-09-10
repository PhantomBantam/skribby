const User = require("../models/User");

class UserHandler {
  constructor(){
    this.users = [];
  }
  userJoin(id, email, room, nickname) {
    const user = {id, email, room, nickname, guessed: false, points: 0};
    this.users.push(user);
  
    return user;
  }
  
  getCurrentUser(email) {
    return this.users.find(user => user.email === email);
  }
  
  userLeave(id) {
    const index = this.users.findIndex(user => user.id === id);
  
    if (index !== -1) {
      return this.users.splice(index, 1)[0];
    }
  }

  setGuessed(email, guessed, points){
    const index = this.users.findIndex(user => user.email === email);
  
    if (index !== -1) {
      if(guessed){
        this.users[index].points+=points;
      }else{
        this.users[index].points = 0;
      }
      this.users[index].guessed = guessed;
    }
  }

  getRoomUsers(room) {
    return this.users.filter(user => user.room === room);
  }
}


module.exports = new UserHandler();
