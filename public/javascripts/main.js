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
					$('a.location-name').text(data.locations.name);
					$('.new-order-shop').text(data.locations.name);
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
	// $('[data-input=time]').inputmask('hh:mm',{ "placeholder": "чч.мм" });
	// $('[data-input=date]').inputmask('dd/mm/yyyy',{ "placeholder": "дд/мм/гггг" });
	// $('[data-input=phone]').inputmask('+7 (999) 999-99-99');
	// $('[data-input=number]').inputmask({mask:'9{*}',greedy: false});

	//Отмена стандартного действия ссылок
	$('body').delegate('a[href*="#"]','click',function(e){
		e.preventDefault();
	})


	//Изменить статус заказа
	var statusarea, statustype;
	$('body').delegate('.order-list-item:not(.status-removed) .order-status:not(.status-null) .order-status-edit','click',function(){
		var offsetTop = $(this).offset().top + $(this).height();
		var offsetLeft = $(this).offset().left - 150 + $(this).width()/2;
		statusarea = $(this).closest('.order-status');
		// console.log(statusarea);
		$('.layout-dark').height($('body').height());
		$('.layout-dark').show();
		var datatitle = $(this).attr('data-title');
		var gooddata = {
			ordernumber: $(this).closest('.order').find('.order-id span').text(),
			goodname: $(this).closest('.order-list-item').find('.order-name').text(),
			googid: datatitle.split(',')[1]
		}
		console.log(gooddata);
		$('.action .action-order').text(gooddata.ordernumber);
		$('.action .action-shop').text(gooddata.goodname);
		statustype = datatitle.split(',')[0];
		$('.action-row.choose-satus').empty();
		switch(statustype) {
			case 'processed':
			$('.action-row.choose-satus').empty();
			$('.action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не обработан</option><option value=1>В обработке</option><option value=2>Обработан</option></select></div>');
			break;
			case 'ordered':
			$('.action-row.choose-satus').empty();
			$('.action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не заказан</option><option value=1>Заказан</option></select></div>');
			break;
			case 'spicifieddate':
			$('.action-row.choose-satus').empty();
			$('.action-row.choose-satus').append('<div class="form-group"><input name="status" type="date" class="form-control"></div>');
			break;
			case 'postponed':
			$('.action-row.choose-satus').empty();
			$('.action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не отложен</option><option value=1>Проверен и отложен</option><option value=2>Есть деффект</option></select></div>');
			break;
			case 'callstatus':
			$('.action-row.choose-satus').empty();
			$('.action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не звонили</option><option value=1>Не дозвон</option><option value=2>Дозвон</option></select></div>');
			break;
			case 'issued':
			$('.action-row.choose-satus').empty();
			$('.action-row.choose-satus').append('<div class="form-group"><select name="status" class="form-control"><option selected value=0>Не выдан</option><option value=1>Выдан</option></select></div>');
			break;
		}
		$('.action').addClass('show');
		$('.action').css({'top':offsetTop, 'left':offsetLeft});
	})

	//Изменить статус заказа
	$('body').delegate('.order-list-item:not(.status-removed) .order-status:not(.status-null) .status-bottom .edit','click',function(){
		var offsetTop = $(this).offset().top + $(this).height() + 20;
		var offsetLeft = $(this).offset().left - 150 + $(this).width()/2;
		$('.layout-dark').height($('body').height());
		$('.layout-dark').show();
		$('.action').addClass('show');
		$('.action').css({'top':offsetTop, 'left':offsetLeft});
	})

	//Закрыть Action
	$('body').on('click','[data-toggle=close-action]',function(){
		$('.layout-dark').hide();
		$('.modal-layout').hide();
		$('.action').removeClass('show');
	})

	//Отмена Action
	$('body').on('click','[data-toggle=cancel-action]',function(){
		$('.layout-dark').hide();
		$('.action').removeClass('show');
	})

	//Сохранить Action
	$('body').on('click','[data-toggle=save-action]',function(){
		$('.layout-dark').hide();
		$('.action').removeClass('show');
		switch(statustype) {
			case 'processed':
			console.log(statusarea);
			statusarea.removeClass('status-danger');
			if ($('select[name="status"] option:selected').val() == 0) {
				statusarea.addClass('status-danger');
				statusarea.find('.status').text('не обработан');
				var now = new Date();
				statusarea.find('.status-date').text(getDateSuperReadeble(now));
			}else if($('select[name="status"] option:selected').val() == 1) {
				statusarea.removeClass('status-danger');
				statusarea.find('.status').text('В обработке');
				var now = new Date();
				statusarea.find('.status-date').text(getDateSuperReadeble(now));
			}else{
				statusarea.removeClass('status-danger');
				statusarea.find('.status').text('Обработан');
				var now = new Date();
				statusarea.find('.status-date').text(getDateSuperReadeble(now));
			}
			break;
			case 'ordered':
			statusarea.removeClass('status-danger');
			if ($('select[name="status"] option:selected').val() == 0) {
				statusarea.addClass('status-danger');
				statusarea.find('.status').text('не Заказан');
				var now = new Date();
				statusarea.find('.status-date').text(getDateSuperReadeble(now));
			}else{
				statusarea.removeClass('status-danger');
				statusarea.find('.status').text('Заказан');
				var now = new Date();
				statusarea.find('.status-date').text(getDateSuperReadeble(now));
			}
			break;
			case 'spicifieddate':
			statusarea.removeClass('status-danger');
			if ($('input[name="status"]').val()) {
				var date = new Date($('input[name="status"]').val());
				statusarea.removeClass('status-danger');
				statusarea.find('.status').text(getDateReadeble(date));
				var now = new Date();
				statusarea.find('.status-date').text(getDateSuperReadeble(now));
			}else{
				statusarea.addClass('status-danger');
				statusarea.find('.status').text('--.--.--');
				var now = new Date();
				statusarea.find('.status-date').text(getDateSuperReadeble(now));
			}
			break;
			case 'postponed':
			statusarea.removeClass('status-danger');
			if ($('select[name="status"] option:selected').val() == 0) {
				statusarea.addClass('status-danger');
				statusarea.find('.status').text('Не отложен');
				var now = new Date();
				statusarea.find('.status-date').text(getDateSuperReadeble(now));
			}else if($('select[name="status"] option:selected').val() == 1) {
				statusarea.removeClass('status-danger');
				statusarea.find('.status').text('Проверен и отложен');
				var now = new Date();
				statusarea.find('.status-date').text(getDateSuperReadeble(now));
			}else{
				statusarea.addClass('status-danger');
				statusarea.find('.status').text('Есть деффект');
				var now = new Date();
				statusarea.find('.status-date').text(getDateSuperReadeble(now));
			}
			break;
			case 'callstatus':
			statusarea.removeClass('status-danger');
			if ($('select[name="status"] option:selected').val() == 0) {
				statusarea.addClass('status-danger');
				statusarea.find('.status').text('Не звонили');
				var now = new Date();
				statusarea.find('.status-date').text(getDateSuperReadeble(now));
			}else if($('select[name="status"] option:selected').val() == 1) {
				statusarea.addClass('status-danger');
				statusarea.find('.status').text('Не дозвон');
				var now = new Date();
				statusarea.find('.status-date').text(getDateSuperReadeble(now));
			}else{
				statusarea.removeClass('status-danger');
				statusarea.find('.status').text('Дозвон');
				var now = new Date();
				statusarea.find('.status-date').text(getDateSuperReadeble(now));
			}
			break;
			case 'issued':
			statusarea.removeClass('status-danger');
			if ($('select[name="status"] option:selected').val() == 0) {
				statusarea.addClass('status-danger');
				statusarea.find('.status').text('не выдан');
				var now = new Date();
				statusarea.find('.status-date').text(getDateSuperReadeble(now));
			}else{
				statusarea.removeClass('status-danger');
				statusarea.find('.status').text('выдан');
				var now = new Date();
				statusarea.find('.status-date').text(getDateSuperReadeble(now));
			}
			break;
		}
	})

	//Удалить заказ из списка
	$('body').on('click','[data-toggle=remove-order]',function(){
		$(this).parents('.order-list-item').toggleClass('status-removed')
	})

	//Открыть историю действий
	$('body').on('click','[data-toggle=open-log]',function(){
		$('.modal-layout').show();
	})

	//Сохранить Log
	$('body').on('click','[data-toggle=save-log]',function(){
		$('.modal-layout').hide();
	})

	//Отмена log
	$('body').on('click','[data-toggle=cancel-log]',function(){
		$('.modal-layout').hide();
	})

	// $('.modal-layout').perfectScrollbar();
	// $('.modal-log-body').perfectScrollbar();
})
