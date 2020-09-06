class WordsHandler {
  constructor(){
    this.words = [];
  }
  addWord(word, room) {
    const index = this.words.findIndex(word => word.room === room);
    if (index !== -1) {
       this.words.splice(index, 1)[0];
    }
    const temp = {word, room};
    this.words.push(temp);  
      
    return temp;
  }

  // Get current user
  getWord(room) {
    return this.words.find(word => word.room === room);
  }
  
  // User leaves chat
  deleteWord(room) {
    const index = this.words.findIndex(word => word.room === room);
    if (index !== -1) {
      return this.words.splice(index, 1)[0];
    }
  }
  }


module.exports = new WordsHandler();