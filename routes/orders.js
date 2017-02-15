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
		$or: [],
		locationId: req.cookies.location
	};
	if (req.query.search) {
		var searchstring = req.query.search;
		console.log(searchstring);
	  // searchstring = searchstring.replace(/[/.,!?;]*/g, '');
	  // searchstring = searchstring.replace(/[\s]+/g," ");
		// searchsarray = searchstring.split(' ');
		// for (var i = 0; i < searchsarray.length; i++) {
		searchWhereOrders.$or.push({'$goods.name$': {$like: '%'+searchstring+'%'}});
		searchWhereOrders.$or.push({'$goods.vencode$': {$like: '%'+searchstring+'%'}});
		searchWhereOrders.$or.push({number: {$like: '%'+searchstring+'%'}});
		searchWhereOrders.$or.push({customerphone: {$like: '%'+searchstring+'%'}});
		searchWhereOrders.$or.push({customername: {$like: '%'+searchstring+'%'}});
		// }
		console.log(searchWhereGoods.$or);
	}else{
		searchWhereGoods = {};
		searchWhereOrders = {
			locationId: req.cookies.location,
			active: 1
		};
	}
	console.log(searchWhereGoods);

	var lastStatus = false;

	if (req.query.processed || req.query.oredered || req.query.postponed || req.query.callstatus || req.query.issued || req.query.spicdate || req.query.archive) { //processed=&oredered=&postponed=&callstatus=&issued=&spicdate=on
		// console.log("PROCESSED: " + req.query.processed);
		lastStatus = true;
		earchWhereOrders = {};
		searchWhereOrders = {
			$and: [],
			// $or: [],
			locationId: req.cookies.location
		};
		if (req.query.processed) {
			searchWhereOrders.$and.push({'$goods.processed.statusval$': parseInt(req.query.processed)});
			searchWhereOrders.$and.push({active: 1});
			// searchWhereOrders.$and.push({'$goods.processed.statusval$': parseInt(req.query.processed)});
		}
		if (req.query.oredered) {
			searchWhereOrders.$and.push({'$goods.ordered.statusval$': parseInt(req.query.oredered)});
			searchWhereOrders.$and.push({active: 1});
			// searchWhereOrders.$and.push({'$goods.ordered.statusval$': parseInt(req.query.oredered)});
		}
		if (req.query.postponed) {
			searchWhereOrders.$and.push({'$goods.postponed.statusval$': parseInt(req.query.postponed)});
			searchWhereOrders.$and.push({active: 1});
			// searchWhereOrders.$and.push({'$goods.postponed.statusval$': parseInt(req.query.postponed)});
		}
		if (req.query.callstatus) {
			searchWhereOrders.$and.push({'$goods.callstatus.statusval$': parseInt(req.query.callstatus)});
			searchWhereOrders.$and.push({active: 1});
			// searchWhereOrders.$and.push({'$goods.callstatus.statusval$': parseInt(req.query.callstatus)});
		}
		if (req.query.issued) {
			searchWhereOrders.$and.push({'$goods.issued.statusval$': parseInt(req.query.issued)});
			searchWhereOrders.$and.push({active: 1});
			// searchWhereOrders.$and.push({'$goods.issued.statusval$': parseInt(req.query.issued)});
		}
		if (req.query.spicdate) {
			searchWhereOrders.$and.push({'$goods.spicdate.statusval$': {$ne: null}});
			searchWhereOrders.$and.push({active: 1});
		}
		if (req.query.archive) {
			searchWhereOrders.$or = [];
			// searchWhereOrders.$or.push({reject: 1});
			searchWhereOrders.$or.push({active: 0});
		}
	}else{
		searchWhereOrders = {
			locationId: req.cookies.location,
			active: 1
		};
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
		var goodcount = 0;
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
			// goodcount++;
			// var goodcount = 0;
			// for (var i = 0; i < forders.length; i++) {
			// 	// forders[i]
				for (var j = 0; j < forders[i].goods.length; j++) {
					goodcount++;
				}
			// }
    }
		// if (lastStatus) {
		//
		// }
    res.render('orders', {title: 'Заказы', goodcount: goodcount, orders: forders, orderscount: orderscount, ordersproc: ordersproc, ordersissued: ordersissued, ordersdef: ordersdef});
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
	models.actions.findAll(whereobj).then(function (actions) {
		res.send({actions: actions});
	}).catch(function (err) {
    res.send({err: err});
    console.log(err);
  });
});

