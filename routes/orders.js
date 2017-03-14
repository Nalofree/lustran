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

router.use(function (req, res, next) {
	models.orders.findAll({
		include: [{
			model: models.goods,
			// where: searchWhereGoods,
			as: 'goods',
			include: [{
				model: models.postponed,
				as: 'postponed'
			}]
		}],
		where: {
			'$goods.postponed.statusval$': 2,
			active: 1,
			locationId: req.cookies.location,
			$or: [
				{'$goods.active$': 1},
				{'$goods.reject$': 0}
			]
		}
	}).then(function (postponedgoods) {
		models.orders.findAll({
			include: [{
				model: models.goods,
				as: 'goods',
				include: [{
					model: models.processed,
					as: 'processed'
				}]
			}],
			where: {
				'$goods.processed.statusval$': 1,
				active: 1,
				locationId: req.cookies.location,
				$or: [
					{'$goods.active$': 1},
					{'$goods.reject$': 0}
				]
			}
		}).then(function (processedgoods) {
			models.orders.findAll({
				include: [{
					model: models.goods,
					as: 'goods',
					include: [{
						model: models.issued,
						as: 'issued'
					}]
				}],
				where: {
					'$goods.issued.statusval$': 1,
					active: 1,
					locationId: req.cookies.location,
					$or: [
						{'$goods.active$': 1},
						{'$goods.reject$': 0}
					]
				}
			}).then(function (issuedgoods) {
				models.orders.findAll({
					where: {
						active: 1,
						locationId: req.cookies.location
					}
				}).then(function (orders) {
					models.orders.findAll({
						include: [{
							model: models.goods,
							as: 'goods'
						}],
						where: {
							'$orders.locationId$': req.cookies.location,
							// '$orders.active$': 1,
							// $or: [
							// 	{'$goods.active$': 1},
							// 	{'$goods.reject$': 0}
							// ]
						}
					}).then(function (goods) {
						console.log("goods: " + goods.length);
						console.log("orders: " + orders.length);
						console.log("postponedcount: " + postponedgoods.length);
						console.log("issuedcount: " + issuedgoods.length);
						console.log("processedcount: " + processedgoods.length);
					}).catch(function (err) {
						console.log(err);
					});
				}).catch(function (err) {
					console.log(err);
				});
			}).catch(function (err) {
				console.log(err);
			});
		}).catch(function (err) {
			console.log(err);
		});
	}).catch(function (err) {
		console.log(err);
	});
  next();
});

