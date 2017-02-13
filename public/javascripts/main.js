//убъем автокомплит на пинах

$(document).ready(function () {
	$("[name='yourpin']").attr('autocomplete','off')
});

//Работа с куки

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) == 0) {
			return c.substring(name.length,c.length);
		}
	}
	return "";
}

function removeCookie(cookie_name){
	var cookie_date = new Date ();
	cookie_date.setTime (cookie_date.getTime() - 1);
	document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
}

// Проверка ПИН

function pinAuth(status,pin) {
	return new Promise(function (resolve, reject) {
		var data = {
			status: status,
			pin: pin
		}
		$.ajax({
			url: '/pinauth',
			type: 'POST',
			data: data,
			success: function (data, status, error) {
				console.log(data, status, error);
				if (data.err) {
					resolve(data.err);
				}else{
					resolve(data.response)
				}
			},
			error: function (data, status, error) {
				console.log(data, status, error);
				reject(error);
			}
		});
	});
}

//проверка места
function getLoc(locid) {
	if (locid) {
		console.log('location exist', locid);
		// a.location-name
		var data = {
			locid: locid
		};
		$.ajax({
			url: '/getloc',
			type: 'POST',
			data: data,
			success: function (data, status, error) {
				console.log(data, status, error);
				if (data.err) {
					alert(data.err);
				}else{
					$('a.location-name').text(data.locations.alias);
				}
			},
			error: function (data, status, error) {
				console.log(data, status, error);
			}
		});
		$("div.choose-location").each(function () {
			if ($(this).attr('data-title') == locid) {
				$(this).parent().parent().css('background-color', '#36C786');
				$(this).text("Выбрано");
			}
		});
	}else{
		console.log('location not exist');
	}
}

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
function getDateReadeble(date){
	var readebleTime;//1998-02-03 22:23:00
	var year = date.getFullYear();
			readebleTime = year + '-' +
				('00' + (date.getMonth()+1)).slice(-2) + '-' +
				('00' + date.getDate()).slice(-2);
				// ('00' + date.getSeconds()).slice(-2);
			// console.log(now);
			return readebleTime;
};
function getDateSuperReadeble(date){
	var readebleTime;//1998-02-03 22:23:00
	var year = date.getFullYear();
			readebleTime = ('00' + date.getDate()).slice(-2) + '.' +
			('00' + (date.getMonth()+1)).slice(-2) + '.' +
			year;
			return readebleTime;
};
function getTimeReadebleYesterday(date){
	var readebleTime;//1998-02-03 22:23:00
			date.setDate(date.getDate()-1);
			readebleTime = now.getFullYear() + '-' +
				('00' + (date.getMonth()+1)).slice(-2) + '-' +
				('00' + date.getDate()).slice(-2) + ' ' +
				('00' + date.getHours()).slice(-2) + ':' +
				('00' + date.getMinutes()).slice(-2);
			return readebleTime;
};


