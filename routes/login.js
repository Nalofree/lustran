var express = require('express');
var cookieSession = require('cookie-session');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('login', {title:'Войти в систему'});
});

router.post('/', function(req, res, next) {
  // res.render('login', {title:'Войти в систему'});
  if (req.body.pass === 'Kz1tqeesMz') {
    req.session.isauth = '1';
    // res.redirect('/');
  }else{
    req.session.isauth = false;
  }
  res.send({isauth: req.session.isauth});
});

module.exports = router;