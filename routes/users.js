const express = require('express');

const router = express.Router();

router.get('/login', (req, res)=>{
  res.render('login');
});

router.get('/reg', (req, res)=>{
  res.render('reg');
});

router.get('/reset', (req, res)=>{
  res.render('reset');
});

router.get('/forgot', (req, res)=>{
  res.render('forgot');
});





module.exports = router;