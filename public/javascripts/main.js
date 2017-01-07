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
			readebleTime = year + '-' +
				('00' + (date.getMonth()+1)).slice(-2) + '-' +
				('00' + date.getDate()).slice(-2) + ' ' +
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
		$(this).parents('.new-order-form-row').after('<div class="new-order-form-row row">'+row+'</div>');
		$('[data-input=number]').inputmask({mask:'9{*}',greedy: false});
		$('[data-input=date]').inputmask('dd/mm/yyyy',{ "placeholder": "дд/мм/гггг" });
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
	$('body').delegate('.order-list-item:not(.status-removed) .order-status:not(.status-null) .order-status-edit','click',function(){
		var offsetTop = $(this).offset().top + $(this).height();
		var offsetLeft = $(this).offset().left - 150 + $(this).width()/2;
		$('.layout-dark').height($('body').height());
		$('.layout-dark').show();
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
