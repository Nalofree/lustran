var express = require('express');
var router = express.Router();
var models  = require('../models');

function getDateSuperReadeble(date){
	var readebleTime;//1998-02-03 22:23:00
	var year = date.getFullYear();
			readebleTime = ('00' + date.getDate()).slice(-2) + '.' +
			('00' + (date.getMonth()+1)).slice(-2) + '.' +
			year;
			return readebleTime;
};

/* GET orders listing. */
router.get('/', function(req, res, next) {
	if (!req.session.isauth) {
		res.redirect('/login');
	}
  if (!req.cookies.location) {
    res.redirect('/locations');
  }
	// console.log(req.query);
	var searchWhereGoods = {
		$or: []
	};
	var searchWhereOrders = {
		$or: []
	};
	if (req.query.search) {
		var searchstring = req.query.search;
	  searchstring = searchstring.replace(/[/.,!?;]*/g, '');
	  searchstring = searchstring.replace(/[\s]+/g," ");
		searchsarray = searchstring.split(' ');
		for (var i = 0; i < searchsarray.length; i++) {
			searchWhereOrders.$or.push({'$goods.name$': {$like: '%'+searchsarray[i]+'%'}});
			searchWhereOrders.$or.push({'$goods.vencode$': {$like: '%'+searchsarray[i]+'%'}});
			searchWhereOrders.$or.push({number: {$like: '%'+searchsarray[i]+'%'}});
			searchWhereOrders.$or.push({customerphone: {$like: '%'+searchsarray[i]+'%'}});
			searchWhereOrders.$or.push({customername: {$like: '%'+searchsarray[i]+'%'}});
		}
		console.log(searchWhereGoods.$or);
	}else{
		searchWhereGoods = {};
		searchWhereOrders = {};
	}

	if (req.query.processed || req.query.oredered || req.query.postponed || req.query.callstatus || req.query.issued || req.query.spicdate) { //processed=&oredered=&postponed=&callstatus=&issued=&spicdate=on
		// console.log("PROCESSED: " + req.query.processed);
		searchWhereOrders = {
			$and: []
		};
		if (req.query.processed) {
			searchWhereOrders.$and.push({'$goods.processed.statusval$': parseInt(req.query.processed)});
		}
		if (req.query.oredered) {
			searchWhereOrders.$and.push({'$goods.ordered.statusval$': parseInt(req.query.oredered)});
		}
		if (req.query.postponed) {
			searchWhereOrders.$and.push({'$goods.postponed.statusval$': parseInt(req.query.postponed)});
		}
		if (req.query.callstatus) {
			searchWhereOrders.$and.push({'$goods.callstatus.statusval$': parseInt(req.query.callstatus)});
		}
		if (req.query.issued) {
			searchWhereOrders.$and.push({'$goods.issued.statusval$': parseInt(req.query.issued)});
		}
		if (req.query.spicdate) {
			searchWhereOrders.$and.push({'$goods.spicdate.statusval$': {$ne: null}});
		}
	}else{
		searchWhereOrders = {};
	}
  var now = new Date();
  models.orders.findAll({
    include: [models.users, models.locations, /*models.goods,*/{
      model: models.goods,
			// where: searchWhereGoods,
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
    }],
		where: searchWhereOrders
		// where: {
		// 	$or: [{
		// 		'$goods.name$': {
		// 			$like: 'Товар'
		// 		}
		// 	}]
		// }
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
                spicdate[i].alias = spicdate[i].statusval == null ? "УД: --.--.--" : "УД: "+getDateSuperReadeble(spicdate[i].statusval);
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
      if (user.status == 'supplier' || user.status == 'manager') {
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
							comment: req.body.comment,
              alias: alias,
              locationId: req.cookies.location,
              userId: user.id,
              goodId: req.body.goodid
            }).then(function (processed) {
              models.goods.update({
                processedId: processed.id
              },{
                where: {
                  id: req.body.goodid
                }
              }).then(function (good) {
								models.goods.findAll({
									include: [models.processed],
									where: {
				            '$processed.statusval$': 1
				          }
								}).then(function (goods) {
									res.send({processed: processed, user: user, pcount: goods.length});
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
      if (user.status == 'supplier' || user.status == 'manager') {
        models.goods.findOne({
          include: [models.spicdate, models.processed],
          where: {
            id: req.body.goodid
          }
        }).then(function (good) {
          if (good.processed.statusval == 1) {
            models.spicdate.create({
              statusval: req.body.statusval,
							comment: req.body.comment,
              locationId: req.cookies.location,
              userId: user.id,
              goodId: req.body.goodid
            }).then(function (spicdate) {
              models.goods.update({
                spicdateId: spicdate.id
              },{
                where: {
                  id: req.body.goodid
                }
              }).then(function (goods) {
                models.processed.create({
                  statusval: 2,
                  alias: 'Обработан',
                  locationId: req.cookies.location,
                  userId: user.id,
                  goodId: req.body.goodid
                }).then(function (processed) {
                  models.goods.update({
                    processedId: processed.id
                  },{
                    where: {
                      id: req.body.goodid
                    }
                  }).then(function (goods) {
                    res.send({spicdate: spicdate, user: user});
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
          }else{
            res.send({err: 'Поставьте товар в обработку!'});
          }
        }).catch(function (err) {
          res.send({err: err});
          console.log(err);
        });
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

router.post('/setordered', function (req, res, next) {
  // res.send('response');
  models.users.findOne({
    where: {
      pin: req.body.yourpin
    }
  }).then(function (user) {
    if (user) {
      if (user.status == 'supplier' || user.status == 'manager') {
        models.goods.findOne({
          include: [models.ordered, models.processed],
          where: {
            id: req.body.goodid
          }
        }).then(function (good) {
          if (good.processed.statusval == 2) {
            var alias;
            if (req.body.statusval == 0) {
              alias = 'Не заказан'
            }else{
              alias = 'Заказан'
            }
            models.ordered.create({
              statusval: req.body.statusval,
							comment: req.body.comment,
              alias: alias,
              locationId: req.cookies.location,
              userId: user.id,
              goodId: req.body.goodid
            }).then(function (ordered) {
              models.goods.update({
                orderedId: ordered.id
              },{
                where: {
                  id: req.body.goodid
                }
              }).then(function (goods) {
                res.send({ordered: ordered, user: user})
              }).catch(function (err) {
                res.send({err: err});
                console.log('update goods',err);
              })
            }).catch(function (err) {
              res.send({err: err});
              console.log('ordered',err);
            });
          }else{
            res.send({err: 'Поставьте товар в обработку и уточните дату!'});
          }
        }).catch(function (err) {
          res.send({err: err});
          console.log('goods',err);
        })
      }else{
        res.send({err: 'Недостаточно прав'});
      }
    }else{
      res.send({err: 'Неверный ПИН'});
    }
  }).catch(function (err) {
    res.send({err: err});
    console.log('user',err);
  })
});

router.post('/setpostponed', function (req, res, next) {
  // res.send('response');
  models.users.findOne({
    where: {
      pin: req.body.yourpin
    }
  }).then(function (user) {
    if (user) {
      if (user.status == 'saler' || user.status == 'manager') {
        models.goods.findOne({
          include: [models.postponed, models.ordered],
          where: {
            id: req.body.goodid
          }
        }).then(function (good) {
          var alias;
          if (req.body.statusval == 0) {
            alias = 'Не отложен';
          }else if(req.body.statusval == 1){
            alias = 'Отложен';
          }else{
            alias = 'Есть деффект';
          }
					// console.log("models.ordered.statusval: "+goods.ordered.statusval);
          if (good.ordered.statusval == 1) {
            models.postponed.create({
              statusval: req.body.statusval,
							comment: req.body.comment,
              alias: alias,
              locationId: req.cookies.location,
              userId: user.id,
              goodId: req.body.goodid
            }).then(function (postponed) {
              models.goods.update({
                postponedId: postponed.id
              },{
                where: {
                  id: req.body.goodid
                }
              }).then(function (good) {
								models.goods.findAll({
									include: [models.postponed],
									where: {
				            '$postponed.statusval$': 2
				          }
								}).then(function (goods) {
									res.send({postponed: postponed, user: user, pcount: goods.length});
								}).catch(function (err) {
									res.send({err: err});
	                console.log(err);
								});
                // res.send({postponed: postponed, user: user})
              }).catch(function (err) {
                res.send({err: err});
                console.log('update goods',err);
              })
            }).catch(function (err) {
              res.send({err: err});
              console.log('postponed',err);
            });
          }else{
            res.send({err: 'Незаказыннй товар отложить нельзя!'});
          }
        }).catch(function (err) {
          res.send({err: err});
          console.log('goods',err);
        })
      }else{
        res.send({err: 'Недостаточно прав'});
      }
    }else{
      res.send({err: 'Неверный ПИН'});
    }
  }).catch(function (err) {
    res.send({err: err});
    console.log('user',err);
  })
});

router.post('/setcallstatus', function (req, res, next) {
  // res.send('response');
  models.users.findOne({
    where: {
      pin: req.body.yourpin
    }
  }).then(function (user) {
    if (user) {
      if (user.status == 'saler' || user.status == 'supplier' || user.status == 'manager') {
        models.goods.findOne({
          include: [models.callstatus, models.postponed],
          where: {
            id: req.body.goodid
          }
        }).then(function (good) {
          var alias;
          if (req.body.statusval == 0) {
            alias = 'Не звонили';
          }else if(req.body.statusval == 1){
            alias = 'Дозвон';
          }else{
            alias = 'Не дозвон';
          }
					console.log('good.issued.statusval: '+good.postponed.statusval);
          if (good.postponed.statusval == 1) {
            models.callstatus.create({
              statusval: req.body.statusval,
							comment: req.body.comment,
              alias: alias,
              locationId: req.cookies.location,
              userId: user.id,
              goodId: req.body.goodid
            }).then(function (callstatus) {
              models.goods.update({
                callstatusId: callstatus.id
              },{
                where: {
                  id: req.body.goodid
                }
              }).then(function (goods) {
                res.send({callstatus: callstatus, user: user})
              }).catch(function (err) {
                res.send({err: err});
                console.log('update goods',err);
              })
            }).catch(function (err) {
              res.send({err: err});
              console.log('callstatus',err);
            });
          }else{
            res.send({err: 'Сначала отложите товар!'});
          }
        }).catch(function (err) {
          res.send({err: err});
          console.log('goods',err);
        })
      }else{
        res.send({err: 'Недостаточно прав'});
      }
    }else{
      res.send({err: 'Неверный ПИН'});
    }
  }).catch(function (err) {
    res.send({err: err});
    console.log('user',err);
  })
});

router.post('/setissued', function (req, res, next) {
  // res.send('response');
  models.users.findOne({
    where: {
      pin: req.body.yourpin
    }
  }).then(function (user) {
    if (user) {
      if (user.status == 'saler' || user.status == 'manager') {
        models.goods.findOne({
          include: [models.issued, models.callstatus],
          where: {
            id: req.body.goodid
          }
        }).then(function (good) {
          var alias;
          if (req.body.statusval == 0) {
            alias = 'Не выдан';
          }else{
            alias = 'Выдан';
          }
          if (good.callstatus.statusval == 1) {
            models.issued.create({
              statusval: req.body.statusval,
							comment: req.body.comment,
              alias: alias,
              locationId: req.cookies.location,
              userId: user.id,
              goodId: req.body.goodid
            }).then(function (issued) {
              models.goods.update({
                issuedId: issued.id
              },{
                where: {
                  id: req.body.goodid
                }
              }).then(function (good) {
								models.goods.findAll({
									include: [models.issued],
									where: {
				            '$issued.statusval$': 1
				          }
								}).then(function (goods) {
									res.send({issued: issued, user: user, pcount: goods.length});
								}).catch(function (err) {
									res.send({err: err});
	                console.log(err);
								});
                // res.send({issued: issued, user: user})
              }).catch(function (err) {
                res.send({err: err});
                console.log('update goods',err);
              })
            }).catch(function (err) {
              res.send({err: err});
              console.log('issued',err);
            });
          }else{
            res.send({err: 'Перед выдачей дозвонитесь клиенту!'});
          }
        }).catch(function (err) {
          res.send({err: err});
          console.log('goods',err);
        })
      }else{
        res.send({err: 'Недостаточно прав'});
      }
    }else{
      res.send({err: 'Неверный ПИН'});
    }
  }).catch(function (err) {
    res.send({err: err});
    console.log('user',err);
  })
});

router.get('/order-:orderid', function (req, res, next) {
	models.orders.findOne({
    include: [models.users, models.locations, /*models.goods,*/{
      model: models.goods,
			// where: searchWhereGoods,
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
  }).then(function (order) {
    res.render('overvieworder', {order: order});
    // res.send(order);
  }).catch(function (err) {
    res.send(err);
    console.log('order error: ' + err);
  });
});

module.exports = router;
