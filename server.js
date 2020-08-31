const express = require('express');
const http = require('http');
const sockets = require('./socketio');
const path = require('path');
const layouts = require('express-ejs-layouts');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const FileStore = require('session-file-store') (session);
const mongoose = require('mongoose');
const flash = require('connect-flash');

require('dotenv').config();
require('./config/passport');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
sockets.connect(server);

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(layouts);
app.set('view engine', 'ejs');

app.use(session({
  genid: function(req){
    return uuidv4();
  },
  store: new FileStore(),
  secret: process.env.SESSION_SECRET,
  saveUninitialized:true,
  resave:false,
  maxAge: 1000*60*60*24
}));

app.use(flash());
app.use((req, res, next)=>{
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

const games = require('./routes/games');
const users = require('./routes/users');
const dashboard = require('./routes/dashboard');

app.use('/games', games);
app.use('/users', users);
app.use('/dashboard', dashboard);


server.listen(PORT, ()=>{console.log('SERVER RUNNING ON PORT: ' + PORT);});