/* GET orders listing. */
router.get('/', function(req, res, next) {
	if (!req.session.isauth) {
		res.redirect('/login');
	}
  if (!req.cookies.location) {
    res.redirect('/locations');
  }
	console.log(req.query);
	var searchWhereGoods = {
		$or: []
	};
	var searchWhereOrders = {
		$or: [],
		active: 1,
		// locationId: req.cookies.location
	};
	if (req.query.search) {
		var searchstring = req.query.search;
		searchstring = searchstring.replace(/^000/, "");
		console.log(searchstring);
	  // searchstring = searchstring.replace(/[/.,!?;]*/g, '');
	  // searchstring = searchstring.replace(/[\s]+/g," ");
		// searchsarray = searchstring.split(' ');
		// for (var i = 0; i < searchsarray.length; i++) {
		searchWhereOrders.$or.push({'$goods.name$': {$like: '%'+searchstring+'%'}});
		searchWhereOrders.$or.push({'$goods.vencode$': {$like: '%'+searchstring+'%'}});
		searchWhereOrders.$or.push({number: {$like: '%'+searchstring+'%'}});
		// searchWhereOrders.$or.push({customerphone: {$like: '%'+searchstring+'%'}});
		searchWhereOrders.$or.push({customername: {$like: '%'+searchstring+'%'}});
		// }
		// console.log(searchWhereGoods.$or);
	}else{
		searchWhereGoods = {};
		searchWhereOrders = {
			// locationId: req.cookies.location,
			active: 1
		};
	}

	if (req.query.tel) {
		var searchstring = req.query.tel;
		console.log(searchstring);
		searchWhereOrders.customerphone = {$like: '%'+searchstring+'%'};
	}else{
		searchWhereGoods = {};
		searchWhereOrders = {
			locationId: req.cookies.location,
			active: 1
		};
	}

	var lastStatus = false;

	if (req.query.processed || req.query.oredered || req.query.postponed || req.query.callstatus || req.query.issued || req.query.spicdate || req.query.archive || req.query.locationsall || req.query.locationslist) { //processed=&oredered=&postponed=&callstatus=&issued=&spicdate=on
		// console.log("PROCESSED: " + req.query.processed);
		lastStatus = true;
		earchWhereOrders = {};
		searchWhereOrders = {
			$and: [],
			// $or: [],
			active: 1,
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
			if (req.query.spicdate == 1) {
				searchWhereOrders.$and.push({'$goods.spicdate.statusval$': {$ne: null}});
			}else{
				searchWhereOrders.$and.push({'$goods.spicdate.statusval$': {$is: null}});
			}
			// searchWhereOrders.$and.push({'$goods.spicdate.statusval$': {$ne: null}});
			searchWhereOrders.$and.push({active: 1});
		}
		if (req.query.archive) {
			// searchWhereOrders.$or = [];
			// searchWhereOrders.$or.push({reject: 1});
			var endDate = new Date(req.query.endperiod);
			endDate.setDate(endDate.getDate()+1);
			var start = req.query.startperiod ? new Date(req.query.startperiod) : new Date(0);
			var end = req.query.endperiod ? endDate : new Date();
			// searchWhereOrders.$and.push({active: 0});
			searchWhereOrders.active = 0;
			searchWhereOrders.$and.push({createdAt: {$gte: start}});
			searchWhereOrders.$and.push({createdAt: {$lte: end}});
		}
		if (req.query.locationsall) {
			searchWhereOrders.locationId = {
				$ne: null
			}
		}
		if (req.query.locationslist) {
			var locListArr = [];
			if (typeof(req.query.locationslist) == 'string') {
				locListArr.push(req.query.locationslist);
			}else{
				locListArr = req.query.locationslist;
			}
			searchWhereOrders.locationId = {
				$in: locListArr
			}
		}
	}//else{
	// 	searchWhereOrders = {
	// 		locationId: req.cookies.location,
	// 		active: 1
	// 	};
	// }
	console.log(searchWhereOrders);
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
		models.locations.findAll().then(function (locations) {
			res.render('orders', {title: 'Заказы', goodcount: goodcount, orders: forders, orderscount: orderscount, ordersproc: ordersproc, ordersissued: ordersissued, ordersdef: ordersdef, locations: locations});
		}).catch(function (err) {
	    res.send(err);
	    console.log('locations error: ' + err);
	  });

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
    },
		order: 'createdAt ASC'
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
			// status: $or'manager'
			$or: {
				status: ['manager', 'saler']
			}
		}
	}).then(function (user) {
		if (user) {
			if (user.status == 'manager') {
				var activestatus;
				var aliastext;
				if (req.body.reject == 1) {
					activestatus = 0;
					aliastext = 'Товар отменен';
				}else{
					activestatus = 1;
					aliastext = 'Товар востановлен';
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
								models.actions.create({
									locationId: req.cookies.location,
									userId: user.id,
									goodId: good.id,
									statusval: ' ',
									alias: aliastext,
									comment: req.body.comment
								}).then(function (action) {
									res.send({good: good, order: order, err: false, activeorder: activeorder});
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
			}else if (user.status == 'saler') {
				models.goods.findOne({
					where: {
						id: req.body.goodid
					}
				}).then(function (good) {
					if (good.reject == 1) {
						res.send({err: 'Товар уже отменен'});
					}else{
						var aliastext, refusestatus;
						if (good.refuse == 1) {
							aliastext = "Товар восстановлен";
							refusestatus = 0;
						}else{
							aliastext = "Покупатель отказался";
							refusestatus = 1;
						}
						models.goods.update({
							refuse: refusestatus
						},{
							where: {
								id: req.body.goodid
							}
						}).then(function () {
							models.actions.create({
								locationId: req.cookies.location,
								userId: user.id,
								goodId: good.id,
								statusval: ' ',
								alias: aliastext,
								comment: req.body.comment
							}).then(function (action) {
								res.send({good: good, refusestatus: refusestatus, err: false});
							}).catch(function (err) {
								res.send({err: err});
								console.log(err);
							});
						}).catch(function (err) {
					    res.send({err: err});
					    console.log(err);
					  });
					}
				}).catch(function (err) {
			    res.send({err: err});
			    console.log(err);
			  });
				// res.send({err: 'log'});
			}else{
				res.send({err: 'Недостаточно прав'});
			}
			// {
			// 	res.send({err: 'log'});
			// }
		}else{
			res.send({err: 'Неверный ПИН'});
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
          include: [models.processed, models.spicdate, models.ordered, models.postponed, models.callstatus, models.issued],
          where: {
            id: req.body.goodid
          }
        }).then(function (good) {
          // if (good.processed.statusval != 2) {
            var alias = '';
            if (req.body.statusval == 0) {
              alias = 'Не обработан';
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
												models.spicdate.create({
													comment: ' ',
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
														models.postponed.create({
															statusval: 0,
															comment: ' ',
															alias: 'Не отложен',
															locationId: req.cookies.location,
															userId: starter.id,
															goodId: req.body.goodid
														}).then(function (postponed) {
															models.goods.update({
																postponedId: postponed.id,
																callstatusId: callstatus.id,
																// processedId: processed.id,
																spicdateId: spicdate.id,
																orderedId: ordered.id,
																issuedId: issued.id
															},{
																where: {
																	id: req.body.goodid
																}
															}).then(function (good) {

																models.processed.create({
										              statusval: req.body.statusval,
																	comment: req.body.comment,
										              alias: alias,
										              locationId: req.cookies.location,
										              userId: user.id,
										              goodId: req.body.goodid
										            }).then(function (processed) {
										              models.goods.update({
										                processedId: processed.id,
																		active: 1
										              },{
										                where: {
										                  id: req.body.goodid
										                }
										              }).then(function (good) {
																		models.goods.findAll({
																			include: [models.processed],
																			where: {
														            '$processed.statusval$': 1,
																				active: 1,
																				reject: 0
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
																				models.orders.findAll({
																					include: [{
																						model: models.goods,
																			      as: 'goods',
																					}],
																					where: {
																						'$goods.id$': req.body.goodid
																					}
																				}).then(function (order) {
																					models.orders.update({
																						active: 1
																					},{
																						where: {
																							id: order[0].id
																						}
																					}).then(function (order) {
																						console.log('order updated');
																						res.send({processed: processed, postponed: postponed, callstatus: callstatus, issued: issued, spicdate: spicdate, ordered: ordered, user: user, pcount: goods.length});
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
            }else{
							if (good.processed.statusval != 2) {
								alias = 'В обработке';
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
						            '$processed.statusval$': 1,
												active: 1,
												reject: 0
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
            }
          // }else{
          //   res.send({err: 'Заказ уже обработан!'});
          // }
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
  models.users.findOne({
    where: {
      pin: req.body.yourpin
    }
  }).then(function (user) {
    if (user) {
      if ((user.status == 'supplier' || user.status == 'manager') && user.active == 1) {
        models.goods.findOne({
          include: [models.spicdate, models.processed, models.postponed],
          where: {
            id: req.body.goodid
          }
        }).then(function (good) {
          if (good.processed.statusval == 1 || good.processed.statusval == 2) {
						if (good.postponed.statusval != 1) {
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
													models.orders.findAll({
														include: [{
															model: models.goods,
															as: 'goods',
														}],
														where: {
															'$goods.id$': req.body.goodid
														}
													}).then(function (order) {
														models.orders.update({
															active: 1
														},{
															where: {
																id: order[0].id
															}
														}).then(function (order) {
															console.log('order updated');
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
							res.send({err: 'Товар уже отложен! Уточненную дату сменить нельзя!'});
						}
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

/*
models.orders.findAll({
	include: [{
		model: models.goods,
		as: 'goods',
	}],
	where: {
		'$goods.id$': req.body.goodid
	}
}).then(function (order) {
	models.orders.update({
		active: 1
	},{
		where: {
			id: order[0].id
		}
	}).then(function (order) {
		console.log('order updated');
		res.send({spicdate: spicdate, user: user});
	}).catch(function (err) {
		res.send({err: err});
		console.log(err);
	});
}).catch(function (err) {
	res.send({err: err});
	console.log(err);
});
*/

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
            var alias, active;
            if (req.body.statusval == 0) {
              alias = 'Не заказан';
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
											models.postponed.create({
												statusval: 0,
												comment: ' ',
												alias: 'Не отложен',
												locationId: req.cookies.location,
												userId: starter.id,
												goodId: req.body.goodid
											}).then(function (postponed) {
												models.goods.update({
													postponedId: postponed.id,
													callstatusId: callstatus.id,
													issuedId: issued.id
												},{
													where: {
														id: req.body.goodid
													}
												}).then(function (good) {

													models.ordered.create({
							              statusval: req.body.statusval,
														comment: req.body.comment,
							              alias: alias,
							              locationId: req.cookies.location,
							              userId: user.id,
							              goodId: req.body.goodid
							            }).then(function (ordered) {
							              models.goods.update({
							                orderedId: ordered.id,
															active: 1
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
																models.orders.findAll({
																	include: [{
																		model: models.goods,
																		as: 'goods',
																	}],
																	where: {
																		'$goods.id$': req.body.goodid
																	}
																}).then(function (order) {
																	models.orders.update({
																		active: 1
																	},{
																		where: {
																			id: order[0].id
																		}
																	}).then(function (order) {
																		console.log('order updated');
																		res.send({ordered: ordered, postponed: postponed, callstatus: callstatus, issued: issued, user: user});
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
							                // res.send({ordered: ordered, user: user});
							              }).catch(function (err) {
							                res.send({err: err});
							                console.log('update goods',err);
							              })
							            }).catch(function (err) {
							              res.send({err: err});
							              console.log('ordered',err);
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
            }else{
              alias = 'Заказан';
							models.ordered.create({
	              statusval: req.body.statusval,
								comment: req.body.comment,
	              alias: alias,
	              locationId: req.cookies.location,
	              userId: user.id,
	              goodId: req.body.goodid
	            }).then(function (ordered) {
	              models.goods.update({
	                orderedId: ordered.id,
									// active: 1
	              },{
	                where: {
	                  id: req.body.goodid
	                }
	              }).then(function (goods) {
									// models.orders.update({
									// 	active: 1
									// },{
									// 	where: {
									// 		id: good.orderId
									// 	}
									// }).
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
            }
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
												issuedId: issued.id,
												active: 1
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
													models.orders.findAll({
												    include: [{
												      model: models.goods,
															// where: searchWhereGoods,
												      as: 'goods',
												      include: [{
												        model: models.postponed,
												        as: 'postponed'
												      }]
												    }],
														where: {
															'$goods.postponed.statusval$': 1,
															active: 1,
															$or: [
																{'$goods.active$': 1},
																{'$goods.reject$': 0}
															]
														}
												  }).then(function (pgoods) {
														models.orders.findAll({
															include: [{
																model: models.goods,
																as: 'goods',
															}],
															where: {
																'$goods.id$': req.body.goodid
															}
														}).then(function (order) {
															models.orders.update({
																active: 1
															},{
																where: {
																	id: order[0].id
																}
															}).then(function (order) {
																console.log('order updated');
																res.send({postponed: postponed, callstatus: callstatus, issued: issued, user: user, pcount: pgoods.length});
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
	            res.send({err: 'Незаказанный товар отложить нельзя!'});
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
																issuedId: issued.id,
																active: 1
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
																	models.orders.findAll({
																    include: [{
																      model: models.goods,
																			// where: searchWhereGoods,
																      as: 'goods',
																      include: [{
																        model: models.postponed,
																        as: 'postponed'
																      }]
																    }],
																		where: {
																			'$goods.postponed.statusval$': 1,
																			active: 1,
																			$or: [
																				{'$goods.active$': 1},
																				{'$goods.reject$': 0}
																			]
																		}
																  }).then(function (pgoods) {
																  	// res.send({postponed: postponed, callstatus: callstatus, issued: issued, user: user, pcount: pgoods.length});
																		models.orders.findAll({
																			include: [{
																				model: models.goods,
																				as: 'goods',
																			}],
																			where: {
																				'$goods.id$': req.body.goodid
																			}
																		}).then(function (order) {
																			models.orders.update({
																				active: 1
																			},{
																				where: {
																					id: order[0].id
																				}
																			}).then(function (order) {
																				console.log('order updated');
																				res.send({postponed: postponed, callstatus: callstatus, issued: issued, processed: processed, spicdate: spicdate, ordered: ordered, user: user, pcount: pgoods.length});
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
																	// res.send({postponed: postponed, callstatus: callstatus, issued: issued, processed: processed, spicdate: spicdate, ordered: ordered, user: user, pcount: pgoods.length});
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
						models.users.findOne({
							where: {
								status: "starter"
							}
						}).then(function (starter) {
							if (starter) {
									models.issued.create({
										statusval: 0,
										comment: ' ',
										alias: 'Не выдан',
										locationId: req.cookies.location,
										userId: starter.id,
										goodId: req.body.goodid
									}).then(function (issued) {
										models.goods.update({
											issuedId: issued.id
										},{
											where: {
												id: req.body.goodid
											}
										}).then(function (good) {
											models.callstatus.create({
					              statusval: req.body.statusval,
												comment: req.body.comment,
					              alias: alias,
					              locationId: req.cookies.location,
					              userId: user.id,
					              goodId: req.body.goodid
					            }).then(function (callstatus) {
					              models.goods.update({
					                callstatusId: callstatus.id,
													active: 1
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

														models.orders.findAll({
															include: [{
																model: models.goods,
																as: 'goods',
															}],
															where: {
																'$goods.id$': req.body.goodid
															}
														}).then(function (order) {
															models.orders.update({
																active: 1
															},{
																where: {
																	id: order[0].id
																}
															}).then(function (order) {
																console.log('order updated');
																res.send({callstatus: callstatus, issued: issued, user: user});
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
					                // res.send({callstatus: callstatus, user: user});
					              }).catch(function (err) {
					                res.send({err: err});
					                console.log('update goods',err);
					              })
					            }).catch(function (err) {
					              res.send({err: err});
					              console.log('callstatus',err);
					            });
										}).catch(function (err) {
											res.send({err: err});
											console.log('update goods',err);
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
          }else if(req.body.statusval == 1){
            alias = 'Дозвон';
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
          }else{
            alias = 'Не дозвон';
						models.users.findOne({
							where: {
								status: "starter"
							}
						}).then(function (starter) {
							if (starter) {
									models.issued.create({
										statusval: 0,
										comment: ' ',
										alias: 'Не выдан',
										locationId: req.cookies.location,
										userId: starter.id,
										goodId: req.body.goodid
									}).then(function (issued) {
										models.goods.update({
											issuedId: issued.id
										},{
											where: {
												id: req.body.goodid
											}
										}).then(function (good) {
											models.callstatus.create({
					              statusval: req.body.statusval,
												comment: req.body.comment,
					              alias: alias,
					              locationId: req.cookies.location,
					              userId: user.id,
					              goodId: req.body.goodid
					            }).then(function (callstatus) {
					              models.goods.update({
					                callstatusId: callstatus.id,
													active: 1
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

														models.orders.findAll({
															include: [{
																model: models.goods,
																as: 'goods',
															}],
															where: {
																'$goods.id$': req.body.goodid
															}
														}).then(function (order) {
															models.orders.update({
																active: 1
															},{
																where: {
																	id: order[0].id
																}
															}).then(function (order) {
																console.log('order updated');
																res.send({callstatus: callstatus, issued: issued, user: user});
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
					                // res.send({callstatus: callstatus, user: user});
					              }).catch(function (err) {
					                res.send({err: err});
					                console.log('update goods',err);
					              })
					            }).catch(function (err) {
					              res.send({err: err});
					              console.log('callstatus',err);
					            });
										}).catch(function (err) {
											res.send({err: err});
											console.log('update goods',err);
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
          }
					// console.log('good.issued.statusval: '+good.postponed.statusval);

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
								console.log(good);
								models.orders.findAll({
							    include: [{
							      model: models.goods,
										// where: searchWhereGoods,
							      as: 'goods',
							      include: [{
							        model: models.issued,
							        as: 'issued'
							      }]
							    }],
									where: {
										'$goods.issued.statusval$': 1,
										active: 1,
										$or: [
											{'$goods.active$': 1},
											{'$goods.reject$': 0}
										]
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
										// res.send({issued: issued, user: user, pcount: goods.length});
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
													res.send({good: good, order: order, err: false, activeorder: activeorder, issued: issued, user: user, pcount: goods.length});
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
										/*

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
										}).catch(function (err) {
											res.send({err: err});
								    	console.log(err);
										});
										*/
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
