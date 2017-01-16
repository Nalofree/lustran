var express = require('express');
var router = express.Router();
var models  = require('../models');

router.get('/', function(req, res) {
  models.locations.findAll().then(function(locations) {
    res.render('locations', {locations:locations, title: "Места"});
  });
});

router.post('/', function(req, res, next) {
  models.users.findOne({
    where: {
      pin: req.body.yourpin
    }
  }).then(function(user) {
    if (user) {
      if (user.status == 'manager') {
        models.locations.create({
          fullname: req.body.fullname,
          opentime: req.body.opentime,
          closetime: req.body.closetime,
          password: req.body.password,
          alias: req.body.alias,
          adres: req.body.adres
        }).then(function (location) {
          res.send({err: false, location: location});
        }).catch(function (err) {
          res.send(err);
        })
      }else{
        res.send({err: 'Недостаточно прав, обратитесь к руководителю'});
      }
    }else{
      res.send({err: 'Не верный ПИН'});
    }
  }).catch(function (err) {
    res.send({err:err});
    console.log(err);
  });
});

module.exports = router;


// var express = require('express');
// var router = express.Router();
// var Sequelize = require('sequelize');
//
// var sequelize = new Sequelize('heroku_a5572bedbd1fbe3', 'b816998663244e', 'b23209db', {
//   host: 'eu-cdbr-west-01.cleardb.com',
//   dialect: 'mysql',
//   logging: true
//   // storage: 'path/to/database.sqlite'
// });
//
// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   // res.send('respond with a resource');
//   // res.send('respond with a resource');
//   sequelize.authenticate().then(function() {
//       console.log('Connect to DB created!');
//       // res.send('Connect to DB created!');
//       var locations = sequelize.define('locations', {
//         id: {
//             type: Sequelize.INTEGER,
//             primaryKey: true,
//             autoIncrement: true
//         },
//         name: Sequelize.TEXT
//       });
//       locations.sync().then(function() {
//         console.log('Success!');
//         locations.findAll().then(function (locations) {
//           res.render('locations', {locations:locations, title: "Места"});
//         }).catch(function () {
//           console.log('locations err: ' + users);
//           res.send('locations err: ' + users);
//         })
//       }).catch(function(err) {
//         console.log('Database error: ' + err);
//         res.send('Database error: ' + err);
//       });
//   }).catch(function(err) {
//       console.log('Connection error: ' + err);
//       res.send('Connection error: ' + err);
//   });
// });
//
// router.post('/', function(req, res, next) {
//   // res.send('respond with a resource');
//   // res.render('locations');
//   sequelize.authenticate().then(function() {
//       console.log('Connect to DB created!');
//       // res.send('Connect to DB created!');
//       var locations = sequelize.define('locations', {
//         id: {
//             type: Sequelize.INTEGER,
//             primaryKey: true,
//             autoIncrement: true
//         },
//         name: Sequelize.TEXT
//       });
//       var users = sequelize.define('users', {
//         id: {
//             type: Sequelize.INTEGER,
//             primaryKey: true,
//             autoIncrement: true
//         },
//         name: Sequelize.TEXT,
//         pin: Sequelize.TEXT,
//         status: Sequelize.TEXT,
//         active: {
//             type: Sequelize.INTEGER,
//             defaultValue: 1
//         }
//       });
//       users.sync().then(function() {
//         console.log('Success!');
//         users.findOne({
//           where: {
//             pin: req.body.yourpin
//           }
//         }).then(function (fuser) {
//           if (fuser) {
//             if (fuser.status == "manager") {
//                 locations.sync().then(function() {
//                   console.log('Success!');
//                   locations.create({
//                     name: req.body.name
//                   }).then(function (locations) {
//                     res.send({err: false, locations: locations});
//                   }).catch(function () {
//                     console.log('Users err: ' + locations);
//                     res.send('Users err: ' + locations);
//                   });
//                 }).catch(function(err) {
//                   console.log('Database error: ' + err);
//                   res.send('Database error: ' + err);
//                 });
//             }else{
//               res.send({err: 'Ошибка прав доступа, недостаточно прав'});
//             }
//           }else{
//             res.send({err: 'Неверный пин'});
//           }
//         }).catch(function (fuser) {
//           console.log('Users err: ' + fuser);
//           res.send('Users err: ' + fuser);
//         });
//       }).catch(function(err) {
//         console.log('Database error: ' + err);
//         res.send('Database error: ' + err);
//       });
//   }).catch(function(err) {
//       console.log('Connection error: ' + err);
//       res.send('Connection error: ' + err);
//   });
// });

router.post('/delloc', function(req, res, next) {
  models.users.findOne({
    where: {
      pin: req.body.yourpin
    }
  }).then(function(user) {
    if (user) {
      if (user.status == 'manager') {
        models.locations.destroy({
          where: {
            id: req.body.id
          }
        }).then(function (location) {
          res.send({err: false, location: location})
        })
      }else{
        res.send({err: 'Недостаточно прав, обратитесь к руководителю'});
      }
    }else{
      res.send({err: 'Не верный ПИН'});
    }
  }).catch(function (err) {
    res.send({err:err});
    console.log(err);
  });
});
module.exports = router;
