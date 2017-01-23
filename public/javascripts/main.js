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
				// ('00' + date.getSeconds()).slice(-2);
			// console.log(now);
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
		// $('[data-input=number]').inputmask({mask:'9{*}',greedy: false});
		// $('[data-input=date]').inputmask('dd/mm/yyyy',{ "placeholder": "дд/мм/гггг" });
	})

	// Валидация инпутов
	$('[data-input=time]').inputmask('hh:mm',{ "placeholder": "чч.мм" });
	$('[type=time]').inputmask('99:99');//,{ "placeholder": "99.99" });
	// $('[data-input=date]').inputmask('dd/mm/yyyy',{ "placeholder": "дд/мм/гггг" });
	$('[data-input=phone]').inputmask('+7 (999) 999-99-99');
	// $('[data-input=number]').inputmask({mask:'9{*}',greedy: false});

	//Отмена стандартного действия ссылок
	$('body').delegate('a[href*="#"]','click',function(e){
		e.preventDefault();
	})


	//Изменить статус заказа
	// var statusarea, statustype, goodid;
	// $('body').delegate('.order-list-item:not(.status-removed) .order-status:not(.status-null) .order-status-edit','click',function(){
	// 	var offsetTop = $(this).offset().top + $(this).height();
	// 	var offsetLeft = $(this).offset().left - 150 + $(this).width()/2;
	// 	statusarea = $(this).closest('.order-status');
	// 	console.log(statusarea);
	// 	$('.layout-dark').height($('body').height());
	//
	// 	$('.close-layout').fadeIn();
	//
	// 	var datatitle = $(this).attr('data-title');
	// 	var gooddata = {
	// 		ordernumber: $(this).closest('.order').find('.order-id span').text(),
	// 		goodname: $(this).closest('.order-list-item').find('.order-name').text(),
	// 		goodid: datatitle.split(',')[1]
	// 	}
	// 	goodid = gooddata.goodid;
	// 	console.log(gooddata);
	// 	$('.action .action-order').text(gooddata.ordernumber);
	// 	$('.action .action-shop').text(gooddata.goodname);
	// 	statustype = datatitle.split(',')[0];
	// 	$('.action-row.choose-satus').empty();
	// 	switch(statustype) {
	// 		case 'processed':
	// 		$('.action-row.choose-satus').empty();
	// 		$('.action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не обработан</option><option value=1>В обработке</option><option value=2>Обработан</option></select></div>');
	// 		break;
	// 		case 'ordered':
	// 		$('.action-row.choose-satus').empty();
	// 		$('.action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не заказан</option><option value=1>Заказан</option></select></div>');
	// 		break;
	// 		case 'spicifieddate':
	// 		$('.action-row.choose-satus').empty();
	// 		$('.action-row.choose-satus').append('<div class="form-group"><input name="status" type="date" class="form-control"></div>');
	// 		break;
	// 		case 'postponed':
	// 		$('.action-row.choose-satus').empty();
	// 		$('.action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не отложен</option><option value=1>Проверен и отложен</option><option value=2>Есть деффект</option></select></div>');
	// 		break;
	// 		case 'callstatus':
	// 		$('.action-row.choose-satus').empty();
	// 		$('.action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не звонили</option><option value=1>Не дозвон</option><option value=2>Дозвон</option></select></div>');
	// 		break;
	// 		case 'issued':
	// 		$('.action-row.choose-satus').empty();
	// 		$('.action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не выдан</option><option value=1>Выдан</option></select></div>');
	// 		break;
	// 	}
	// 	$('.action').fadeIn();
	// 	$('.action').css({'top':offsetTop, 'left':offsetLeft});
	// });

	$(".order-status-edit.processed").click(function (e) {
		e.preventDefault();
		$('.close-layout').fadeIn();
		$(this).next('.action.processed-action').fadeIn();
		var goodid = $(this).attr('data-title');
		$('.action [name=yourpin]').val('');
		// var offsetTop = $(this).offset().top + $(this).height();
		// var offsetLeft = $(this).offset().left - 150 + $(this).width()/2;
		$('.action.processed-action .action-row.choose-satus').empty();
		$('.action.processed-action .action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не обработан</option><option value=1>В обработке</option></select></div>');
		$('.action .btn-done').attr('data-title', goodid);
		$('.action').css({'top':70, 'left':60});
	});

	$('.action.processed-action .btn-done').click(function (e) {
		e.preventDefault();
		if ($(this).closest('.action').find('input[name=yourpin]').val()){
			var data = {
				yourpin: $(this).closest('.action').find('input[name=yourpin]').val(),
				goodid: $(this).attr('data-title'),
				statusval: $(this).closest('.action').find('select[name="status"]').val()
			}
			console.log(data);
			$.ajax({
				url: '/orders/setprocessed',
				type: 'POST',
				data: data,
				success: function (data, status, error) {
					// console.log(data, status, error);
					if (data.err) {
						alert(data.err);
						$('.close-layout').fadeOut();
						$('.action').fadeOut();
					}else{
						$('.close-layout').fadeOut();
						$('.action').fadeOut();
						console.log(data.processed);
						$(".processed[data-title="+data.processed.goodId+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.processed.createdAt)));
						$(".processed[data-title="+data.processed.goodId+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
						$(".processed[data-title="+data.processed.goodId+"]").closest('.order-status').find('.status-top .status').text(data.processed.alias);
						if (data.processed.statusval != 0) {
							$(".processed[data-title="+data.processed.goodId+"]").closest('.order-status').removeClass('status-danger');
							// $(".processed[data-title="+data.processed.goodId+"]").closest('.order-status').find('.status-top .status').text('В обработке');
						}else{
							$(".processed[data-title="+data.processed.goodId+"]").closest('.order-status').addClass('status-danger');
							// $(".processed[data-title="+data.processed.goodId+"]").closest('.order-status').find('.status-top .status').text('Не обработан');
						}
					}
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
				}
			});
		}else{
			alert('Введите ПИН');
		}
	});

	$(".order-status-edit.spicdate").click(function (e) {
		e.preventDefault();
		$('.close-layout').fadeIn();
		$(this).next('.action.spicdate-action').fadeIn();
		var goodid = $(this).attr('data-title');
		$('.action [name=yourpin]').val('');
		// var offsetTop = $(this).offset().top + $(this).height();
		// var offsetLeft = $(this).offset().left - 150 + $(this).width()/2;
		$('.action-row.choose-satus').empty();
		$('.action-row.choose-satus').append('<div class="form-group"><input name="status" type="date" class="form-control"></div>');
		$('.action .btn-done').attr('data-title', goodid);
		$('.action').css({'top':70, 'left':60});
	});

	$('.action.spicdate-action .btn-done').click(function (e) {
		e.preventDefault();
		if ($(this).closest('.action').find('input[name=yourpin]').val() && $(this).closest('.action').find('input[name=status]').val()){
			var data = {
				yourpin: $(this).closest('.action').find('input[name=yourpin]').val(),
				goodid: $(this).attr('data-title'),
				statusval: $(this).closest('.action').find('input[name="status"]').val()
			}
			// $(".processed[data-title="+data.goodid+"]").closest('.order-status').find('.status-top .status').text('Обработан');
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
						$('.action').fadeOut();
					}else{
						$('.close-layout').fadeOut();
						$('.action').fadeOut();
						console.log(data.spicdate.statusval);
						// console.log($(".spicdate[data-title="+data.goodid+"]").attr('data-title'));
						$(".spicdate[data-title="+data.spicdate.goodId+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.spicdate.createdAt)));
						$(".spicdate[data-title="+data.spicdate.goodId+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
						$(".spicdate[data-title="+data.spicdate.goodId+"]").closest('.order-status').removeClass('status-danger');
						$(".spicdate[data-title="+data.spicdate.goodId+"]").closest('.order-status').find('.status').text(getDateSuperReadeble(new Date(data.spicdate.statusval)));
						// $(".processed[data-title="+data.goodid+"]").closest('.order-status').addClass('status-danger');
						$(".processed[data-title="+data.spicdate.goodId+"]").closest('.order-status').find('.status-top .status').text('Обработан');
					}
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
				}
			});
		}else{
			alert('Заполните все поля');
		}
	});

	$(".order-status-edit.ordered").click(function (e) {
		e.preventDefault();
		$('.close-layout').fadeIn();
		$(this).next('.action.ordered-action').fadeIn();
		var goodid = $(this).attr('data-title');
		$('.action [name=yourpin]').val('');
		// var offsetTop = $(this).offset().top + $(this).height();
		// var offsetLeft = $(this).offset().left - 150 + $(this).width()/2;
		$('.action.ordered-action .action-row.choose-satus').empty();
		$('.action.ordered-action .action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не заказан</option><option value=1>Заказан</option></select></div>');
		$('.action .btn-done').attr('data-title', goodid);
		$('.action').css({'top':70, 'left':60});
	});

	$('.action.ordered-action .btn-done').click(function (e) {
		e.preventDefault();
		if ($(this).closest('.action').find('input[name=yourpin]').val()){
			var data = {
				yourpin: $(this).closest('.action').find('input[name=yourpin]').val(),
				goodid: $(this).attr('data-title'),
				statusval: $(this).closest('.action').find('select[name="status"]').val()
			}
			console.log(data);
			// if ($(this).closest('.action').find('select[name="status"]').val() != 0) {
			// 	$(".ordered[data-title="+data.goodid+"]").closest('.order-status').removeClass('status-danger');
			// 	$(".ordered[data-title="+data.goodid+"]").closest('.order-status').find('.status-top .status').text('Заказан');
			// }else{
			// 	$(".ordered[data-title="+data.goodid+"]").closest('.order-status').addClass('status-danger');
			// 	$(".ordered[data-title="+data.goodid+"]").closest('.order-status').find('.status-top .status').text('Не заказан');
			// }
			$.ajax({
				url: '/orders/setordered',
				type: 'POST',
				data: data,
				success: function (data, status, error) {
					// console.log(data, status, error);
					if (data.err) {
						alert(data.err);
						$('.close-layout').fadeOut();
						$('.action').fadeOut();
					}else{
						$('.close-layout').fadeOut();
						$('.action').fadeOut();
						console.log(data.ordered);
						$(".ordered[data-title="+data.ordered.goodId+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.ordered.createdAt)));
						$(".ordered[data-title="+data.ordered.goodId+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
						if ($(this).closest('.action').find('select[name="status"]').val() != 0) {
							$(".ordered[data-title="+data.ordered.goodId+"]").closest('.order-status').removeClass('status-danger');
							$(".ordered[data-title="+data.ordered.goodId+"]").closest('.order-status').find('.status-top .status').text('Заказан');
						}else{
							$(".ordered[data-title="+data.ordered.goodId+"]").closest('.order-status').addClass('status-danger');
							$(".ordered[data-title="+data.ordered.goodId+"]").closest('.order-status').find('.status-top .status').text('Не заказан');
						}
					}
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
				}
			});
		}else{
			alert('Введите ПИН');
		}
	});

	$(".order-status-edit.postponed").click(function (e) {
		e.preventDefault();
		$('.close-layout').fadeIn();
		$(this).next('.action.postponed-action').fadeIn();
		var goodid = $(this).attr('data-title');
		$('.action [name=yourpin]').val('');
		// var offsetTop = $(this).offset().top + $(this).height();
		// var offsetLeft = $(this).offset().left - 150 + $(this).width()/2;
		// 		$('.action-row.choose-satus').empty();
		// 		$('.action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не отложен</option><option value=1>Проверен и отложен</option><option value=2>Есть деффект</option></select></div>');

		$('.action.postponed-action .action-row.choose-satus').empty();
		$('.action.postponed-action .action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не отложен</option><option value=1>Проверен и отложен</option><option value=2>Есть деффект</option></select></div>');
		$('.action .btn-done').attr('data-title', goodid);
		$('.action').css({'top':70, 'left':60});
	});

	$('.action.postponed-action .btn-done').click(function (e) {
		e.preventDefault();
		// alert($(this).closest('.action').find('select[name="status"]').val());
		if ($(this).closest('.action').find('input[name=yourpin]').val()){
			var data = {
				yourpin: $(this).closest('.action').find('input[name=yourpin]').val(),
				goodid: $(this).attr('data-title'),
				statusval: $(this).closest('.action').find('select[name="status"]').val()
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
						$('.action').fadeOut();
					}else{
						$('.close-layout').fadeOut();
						$('.action').fadeOut();
						console.log(data.postponed);
						$(".postponed[data-title="+data.postponed.goodId+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.postponed.createdAt)));
						$(".postponed[data-title="+data.postponed.goodId+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
						$(".postponed[data-title="+data.postponed.goodId+"]").closest('.order-status').find('.status-top .status').text(data.postponed.alias);
						if (data.postponed.statusval == 1) {
							$(".postponed[data-title="+data.postponed.goodId+"]").closest('.order-status').removeClass('status-danger');
						}else if(data.postponed.statusval == 0){
							$(".postponed[data-title="+data.postponed.goodId+"]").closest('.order-status').addClass('status-danger');
						}else if(data.postponed.statusval == 2){
							$(".postponed[data-title="+data.postponed.goodId+"]").closest('.order-status').addClass('status-danger');
						}
					}
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
				}
			});
		}else{
			alert('Введите ПИН');
		}
	});

	$(".order-status-edit.callstatus").click(function (e) {
		e.preventDefault();
		$('.close-layout').fadeIn();
		$(this).next('.action.callstatus-action').fadeIn();
		var goodid = $(this).attr('data-title');
		$('.action [name=yourpin]').val('');
		// var offsetTop = $(this).offset().top + $(this).height();
		// var offsetLeft = $(this).offset().left - 150 + $(this).width()/2;
		// 		$('.action-row.choose-satus').empty();
		// 		$('.action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не отложен</option><option value=1>Проверен и отложен</option><option value=2>Есть деффект</option></select></div>');

		$('.action.callstatus-action .action-row.choose-satus').empty();
		$('.action.callstatus-action .action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не звонили</option><option value=1>Дозвон</option><option value=2>Не дозвон</option></select></div>');
		$('.action .btn-done').attr('data-title', goodid);
		$('.action').css({'top':70, 'left':60});
	});

	$('.action.callstatus-action .btn-done').click(function (e) {
		e.preventDefault();
		if ($(this).closest('.action').find('input[name=yourpin]').val()){
			var data = {
				yourpin: $(this).closest('.action').find('input[name=yourpin]').val(),
				goodid: $(this).attr('data-title'),
				statusval: $(this).closest('.action').find('select[name="status"]').val()
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
						$('.action').fadeOut();
					}else{
						$('.close-layout').fadeOut();
						$('.action').fadeOut();
						console.log(data.callstatus);
						$(".callstatus[data-title="+data.callstatus.goodId+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.callstatus.createdAt)));
						$(".callstatus[data-title="+data.callstatus.goodId+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
						if (data.callstatus.statusval == 1) {
							$(".callstatus[data-title="+data.callstatus.goodId+"]").closest('.order-status').removeClass('status-danger');
							$(".callstatus[data-title="+data.callstatus.goodId+"]").closest('.order-status').find('.status-top .status').text('Дозвон');
						}else if(data.callstatus.statusval == 0){
							$(".callstatus[data-title="+data.callstatus.goodId+"]").closest('.order-status').addClass('status-danger');
							$(".callstatus[data-title="+data.callstatus.goodId+"]").closest('.order-status').find('.status-top .status').text('Не Звонили');
						}else{
							$(".callstatus[data-title="+data.callstatus.goodId+"]").closest('.order-status').addClass('status-danger');
							$(".callstatus[data-title="+data.callstatus.goodId+"]").closest('.order-status').find('.status-top .status').text('Не дозвон');
						}
					}
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
				}
			});
		}else{
			alert('Введите ПИН');
		}
	});

	$(".order-status-edit.issued").click(function (e) {
		e.preventDefault();
		$('.close-layout').fadeIn();
		$(this).next('.action.issued-action').fadeIn();
		var goodid = $(this).attr('data-title');
		$('.action [name=yourpin]').val('');
		// var offsetTop = $(this).offset().top + $(this).height();
		// var offsetLeft = $(this).offset().left - 150 + $(this).width()/2;
		// 		$('.action-row.choose-satus').empty();
		// 		$('.action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не отложен</option><option value=1>Проверен и отложен</option><option value=2>Есть деффект</option></select></div>');

		$('.action.issued-action .action-row.choose-satus').empty();
		$('.action.issued-action .action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не выдан</option><option value=1>Выдан</option></select></div>');
		$('.action .btn-done').attr('data-title', goodid);
		$('.action').css({'top':70, 'left':60});
	});

	$('.action.issued-action .btn-done').click(function (e) {
		e.preventDefault();
		if ($(this).closest('.action').find('input[name=yourpin]').val()){
			var data = {
				yourpin: $(this).closest('.action').find('input[name=yourpin]').val(),
				goodid: $(this).attr('data-title'),
				statusval: $(this).closest('.action').find('select[name="status"]').val()
			}
			console.log(data);

			$.ajax({
				url: '/orders/setissued',
				type: 'POST',
				data: data,
				success: function (data, status, error) {
					// console.log(data, status, error);
					if (data.err) {
						alert(data.err);
						$('.close-layout').fadeOut();
						$('.action').fadeOut();
					}else{
						$('.close-layout').fadeOut();
						$('.action').fadeOut();
						console.log(data.issued);
						$(".issued[data-title="+data.issued.goodId+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.issued.createdAt)));
						$(".issued[data-title="+data.issued.goodId+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
						$(".issued[data-title="+data.issued.goodId+"]").closest('.order-status').find('.status-top .status').text(data.issued.alias);
						if (data.issued.statusval == 1) {
							$(".issued[data-title="+data.issued.goodId+"]").closest('.order-status').removeClass('status-danger');
						}else{
							$(".issued[data-title="+data.issued.goodId+"]").closest('.order-status').addClass('status-danger');
						}
					}
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
				}
			});
		}else{
			alert('Введите ПИН');
		}
	});

	// $('.action').on('click','.spicdate [data-toggle=save-action]', function (e) {
	// 	e.preventDefault();
	// 	if ($('.action [name=yourpin]').val() && $('input[name="status"]')){
	// 		var data = {
	// 			yourpin: $('.action [name=yourpin]').val(),
	// 			goodid: $(this).attr('data-title'),
	// 			statusval: $('input[name="status"]').val()
	// 		}
	// 		console.log(data);
	// 		if ($('select[name="status"]').val() != 0) {
	// 			$(".spicdate[data-title="+data.goodid+"]").closest('.order-status').removeClass('status-danger');
	// 			// $(".processed[data-title="+data.goodid+"]").closest('.order-status').find('.status-top .status').text('В обработке');
	// 		}else{
	// 			$(".spicdate[data-title="+data.goodid+"]").closest('.order-status').addClass('status-danger');
	// 			// $(".processed[data-title="+data.goodid+"]").closest('.order-status').find('.status-top .status').text('Не обработан');
	// 		}
	// 		$.ajax({
	// 			url: '/orders/setspicdate',
	// 			type: 'POST',
	// 			data: data,
	// 			success: function (data, status, error) {
	// 				// console.log(data, status, error);
	// 				if (data.err) {
	// 					alert(data.err);
	// 				}else{
	// 					$('.close-layout').fadeOut();
	// 					$('.action').fadeOut();
	// 					console.log(data.spicdate);
	// 					$(".spicdate[data-title="+data.goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.spicdate.createdAt)));
	// 					$(".spicdate[data-title="+data.goodid+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
	// 					$(".spicdate[data-title="+data.goodid+"]").closest('.order-status').find('.status-top .status').text(getDateSuperReadeble(new Date(data.spicdate.statusval)));
	// 				}
	// 			},
	// 			error: function (data, status, error) {
	// 				console.log(data, status, error);
	// 				alert(error);
	// 			}
	// 		});
	// 	}else{
	// 		alert('Заполните поля');
	// 	}
	// });

	// $('body').on('click','[data-toggle=save-action]',function(){
	// 	if ($('[name=yourpin]').val()){
	// 		$('.layout-dark').hide();
	// 		$('.action').fadeOut();
	// 	}else{
	// 		alert('Введите ПИН');
	// 	}
	// });


	//Изменить статус заказа
	// $('body').delegate('.order-list-item:not(.status-removed) .order-status:not(.status-null) .status-bottom .edit','click',function(){
	// 	var offsetTop = $(this).offset().top + $(this).height() + 20;
	// 	var offsetLeft = $(this).offset().left - 150 + $(this).width()/2;
	// 	$('.layout-dark').height($('body').height());
	// 	$('.layout-dark').show();
	// 	$('.action').fadeIn();
	// 	$('.action').css({'top':offsetTop, 'left':offsetLeft});
	// })

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
					$('.history .table tbody').append('<tr><td>'+getTimeReadeble(new Date(data.actions[i].createdAt)) +"</td><td>"+ data.actions[i].user.name +"</td><td>"+ data.actions[i].location.alias +"</td><td>"+ data.actions[i].alias+'</td></tr>');
					// $('.history').append(data.good.processed);
				}
				// console.log(data.good.processed.createdAt +" "+ data.good.processed.user.name +" "+ data.good.processed.location.alias +" "+ data.good.processed.alias);
				$(".close-layout").fadeIn();
				$('.history').fadeIn();
			},
			error: function (data, status, error) {
				console.log(data, status, error);
			}
		});
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
