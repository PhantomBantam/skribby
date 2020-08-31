const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
var User = require('../models/User.js');

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {    
    const user = await User.findOne({email:email});

    if(user!=null){
      bcrypt.compare(password, user.password, function(err, result) {
        if (result){
          return done(null, user, {message:'ok'})
        }else {
          return done(null, false, { message: 'Incorrect password.' });
        }
      });
    }else{
      return done(null, false, { message: 'Email not found.' });
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  await User.findById(id, (err, user)=>{
    done(err, user);
  });
});

