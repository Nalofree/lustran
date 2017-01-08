var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');

var index = require('./routes/index');
var orders = require('./routes/orders');
var addorder = require('./routes/addorder');
var locations = require('./routes/locations');
var accesserror = require('./routes/accesserror');
var users = require('./routes/users');
var pinauth = require('./routes/pinauth');
var getloc = require('./routes/getloc');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var sequelize = new Sequelize('heroku_a5572bedbd1fbe3', 'b816998663244e', 'b23209db', {
  host: 'eu-cdbr-west-01.cleardb.com',
  dialect: 'mysql',
  logging: true
  // storage: 'path/to/database.sqlite'
});

sequelize.authenticate().then(function() {
    console.log('Connect to DB created!');
}).catch(function(err) {
    console.log('Connection error: ' + err);
});

app.use('/', index);
app.use('/orders', orders);
app.use('/addorder', addorder);
app.use('/locations', locations);
app.use('/accesserror', accesserror);
app.use('/users', users);
app.use('/pinauth', pinauth);
app.use('/getloc', getloc);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
