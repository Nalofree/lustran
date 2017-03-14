var express = require('express');
var cookieSession = require('cookie-session');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('login', {title:'Войти в систему'});
});

router.post('/', function(req, res, next) {
  // res.render('login', {title:'Войти в систему'});
  if (req.body.pass === 'RC7Fv2NdhW') {
    req.session.isauth = '1';
    req.cookies.isauth = '1';
    // res.redirect('/');
  }else{
    req.session.isauth = false;
  }
  res.send({isauth: req.cookies.isauth});
});

module.exports = router;
