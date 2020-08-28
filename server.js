const express = require('express');
const http = require('http');
const sockets = require('./socketio');
const path = require('path');
const layouts = require('express-ejs-layouts');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
sockets.connect(server);

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(layouts);
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

const games = require('./routes/games');
const users = require('./routes/users');
const dashboard = require('./routes/dashboard');

app.use('/games', games);
app.use('/users', users);
app.use('/dashboard', dashboard);


server.listen(PORT, ()=>{console.log('SERVER RUNNING ON PORT: ' + PORT);});