router.post('/rejectgood', function (req, res, next) {
	// res.send(req.body);
	models.users.findOne({
		where: {
			pin: req.body.yourpin,
			status: 'manager'
		}
	}).then(function (user) {
		if (user) {
			var activestatus;
			if (req.body.reject == 1) {
				activestatus = 0;
			}else{
				activestatus = 1;
			}
			models.goods.update({
				reject: req.body.reject,
				active: activestatus
			},{
				where: {
					id: req.body.goodid
				}
			}).then(function (goods) {
				models.goods.findOne({
					where: {
						id: req.body.goodid
					}
				}).then(function (good) {
					models.orders.findOne({
						include: [models.goods],
						where: {
							id: good.orderId
						}
					}).then(function (order) {
						var activeorder = 1;
						for (var i = 0; i < order.goods.length; i++) {
							if (order.goods[i].reject == 1 || order.goods[i].active == 0) {
								activeorder = 0;
							}else if (order.goods[i].reject == 0 || order.goods[i].active == 1){
								activeorder = 1;
								break;
							}
						}
						console.log("activeorder: "+ activeorder);
						models.orders.update({
							active: activeorder
						},{
							where:{
								id: order.id
							}
						}).then(function (updorder) {
							res.send({good: good, order: order, err: false, activeorder: activeorder});
						}).catch(function (err) {
							res.send({err: err});
					   	console.log(err);
						});
						// if (activeorder == 1) {
						// 	models.orders.update({
						// 		active: 1
						// 	},{
						// 		where:{
						// 			id: order.id
						// 		}
						// 	}).then(function (updorder) {
						// 		res.send({good: good, order: order, err: false, activeorder: activeorder});
						// 	}).catch(function (err) {
						// 		res.send({err: err});
					  //   	console.log(err);
						// 	});
						// }else{
						// 	models.orders.update({
						// 		active: 0
						// 	},{
						// 		where:{
						// 			id: order.id
						// 		}
						// 	}).then(function (updorder) {
						// 		res.send({good: good, order: order, err: false, activeorder: activeorder});
						// 	}).catch(function (err) {
						// 		res.send({err: err});
					  //   	console.log(err);
						// 	});
						// }
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
			res.send({err: 'Неверный пин!'});
		}
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
      if ((user.status == 'supplier' || user.status == 'manager') && user.active == 1) {
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
									models.actions.create({
										locationId: req.cookies.location,
	                  userId: user.id,
	                  goodId: req.body.goodid,
	                  statusval: req.body.statusval,
	                  alias: alias,
	                  comment: req.body.comment
									}).then(function (action) {
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
      if ((user.status == 'supplier' || user.status == 'manager') && user.active == 1) {
        models.goods.findOne({
          include: [models.spicdate, models.processed],
          where: {
            id: req.body.goodid
          }
        }).then(function (good) {
          if (good.processed.statusval == 1 || good.processed.statusval == 2) {
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
										models.actions.create({
											locationId: req.cookies.location,
		                  userId: user.id,
		                  goodId: req.body.goodid,
		                  statusval: req.body.statusval,
		                  alias: 'Ут. дата: '+req.body.statusval,
		                  comment: req.body.comment
										}).then(function (action) {
											models.actions.create({
												locationId: req.cookies.location,
			                  userId: user.id,
			                  goodId: req.body.goodid,
			                  statusval: 2,
			                  alias: 'Обработан',
			                  comment: ' '
											}).then(function (action) {
												res.send({spicdate: spicdate, user: user});
											}).catch(function (err) {
												res.send({err: err});
				                console.log(err);
											});
										}).catch(function (err) {
											res.send({err: err});
			                console.log(err);
										});
                    // res.send({spicdate: spicdate, user: user});
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
      if ((user.status == 'supplier' || user.status == 'manager') && user.active == 1) {
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
								models.actions.create({
									locationId: req.cookies.location,
									userId: user.id,
									goodId: req.body.goodid,
									statusval: req.body.statusval,
									alias: alias,
									comment: req.body.comment
								}).then(function (action) {
									res.send({ordered: ordered, user: user});
								}).catch(function (err) {
									res.send({err: err});
									console.log(err);
								});
                // res.send({ordered: ordered, user: user});
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
      if ((user.status == 'saler' || user.status == 'manager') && user.active == 1) {
        models.goods.findOne({
          include: [models.postponed, models.ordered],
          where: {
            id: req.body.goodid
          }
        }).then(function (good) {
          var alias;
          if (req.body.statusval == 0) {
            alias = 'Не отложен';
	          models.postponed.create({
	            statusval: req.body.statusval,
							comment: req.body.comment,
	            alias: alias,
	            locationId: req.cookies.location,
	            userId: user.id,
	            goodId: req.body.goodid
	          }).then(function (postponed) {
							models.users.findOne({
								where: {
									status: "starter"
								}
							}).then(function (starter) {
								if (starter) {
									models.callstatus.create({
										statusval: 0,
										comment: ' ',
										alias: 'Не звонили',
										locationId: req.cookies.location,
										userId: starter.id,
										goodId: req.body.goodid
									}).then(function (callstatus) {
										models.issued.create({
											statusval: 0,
											comment: ' ',
											alias: 'Не выдан',
											locationId: req.cookies.location,
											userId: starter.id,
											goodId: req.body.goodid
										}).then(function (issued) {
											models.goods.update({
					              postponedId: postponed.id,
												callstatusId: callstatus.id,
												issuedId: issued.id
					            },{
					              where: {
					                id: req.body.goodid
					              }
					            }).then(function (good) {
												models.actions.create({
													locationId: req.cookies.location,
													userId: user.id,
													goodId: req.body.goodid,
													statusval: req.body.statusval,
													alias: alias,
													comment: req.body.comment
												}).then(function (action) {
													res.send({postponed: postponed, callstatus: callstatus, issued: issued, user: user});
												}).catch(function (err) {
													res.send({err: err});
													console.log(err);
												});
					            }).catch(function (err) {
					              res.send({err: err});
					              console.log('update goods',err);
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
									res.send({err: 'Что-то пошло не так, обратитесь к администратору! / starter is not exist'});
								}
							}).catch(function (err) {
								res.send({err: err});
								console.log(err);
							});
	          }).catch(function (err) {
	            res.send({err: err});
	            console.log('postponed',err);
	          });
          }else if(req.body.statusval == 1){
            alias = 'Отложен';
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
									models.actions.create({
										locationId: req.cookies.location,
										userId: user.id,
										goodId: req.body.goodid,
										statusval: req.body.statusval,
										alias: alias,
										comment: req.body.comment
									}).then(function (action) {
										res.send({postponed: postponed, user: user});
									}).catch(function (err) {
										res.send({err: err});
										console.log(err);
									});
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
          }else if(req.body.statusval == 2){
            alias = 'Есть деффект';
						////////////////////////////////////////////////////////////////////
						if (good.ordered.statusval == 1) {
							models.postponed.create({
		            statusval: req.body.statusval,
								comment: req.body.comment,
		            alias: alias,
		            locationId: req.cookies.location,
		            userId: user.id,
		            goodId: req.body.goodid
		          }).then(function (postponed) {
								models.users.findOne({
									where: {
										status: "starter"
									}
								}).then(function (starter) {
									if (starter) {
										models.callstatus.create({
											statusval: 0,
											comment: ' ',
											alias: 'Не звонили',
											locationId: req.cookies.location,
											userId: starter.id,
											goodId: req.body.goodid
										}).then(function (callstatus) {
											models.issued.create({
												statusval: 0,
												comment: ' ',
												alias: 'Не выдан',
												locationId: req.cookies.location,
												userId: starter.id,
												goodId: req.body.goodid
											}).then(function (issued) {
												models.processed.create({
													statusval: 0,
													comment: ' ',
													alias: 'Не обработан',
													locationId: req.cookies.location,
													userId: starter.id,
													goodId: req.body.goodid
												}).then(function (processed) {
													models.spicdate.create({
														// statusval: 0,
														comment: ' ',
														// alias: 'Не выдан',
														locationId: req.cookies.location,
														userId: starter.id,
														goodId: req.body.goodid
													}).then(function (spicdate) {
														models.ordered.create({
															statusval: 0,
															comment: ' ',
															alias: 'Не заказан',
															locationId: req.cookies.location,
															userId: starter.id,
															goodId: req.body.goodid
														}).then(function (ordered) {
															models.goods.update({
									              postponedId: postponed.id,
																callstatusId: callstatus.id,
																processedId: processed.id,
																spicdateId: spicdate.id,
																orderedId: ordered.id,
																issuedId: issued.id
									            },{
									              where: {
									                id: req.body.goodid
									              }
									            }).then(function (good) {
																models.actions.create({
																	locationId: req.cookies.location,
																	userId: user.id,
																	goodId: req.body.goodid,
																	statusval: req.body.statusval,
																	alias: alias,
																	comment: req.body.comment
																}).then(function (action) {
																	res.send({postponed: postponed, callstatus: callstatus, issued: issued, processed: processed, spicdate: spicdate, ordered: ordered, user: user});
																}).catch(function (err) {
																	res.send({err: err});
																	console.log(err);
																});
									            }).catch(function (err) {
									              res.send({err: err});
									              console.log('update goods',err);
								            	});
														}).catch(function (err) {
															res.send({err: err});
															console.log('update goods',err);
														});
													}).catch(function (err) {
														res.send({err: err});
														console.log('update goods',err);
													});
												}).catch(function (err) {
													res.send({err: err});
													console.log('update goods',err);
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
										res.send({err: 'Что-то пошло не так, обратитесь к администратору! / starter is not exist'});
									}
								}).catch(function (err) {
									res.send({err: err});
									console.log(err);
								});
		          }).catch(function (err) {
		            res.send({err: err});
		            console.log('postponed',err);
		          });
						}else{
							res.send({err: 'Незаказанный товар не может быть деффектным'});
						}
						////////////////////////////////////////////////////////////////////
          }
					// console.log("models.ordered.statusval: "+goods.ordered.statusval);
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
      if ((user.status == 'saler' || user.status == 'supplier' || user.status == 'manager') && user.active == 1) {
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
								models.actions.create({
									locationId: req.cookies.location,
									userId: user.id,
									goodId: req.body.goodid,
									statusval: req.body.statusval,
									alias: alias,
									comment: req.body.comment
								}).then(function (action) {
									res.send({callstatus: callstatus, user: user});
								}).catch(function (err) {
									res.send({err: err});
									console.log(err);
								});
                // res.send({callstatus: callstatus, user: user});
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
      if ((user.status == 'saler' || user.status == 'manager') && user.active == 1) {
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
					var activestatus = req.body.statusval == 1 ? 0 : 1;
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
                issuedId: issued.id,
								active: activestatus
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
									models.actions.create({
										locationId: req.cookies.location,
										userId: user.id,
										goodId: req.body.goodid,
										statusval: req.body.statusval,
										alias: alias,
										comment: req.body.comment
									}).then(function (action) {
										res.send({issued: issued, user: user, pcount: goods.length});
									}).catch(function (err) {
										res.send({err: err});
										console.log(err);
									});
									// res.send({issued: issued, user: user, pcount: goods.length});
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

router.post('/addcomment', function (req, res, next) {
  // res.send('response');
	console.log(req.body);
  models.users.findOne({
    where: {
      pin: req.body.yourpin
    }
  }).then(function (user) {
    if (user) {
			models.actions.create({
				locationId: req.cookies.location,
				userId: user.id,
				goodId: req.body.goodid,
				statusval: ' ',
				alias: 'Комментарий',
				comment: req.body.comment
			}).then(function (action) {
				models.actions.findOne({
					include: [models.users,models.locations],
					where: {
						id: action.id
					}
				}).then(function (action) {
					res.send({
						err: false,
						action: action
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
      res.send({err: 'Неверный ПИН'});
    }
  }).catch(function (err) {
    res.send({err: err});
    console.log('user',err);
  })
});

router.get('/order-:orderid', function (req, res, next) {
	models.orders.findOne({
    include: [models.users, models.locations,{
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
		where: {
			id: req.params.orderid
		}
  }).then(function (order) {
		models.actions.findAll({
			include: [models.goods, models.users, models.locations],
			where: {
				"$good.orderId$": req.params.orderid
			}
		}).then(function (actions) {
			res.render('overvieworder', {order: order, actions: actions});
		}).catch(function (err) {
	    res.send(err);
	    console.log('order error: ' + err);
	  });
  }).catch(function (err) {
    res.send(err);
    console.log('order error: ' + err);
  });
});

module.exports = router;