$(document).ready(function(){

	$('.close-layout').click(function () {
		$('.action').fadeOut();
	});

	getLoc(getCookie("location"));

	//Удалить заказ
	$('.new-order').on('click','[data-toggle=remove-row]',function(){
		$(this).parents('.new-order-form-row').remove();
	})

	//Добавить заказ
	$('.new-order').on('click','[data-toggle=add-row]',function(){
		var row = $(this).parents('.new-order-form-row').html();
		$(this).removeClass('add');
		$(this).addClass('remove');
		$(this).attr('data-toggle','remove-row');
		$(this).html('<i class="fa fa-times-circle" aria-hidden="true"></i>&nbspУдалить товар');
		$(this).parents('.new-order-form-row').after('<div class="new-order-form-row good-item row">'+row+'</div>');
	})

	// Валидация инпутов
	$('[data-input=time]').inputmask('hh:mm',{ "placeholder": "чч.мм" });
	$('[type=time]').inputmask('99:99');
	$('[data-input=phone]').inputmask('+7 (999) 999-99-99');

	//Отмена стандартного действия ссылок
	// $('body').delegate('a[href*="#"]','click',function(e){
	// 	e.preventDefault();
	// });

	$("li.status-menu a.lustran-dropdown").click(function () {
		$(".status-menu-dropdown").toggleClass('show');
	});

	$('.status-menu-dropdown .dropdown select').change(function () {
		// e.preventDefault();
		$(this).val()
		if ($(this).val()) {
			$(this).addClass('changed');
		}else{
			$(this).removeClass('changed');
		}
	});

	var thisAction = $(".action");

	$(".order-status-edit").click(function (e) {
		e.preventDefault();
		thisAction = $(this).next(".action");
		$(".action").fadeOut();
		$(".close-layout").fadeIn();
		thisAction.fadeIn();
		thisAction.find("input[name='yourpin']").val('');
		thisAction.find("input[name='yourpin']").focus();
	});

	thisAction.keyup(function (e) {
		if (e.keyCode == 13) {
			e.preventDefault();
			if (thisAction.hasClass('processed-action')) {
				setProcessed(thisAction);
			}
			if (thisAction.hasClass('spicdate-action')) {
				setSpicdate(thisAction);
			}
			if (thisAction.hasClass('ordered-action')) {
				setOrdered(thisAction);
			}
			if (thisAction.hasClass('postponed-action')) {
				setPostponed(thisAction);
			}
			if (thisAction.hasClass('callstatus-action')) {
				setCallstatus(thisAction);
			}
			if (thisAction.hasClass('issued-action')) {
				setIssued(thisAction);
			}
		}
	});

	thisAction.find('.btn-done').click(function (e) {
			e.preventDefault();
			if (thisAction.hasClass('processed-action')) {
				setProcessed(thisAction);
			}
			if (thisAction.hasClass('spicdate-action')) {
				setSpicdate(thisAction);
			}
			if (thisAction.hasClass('ordered-action')) {
				setOrdered(thisAction);
			}
			if (thisAction.hasClass('postponed-action')) {
				setPostponed(thisAction);
			}
			if (thisAction.hasClass('callstatus-action')) {
				setCallstatus(thisAction);
			}
			if (thisAction.hasClass('issued-action')) {
				setIssued(thisAction);
			}
	});

	function setProcessed(action) {
		if (action.find('input[name=yourpin]').val()){
			var goodid = action.find('.btn-done').attr('data-title');
			var data = {
				yourpin: action.find('input[name=yourpin]').val(),
				comment: action.find('textarea[name=comment]').val(),
				goodid: action.find('.btn-done').attr('data-title'),
				statusval: action.find('select[name="status"]').val()
			}
			console.log(data);
			$.ajax({
				url: '/orders/setprocessed',
				type: 'POST',
				data: data,
				success: function (data, status, error) {
					if (data.err) {
						alert(data.err);
						console.log(data.err);
						$('.close-layout').fadeOut();
						action.fadeOut();
					}else{
						$('.close-layout').fadeOut();
						action.fadeOut();
						console.log(data.processed);
						$(".processed[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.processed.createdAt)));
						$(".processed[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
						$(".processed[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.processed.alias);
						if (data.processed.statusval != 0) {
							$(".processed[data-title="+goodid+"]").closest('.order-status').removeClass('status-danger');
							$(".ordersproc").text(data.pcount);
						}else{
							$(".processed[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".ordersproc").text(data.pcount);
						}
					}
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
					$('.close-layout').fadeOut();
					action.fadeOut();
				}
			});
		}else{
			alert('Введите ПИН');
		};
	};

	function setSpicdate(action) {
		var today = new Date();
	  var dd = today.getDate();
	  var mm = today.getMonth()+1; //January is 0!
	  var yyyy = today.getFullYear();
		var nowtime = today.getTime();
	   if(dd<10){
	          dd='0'+dd
	      }
	      if(mm<10){
	          mm='0'+mm
	      }
	  today = yyyy+'-'+mm+'-'+dd;
	  action.find("input[type=date]").attr("min", today);
		var correctDate = true;
    // action.find('.new-order-form-row.good-item').each(function () {
    indicativedate = new Date(action.find('input[name="status"]').val());
		// console.log(indicativedate);
    indicativetime = indicativedate.getTime();
		console.log(indicativetime);
		console.log(nowtime);
    if ((indicativetime < nowtime) || (!/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/g.test(action.find('input[name=status]').val()))) {
      correctDate = false;
    }
		if (correctDate) {
			if (action.find('input[name=yourpin]').val() && action.find('input[name=status]').val() && action.find('textarea[name=comment]').val()){
				var goodid = action.find('.btn-done').attr('data-title');
				var data = {
					yourpin: action.find('input[name=yourpin]').val(),
					comment: action.find('textarea[name=comment]').val(),
					goodid: action.find('.btn-done').attr('data-title'),
					statusval: action.find('input[name="status"]').val()
				}
				console.log(data);
				$.ajax({
					url: '/orders/setspicdate',
					type: 'POST',
					data: data,
					success: function (data, status, error) {
						// console.log(data, status, error);
						if (data.err) {
							alert(data.err);
							$('.close-layout').fadeOut();
							action.fadeOut();
						}else{
							$('.close-layout').fadeOut();
							action.fadeOut();
							console.log(data.spicdate.statusval);
							$(".spicdate[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.spicdate.createdAt)));
							$(".spicdate[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
							$(".spicdate[data-title="+goodid+"]").closest('.order-status').removeClass('status-danger');
							$(".spicdate[data-title="+goodid+"]").closest('.order-status').find('.status').text(getDateSuperReadeble(new Date(data.spicdate.statusval)));
							$(".processed[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text('Обработан');
						}
					},
					error: function (data, status, error) {
						console.log(data, status, error);
						alert(error);
						$('.close-layout').fadeOut();
						action.fadeOut();
					}
				});
			}else{
				alert('Заполните все поля');
			}
		}else{
			alert('Не корректная дата!');
		}
    // });

	}

	function setOrdered(action) {
		if (action.find('input[name=yourpin]').val()){
			var goodid = action.find('.btn-done').attr('data-title');
			var data = {
				yourpin: action.find('input[name=yourpin]').val(),
				comment: action.find('textarea[name=comment]').val(),
				goodid: action.find('.btn-done').attr('data-title'),
				statusval: action.find('select[name="status"]').val()
			}
			console.log(data);
			$.ajax({
				url: '/orders/setordered',
				type: 'POST',
				data: data,
				success: function (data, status, error) {
					if (data.err) {
						alert(data.err);
						$('.close-layout').fadeOut();
						action.fadeOut();
					}else{
						$('.close-layout').fadeOut();
						action.fadeOut();
						console.log(data.ordered);
						$(".ordered[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.ordered.createdAt)));
						$(".ordered[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
						if ($(this).closest('.action').find('select[name="status"]').val() != 0) {
							$(".ordered[data-title="+goodid+"]").closest('.order-status').removeClass('status-danger');
							$(".ordered[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text('Заказан');
						}else{
							$(".ordered[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".ordered[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text('Не заказан');
						}
					}
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
					$('.close-layout').fadeOut();
					action.fadeOut();
				}
			});
		}else{
			alert('Введите ПИН');
		}
	}

	function setPostponed(action) {
		if (action.find('input[name=yourpin]').val() && action.find('textarea[name=comment]').val()){
			var goodid = action.find('.btn-done').attr('data-title');
			var data = {
				yourpin: action.find('input[name=yourpin]').val(),
				comment: action.find('textarea[name=comment]').val(),
				goodid: action.find('.btn-done').attr('data-title'),
				statusval: action.find('select[name="status"]').val()
			}
			console.log(data);
			$.ajax({
				url: '/orders/setpostponed',
				type: 'POST',
				data: data,
				success: function (data, status, error) {
					// console.log(data, status, error);
					if (data.err) {
						alert(data.err);
						$('.close-layout').fadeOut();
						action.fadeOut();
					}else{
						$('.close-layout').fadeOut();
						action.fadeOut();
						console.log(data.postponed);
						$(".postponed[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.postponed.createdAt)));
						$(".postponed[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
						$(".postponed[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.postponed.alias);
						if (data.postponed.statusval == 1) {
							$(".postponed[data-title="+goodid+"]").closest('.order-status').removeClass('status-danger');
							$(".ordersdef").text(data.pcount);
						}else if(data.postponed.statusval == 0){
							$(".postponed[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".ordersdef").text(data.pcount);
						}else if(data.postponed.statusval == 2){
							$(".postponed[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".ordersdef").text(data.pcount);
						}
					}
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
					$('.close-layout').fadeOut();
					action.fadeOut();
				}
			});
		}else{
			alert('Заполните все поля!');
		}
	}

	function setCallstatus(action) {
		if (action.find('input[name=yourpin]').val()){
			var goodid = action.find('.btn-done').attr('data-title');
			var data = {
				yourpin: action.find('input[name=yourpin]').val(),
				comment: action.find('textarea[name=comment]').val(),
				goodid: action.find('.btn-done').attr('data-title'),
				statusval: action.find('select[name="status"]').val()
			}
			console.log(data);
			$.ajax({
				url: '/orders/setcallstatus',
				type: 'POST',
				data: data,
				success: function (data, status, error) {
					// console.log(data, status, error);
					if (data.err) {
						alert(data.err);
						$('.close-layout').fadeOut();
						action.fadeOut();
					}else{
						$('.close-layout').fadeOut();
						action.fadeOut();
						console.log(data.callstatus);
						$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.callstatus.createdAt)));
						$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
						if (data.callstatus.statusval == 1) {
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').removeClass('status-danger');
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text('Дозвон');
						}else if(data.callstatus.statusval == 0){
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text('Не Звонили');
						}else{
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text('Не дозвон');
						}
					}
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
					$('.close-layout').fadeOut();
					action.fadeOut();
				}
			});
		}else{
			alert('Введите ПИН');
		}
	}

	function setIssued(action) {
		if (action.find('input[name=yourpin]').val()){
			var goodid = action.find('.btn-done').attr('data-title');
			var data = {
				yourpin: action.find('input[name=yourpin]').val(),
				comment: action.find('textarea[name=comment]').val(),
				goodid: action.find('.btn-done').attr('data-title'),
				statusval: action.find('select[name="status"]').val()
			}
			console.log(data);

			$.ajax({
				url: '/orders/setissued',
				type: 'POST',
				data: data,
				success: function (data, status, error) {
					if (data.err) {
						alert(data.err);
						$('.close-layout').fadeOut();
						action.fadeOut();
					}else{
						$('.close-layout').fadeOut();
						action.fadeOut();
						console.log(data.issued);
						$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.issued.createdAt)));
						$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
						$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.issued.alias);
						if (data.issued.statusval == 1) {
							$(".issued[data-title="+goodid+"]").closest('.order-status').removeClass('status-danger');
							$(".ordersissued").text(data.pcount);
						}else{
							$(".issued[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".ordersissued").text(data.pcount);
						}
					}
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
					$('.close-layout').fadeOut();
					action.fadeOut();
				}
			});
		}else{
			alert('Введите ПИН');
		}
	}

	//Закрыть Action
	$('body').on('click','[data-toggle=close-action]',function(){
		$('.layout-dark').hide();
		$('.modal-layout').hide();
		$('.close-layout').fadeOut();
		$('.action').fadeOut();
	})

	//Отмена Action
	$('body').on('click','[data-toggle=cancel-action]',function(){
		$('.layout-dark').hide();
		$('.close-layout').fadeOut();
		$('.action').fadeOut();
	})

	//Сохранить Action


	//Удалить заказ из списка
	$('body').on('click','[data-toggle=remove-order]',function(){
		$(this).parents('.order-list-item').toggleClass('status-removed')
	})

	//Открыть историю действий
	$('body').on('click','.gethistory',function(e){
		// $('.modal-layout').show();
		e.preventDefault();
		var goodid = $(this).attr('data-title');
		$.ajax({
			url: '/orders/getgoodhistiry',
			type: 'POST',
			data: {
				goodid: goodid,
			},
			success: function (data, status, error) {
				console.log(data);
				$('.history .table tbody').empty();
				for (var i = 0; i < data.actions.length; i++) {
					// data.actions[i]
					var comment = data.actions[i].comment == null ? '' : data.actions[i].comment
					$('.history .table tbody').append('<tr><td>'+getTimeReadeble(new Date(data.actions[i].createdAt)) +"</td><td>"+ data.actions[i].user.name +"</td><td>"+ data.actions[i].location.alias +'</td><td>'+ data.actions[i].alias+'</td><td>'+ comment +'</td></tr>');
					// $('.history').append(data.good.processed);
				}
				// console.log(data.good.processed.createdAt +" "+ data.good.processed.user.name +" "+ data.good.processed.location.alias +" "+ data.good.processed.alias);
				$(".close-layout").fadeIn();
				$('.history').fadeIn();
				$('input[name="goodid"]').val(goodid);
				$(".addcomment input[name='yourpin']").val('');
				$(".addcomment textarea[name='comment']").val('');
				$(".addcomment input[name='yourpin']").focus();
			},
			error: function (data, status, error) {
				console.log(data, status, error);
			}
		});
	});

	$(".history .addcomment-submit").click(function (e) {
		e.preventDefault();
		if ($(".addcomment input[name='yourpin']").val() && $(".addcomment textarea[name='comment']").val()) {
			data = {
				yourpin: $(".addcomment input[name='yourpin']").val(),
				comment: $(".addcomment textarea[name='comment']").val(),
				goodid: $(".addcomment input[name='goodid']").val()
			}
			$.ajax({
				url: "/orders/addcomment",
				type: "POST",
				data: data,
				success: function (data, status, error) {
					console.log(data, status, error);
					if (data.err) {
						alert(data.err);
						console.log(data.err);
					}else{
						var comment = data.action.comment == null ? '' : data.action.comment
						$('.history .table tbody').append('<tr><td>'+getTimeReadeble(new Date(data.action.createdAt)) +"</td><td>"+ data.action.user.name +"</td><td>"+ data.action.location.alias +'</td><td>'+ data.action.alias+'</td><td>'+ comment +'</td></tr>');
						$(".addcomment input[name='yourpin']").val('');
						$(".addcomment textarea[name='comment']").val('');
						$(".addcomment input[name='yourpin']").focus();
					}
				},
				error: function (data, status, error) {
					console.log(data, status, error);
				}
			});

		}else{
			alert("3аполните все поля");
		}
	});

	$(".history").keyup(function (e) {
		if ( e.which == 13 ) {
	    e.preventDefault();
			if ($(".addcomment input[name='yourpin']").val() && $(".addcomment textarea[name='comment']").val()) {
				data = {
					yourpin: $(".addcomment input[name='yourpin']").val(),
					comment: $(".addcomment textarea[name='comment']").val(),
					goodid: $(".addcomment input[name='goodid']").val()
				}
				$.ajax({
					url: "/orders/addcomment",
					type: "POST",
					data: data,
					success: function (data, status, error) {
						console.log(data, status, error);
						if (data.err) {
							alert(data.err);
							console.log(data.err);
						}else{
							var comment = data.action.comment == null ? '' : data.action.comment
							$('.history .table tbody').append('<tr><td>'+getTimeReadeble(new Date(data.action.createdAt)) +"</td><td>"+ data.action.user.name +"</td><td>"+ data.action.location.alias +'</td><td>'+ data.action.alias+'</td><td>'+ comment +'</td></tr>');
							$(".addcomment input[name='yourpin']").val('');
							$(".addcomment textarea[name='comment']").val('');
							$(".addcomment input[name='yourpin']").focus();
						}
					},
					error: function (data, status, error) {
						console.log(data, status, error);
					}
				});

			}else{
				alert("3аполните все поля");
			}
	  }
	});

	//Search

	$('.lustran-search-form input[type=text]').keyup(function( event ) {
	  if ( event.which == 13 ) {
	    event.preventDefault();
			// alert('Enter!');
	  }
	});

	//Сохранить Log
	$('body').on('click','[data-toggle=save-log]',function(){
		$('.modal-layout').hide();
	});

	//Отмена log
	$('body').on('click','[data-toggle=cancel-log]',function(){
		$('.modal-layout').hide();
	});

	// $('.modal-layout').perfectScrollbar();
	// $('.modal-log-body').perfectScrollbar();
});
