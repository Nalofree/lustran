var express = require('express');
var router = express.Router();
var models  = require('../models');
const fs = require('fs');
var excelbuilder = require('msexcel-builder');
// var windows1251 = require('windows-1251');
// var iconv = require('iconv-lite');

function getTimeReadeble(date){
	var readebleTime;//1998-02-03 22:23:00
	var year = date.getFullYear();
			readebleTime = ('00' + date.getDate()).slice(-2) + '.' +
				('00' + (date.getMonth()+1)).slice(-2) + '.' +
				year + ' ' +
				('00' + date.getHours()).slice(-2) + ':' +
				('00' + date.getMinutes()).slice(-2);
				// ('00' + date.getSeconds()).slice(-2);
			// console.log(now);
			return readebleTime;
};

router.get('/', function(req, res) {
	if (!req.cookies.location) {
    res.redirect('/locations');
  }
	if (!req.session.isauth) {
		res.redirect('/login');
	}
  var now = new Date();
  var prenow = new Date(new Date() - 24 * 60 * 60 * 1000);
  var startDate = prenow.setHours(0);
  var startDate = prenow.setMinutes(0);
  var endDate = now.setHours(23);
  var endDate = now.setMinutes(59);
  // console.log(startDate);
  // console.log(endDate);
  models.checks.findAll({
    include: [ models.users, models.locations ],
    where: {
      createdAt: {
        $lt: new Date(endDate),
        $gt: new Date(startDate)
      }
    },
		order: 'createdAt DESC'
  }).then(function(checks) {
    res.render('index', { title: 'Главная', checks: checks });
  }).catch(function (err) {
    res.send(err);
  });
});

router.post('/', function(req, res, next) {
  var now = new Date();
  var startDate = now.setHours(0);
  var startDate = now.setMinutes(0);
  var endDate = now.setHours(23);
  var endDate = now.setMinutes(59);
  // console.log(startDate);
  // console.log(endDate);
  models.users.findOne({
    where: {
      pin: req.body.yourpin,
      active: 1
    }
  }).then(function (user) {
    if (user) {
      models.locations.findOne({
        where: {
          id: req.body.locid
        }
      }).then(function (location) {
        models.checks.findAll({
          where: {
            userId: user.id,
            createdAt: {
              $lt: new Date(endDate),
              $gt: new Date(startDate)
            }
          }
        }).then(function (checks) {
          // res.send(checks);
          if (checks.length > 0) {
            // Нкжно узнать пришёл уходил ли человек, если не уходил, создаём отметку об уходе, если уходил, то необходимо отправить сообщение об этом, ушедший сегодня не может отметиться снова.
            var exitFlag = 0;
            for (var i = 0; i < checks.length; i++) {
              // checks[i]
              if (checks[i].io == 1) {
                exitFlag = 1;
              };
            };
            // res.send({err: exitFlag});
            if (exitFlag == 0) {
              models.checks.create({
                userId: user.id,
                locationId: req.body.locid,
                late: 0,
                io: 1
              }).then(function (check) {
                res.send({check: check, err: false, user: user, location: location});
              }).catch(function (err) {
                console.log(err);
                res.send({err: err});
              });
            }else{
              res.send({err: 'Отметка об уходе уже существует, снова отметиться можео завтра'});
            }
          }else{
            openhours = location.opentime.split(':')[0];
						openminutes = location.opentime.split(':')[1];
            // res.send(openhours);
						// console.log(openhours);
						var rightNowTime = new Date();
						var neededTime = new Date();
						neededTime = neededTime.setHours(openhours - 8, openminutes, 0);
						// neededTime = neededTime.setMinutes(openminutes);
						console.log(new Date(neededTime));
						rightNowTime = rightNowTime.getTime();
						neededTime = new Date(neededTime);
						neededTime = neededTime.getTime();
						console.log(rightNowTime+" "+neededTime);
						// console.log(now.getUTCHours+8);
            var late = 0;
            if (rightNowTime > neededTime) { /* Тут нужно для каждого магазина нужно установть timezone и её пробавлять к УТЦшным временам, но мы же торопимся */
              late = 1;
            }else{
              late = 0;
            }
            models.checks.create({
              userId: user.id,
              locationId: req.body.locid,
              late: late,
              io: 0
            }).then(function (check) {
              res.send({check: check, err: false, user: user, location: location, rightNowTime: rightNowTime, neededTime: neededTime});
            }).catch(function (err) {
              console.log(err);
              res.send({err: err});
            });
          }
        }).catch(function (err) {
          console.log(err);
          res.send({err: err});
        });
      }).catch(function (err) {
        console.log(err);
        res.send({err: err});
      });
    }else{
      res.send({err: 'Неверный ПИН'})
    }
  }).catch(function (err) {
    res.send({err: err});
  });
});

router.post('/getcheckorder', function(req, res, next) {
  var whereObject = {
    include: [ models.users, models.locations ],
    where: {
      createdAt: {
        $lt: new Date(req.body.enddate),
        $gt: new Date(req.body.startdate)
      }
    }
  };
  console.log(whereObject);
  if (req.body.latesonly == 1) {
    whereObject.where.late = 1;
  }
  models.checks.findAll(whereObject).then(function (checks) {
    res.send({checks: checks});
  }).catch(function (err) {
    console.log(err);
    res.send({err: err});
  });
});

router.post('/exportchecks', function (req, res, next) {
  var now = new Date();
  var filename = 'exportchecks' + now.getTime() + '.xlsx';
  var datastring = req.body.charr;
  // console.log();
  var workbook = excelbuilder.createWorkbook(__dirname+'/../exports/checks/', filename);
  var sheet1 = workbook.createSheet('sheet1', 10, datastring.length+2);
  if (datastring && datastring.length > 0) {
    fs.writeFile(__dirname+'/../exports/checks/'+filename, function (err) {
      if (err) {
        res.send({err: err});
      }else{
        sheet1.width(1, 15);
        sheet1.width(2, 15);
        sheet1.width(3, 40);
        sheet1.width(4, 15);
        sheet1.width(5, 15);
        sheet1.set(1, 1, 'Отчет за: ');
        sheet1.set(2, 1, getTimeReadeble(now));
        sheet1.set(1, 2, 'Дата');
        sheet1.set(2, 2, 'Место');
        sheet1.set(3, 2, 'Имя сотрудника');
        sheet1.set(4, 2, 'Приход/Исход');
        sheet1.set(5, 2, 'Опоздание');
        for (var i = 0; i < datastring.length; i++) {
          var subarr = datastring[i].split(';');
          // console.log(datastring[i]);
          for (var j = 0; j < subarr.length; j++) {
            var col = j + 1;
            var row = i + 3;
            sheet1.set(col, row, subarr[j]);
            // console.log(i+3);
          };
        };
        workbook.save(function(err){
          if (err) {
            workbook.cancel();
            res.send({err: err});
          }else{
            // res.send({path: __dirname+'/../exports/checks/'+filename});
            res.send(filename);
            // res.download(__dirname+'/../exports/checks/'+filename, 'Отчет_об_отметках.xlsx');
            console.log('congratulations, your workbook created');
          }
        });
      }
    });
  }else{
    res.send({err: 'Нет отметок!'});
  }
});

router.get('/download-:file',function(req,res){
  var file = __dirname+'/../exports/checks/'+req.params.file;
  res.download(file);
});

module.exports = router;
