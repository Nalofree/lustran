var express = require('express');
var router = express.Router();
var models  = require('../models');

/* GET orders listing. */
router.get('/', function(req, res, next) {
  if (!req.cookies.location) {
    res.redirect('/locations');
  }
  var now = new Date();
  models.orders.findAll({
    include: [models.users, models.locations, /*models.goods,*/{
      model: models.goods,
      as: 'goods',
      include: [{
        model: models.processed,
        as: 'processed',
        include: [models.users,models.locations]
      },{
        model: models.spicdate,
        as: 'spicdate',
        include: [models.users,models.locations]
      },{
        model: models.ordered,
        as: 'ordered',
        include: [models.users,models.locations]
      },{
        model: models.postponed,
        as: 'postponed',
        include: [models.users,models.locations]
      },{
        model: models.callstatus,
        as: 'callstatus',
        include: [models.users,models.locations]
      },{
        model: models.issued,
        as: 'issued',
        include: [models.users,models.locations]
      }]
    }]
  }).then(function (forders) {
    // console.log(forders[0].goods[0]);
    var orderscount = 0;
    var ordersproc = 0;
    var ordersissued = 0;
    var ordersdef = 0;
    for (var i = 0; i < forders.length; i++) {
      orderscount++;
      // orders[i]
      for (var j = 0; j < forders[i].goods.length; j++) {
        if (forders[i].goods[j].processed.statusval == 1) {
          ordersproc++;
        }
        if (forders[i].goods[j].issued.statusval == 1) {
          ordersissued++;
        }
        if (forders[i].goods[j].postponed.statusval == 2) {
          ordersdef++;
        }
      }
    }
    res.render('orders', {title: 'Заказы', orders: forders, orderscount: orderscount, ordersproc: ordersproc, ordersissued: ordersissued, ordersdef: ordersdef});
    // res.send(forders);
  }).catch(function (err) {
    res.send(err);
    console.log('order error: ' + err);
  });
});

router.post('/getgoodhistiry', function (req,res,next) {
  var whereobj = {
    include: [models.users,models.locations],
    where: {
      goodId: req.body.goodid
    }
  };
  models.processed.findAll(whereobj).then(function (processed) {
    models.spicdate.findAll(whereobj).then(function (spicdate) {
      models.ordered.findAll(whereobj).then(function (ordered) {
        models.postponed.findAll(whereobj).then(function (postponed) {
          models.callstatus.findAll(whereobj).then(function (callstatus) {
            models.issued.findAll(whereobj).then(function (issued) {
              var actions = [];
              for (var i = 0; i < processed.length; i++) {
                actions.push(processed[i]);
              }
              for (var i = 0; i < spicdate.length; i++) {
                spicdate[i].alias = spicdate[i].statusval == 0 ? "УД: --.--.--" : "УД: "+spicdate[i].statusval;
                actions.push(spicdate[i]);
              }
              for (var i = 0; i < ordered.length; i++) {
                actions.push(ordered[i]);
              }
              for (var i = 0; i < postponed.length; i++) {
                actions.push(postponed[i]);
              }
              for (var i = 0; i < callstatus.length; i++) {
                actions.push(callstatus[i]);
              }
              for (var i = 0; i < issued.length; i++) {
                actions.push(issued[i]);
              }
              function compareDate(actionA, actionB) {
                return actionA.createdAt - actionB.createdAt;
              };
              actions.sort(compareDate);
              res.send({actions: actions});
            }).catch(function (err) {
              res.send({err: err});
              console.log(err);
            });
          }).catch(function (err) {
            res.send({err: err});
            console.log(err);
          });
        }).catch(function (err) {
          res.send({err: err});
          console.log(err);
        });
      }).catch(function (err) {
        res.send({err: err});
        console.log(err);
      });
    }).catch(function (err) {
      res.send({err: err});
      console.log(err);
    });
  }).catch(function (err) {
    res.send({err: err});
    console.log(err);
  });
});

router.post('/setprocessed', function (req, res, next) {
  // res.send('response');
  models.users.findOne({
    where: {
      pin: req.body.yourpin
    }
  }).then(function (user) {
    if (user) {
      if (user.status == 'saler' || user.status == 'manager') {
        models.goods.findOne({
          include: [models.processed],
          where: {
            id: req.body.goodid
          }
        }).then(function (good) {
          if (good.processed.statusval != 2) {
            var alias = '';
            if (req.body.statusval == 0) {
              alias = 'Не обработан'
            }else{
              alias = 'В обработке'
            }
            models.processed.create({
              statusval: req.body.statusval,
              alias: alias,
              locationId: req.cookies.location,
              userId: user.id
            }).then(function (processed) {
              models.goods.update({
                processedId: processed.id
              },{
                where: {
                  id: req.body.goodid
                }
              }).then(function (goods) {
                res.send({processed: processed, user: user})
              }).catch(function (err) {
                res.send({err: err});
                console.log(err);
              })
            }).catch(function (err) {
              res.send({err: err});
              console.log(err);
            })
          }else{
            res.send({err: 'Заказ уже обработан!'});
          }
        }).catch(function (err) {
          res.send({err: err});
          console.log(err);
        })
      }else{
        res.send({err: 'Недостаточно прав'});
      }
    }else{
      res.send({err: 'Неверный ПИН'});
    }
  }).catch(function (err) {
    res.send({err: err});
    console.log(err);
  })
});

router.post('/setspicdate', function (req, res, next) {
  // res.send('response');
  models.users.findOne({
    where: {
      pin: req.body.yourpin
    }
  }).then(function (user) {
    if (user) {
      if (user.status == 'saler' || user.status == 'manager') {
        models.goods.findOne({
          include: [models.spicdate],
          where: {
            id: req.body.goodid
          }
        }).then(function (good) {
          models.spicdate.create({
            statusval: req.body.statusval,
            locationId: req.cookies.location,
            userId: user.id
          }).then(function (spicdate) {
            models.goods.update({
              spicdateId: spicdate.id
            },{
              where: {
                id: req.body.goodid
              }
            }).then(function (goods) {
              res.send({spicdate: spicdate, user: user})
            }).catch(function (err) {
              res.send({err: err});
              console.log(err);
            })
          }).catch(function (err) {
            res.send({err: err});
            console.log(err);
          })
        }).catch(function (err) {
          res.send({err: err});
          console.log(err);
        })
      }else{
        res.send({err: 'Недостаточно прав'});
      }
    }else{
      res.send({err: 'Неверный ПИН'});
    }
  }).catch(function (err) {
    res.send({err: err});
    console.log(err);
  })
});

module.exports = router;
