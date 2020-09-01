const users = [];

// Join user to chat
function userJoin(id, email, room, nickname) {
  const user = { id, email, room, nickname};
  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(email) {
  return users.find(user => user.email === email);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
};
