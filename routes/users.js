const express = require('express');
const User = require('../models/User');
const router = express.Router();
const passport = require('passport');


router.use(passport.initialize());
router.use(passport.session());

router.get('/login', (req, res)=>{
  res.render('login');
});

router.get('/register', (req, res)=>{
  res.render('register');
});

router.get('/forgot', (req, res)=>{
  res.render('forgot');
});

//handle post requests
router.post('/login', async (req, res, next)=>{
  let userData = req.body;
  passport.authenticate('local', (err, user, info) => {
    if(info.message == "ok"){
      req.login(user, (err) => {    
        res.render('dashboard', {nickname:user.nickname});
      })  
    } else{
      res.render('login', {
        email:userData.email,
        errors: [{msg: info.message}] 
      })
    }

  })(req, res, next);
});

router.post('/register', async (req, res)=>{
  let userData = req.body;
  let errors = await checkFields(userData.password1, userData.password2, userData.email);
  if(errors.length==0){
    let user = new User({
      email:userData.email,
      nickname:userData.nickname,
      password:userData.password1
    });

    //Password hashing is done by schema
    await user.save();
    req.flash('success_msg', 'You are registered and can now login');
    req.flash('error_msg', '');

    res.redirect("/users/login");
  }else{
    res.render('register', {
      errors,
      email: userData.email,
      password: userData.password1,
      password2: userData.password2
    });  
  }
});

router.post('/forgot', async (req, res)=>{
  try{
    let token = await crypto.randomBytes(8).toString('hex');
    let userInfo = req.body;
  
    let data = await User.updateOne({email:userInfo.email}, {$set:{
      resetPasswordToken:token,
      resetPasswordExpires: Date.now() + 3600000
    }})

    if(data.n===0){
      req.flash('error_msg', 'No account with that email address exists.');
      return res.redirect('./forgot');
    }

    let transporter  = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });    
    

    //ip of local host to act as a domain url
    let ip = '192.168.1.5' + ':3000';

    var mailOptions = {
      to: userInfo.email,
      from: 'thegreatman@great.the',
      subject: 'Scheduler Password Reset',
      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your Scheduler account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + ip + '/users/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };

    transporter.sendMail(mailOptions, (err)=> {
      if(err){
        req.flash('error_msg', 'An error has occured.');
        res.redirect('./forgot');  

        console.log(err);
      }else{
        req.flash('success_msg', 'An e-mail has been sent to ' + userInfo.email + ' with further instructions.');
        res.redirect('./forgot');  
      }
    });    
  }catch(err){
    console.log(err);
    res.render('forgot', {errors:[{msg:'An error has occured please try again later.'}]});
  }
});

router.post('/reset/:token', async (req, res)=>{
  try{
    var SALT_FACTOR = 5;
    let errors = [];

    if(req.body.password1.length<6){
      errors.push({msg:"Password must be at least 6 characters long"});
    }else if(req.body.password1 != req.body.password2){
      errors.push({msg:"Passwords do not match!"});
    }
    
    if(errors.length==0){
      bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        bcrypt.hash(req.body.password1, salt, async function(err, hash) {
  
          if(!err){
            let data = await User.updateOne({ resetPasswordToken: req.params.token, 
              resetPasswordExpires: { $gt: Date.now() }}, {$set:{
                password:hash,
                resetPasswordToken:undefined,
                resetPasswordExpires:undefined
              }});
            if (data.n === 0) {
              req.flash('error', 'Password reset token is invalid or has expired.');
              return res.redirect('back');
            }
        
            req.flash('success_msg', 'Success! Your password has been changed.');
            res.redirect('/users/login');
          }
        });
      });  
    }else{
      req.flash('error_msg', errors[0].msg);
      res.redirect('/users/reset/' + req.params.token);
    }
  }catch(err){
    res.render('reset', {errors:[{msg:'An error has occured please try again later.'}]});
  }
});

router.get('/api/user_data', (req, res)=>{
  if(req.user === undefined){
    res.json({});
  }else{
    res.json({
      user: req.user
    });
  }
});

router.get('/logout', (req, res)=>{
  req.logout();
  req.flash('success_msg', 'You have logged out');

  res.redirect('/users/login');
});

async function checkFields(pass1, pass2, email){
  let errors = [];
  if(pass1.length<6){
    errors.push({msg:"Password must be at least 6 characters long"});
  }else if(pass1 != pass2){
    errors.push({msg:"Passwords do not match!"});
  }

  if(errors.length == 0){
    let found = await User.findOne({email:email});

    if(found!=null){
      errors.push({msg:"Email already in use!"});
    }
  }
  return errors;
}

const dashboard = require('./dashboard');
router.use('/dashboard', dashboard);


module.exports = router;