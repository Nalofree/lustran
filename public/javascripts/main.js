
// Велосипедостроение MODE ON

$.fn.form = function() {
    var formData = {};
    this.find('[name]').each(function() {
        formData[this.name] = this.value;
    })
    return formData;
};

$.fn.serializeObject = function() {
    var data = {};
    $.each( this.serializeArray(), function( key, obj ) {
        var a = obj.name.match(/(.*?)\[(.*?)\]/);
        if(a !== null)
        {
            var subName = new String(a[1]);
            var subKey = new String(a[2]);
            if( !data[subName] ) {
              data[subName] = { };
              data[subName].length = 0;
            };
            if (!subKey.length) {
                subKey = data[subName].length;
            }
            if( data[subName][subKey] ) {
              if( $.isArray( data[subName][subKey] ) ) {
                data[subName][subKey].push( obj.value );
              } else {
                data[subName][subKey] = { };
                data[subName][subKey].push( obj.value );
              };
            } else {
                data[subName][subKey] = obj.value;
            };
            data[subName].length++;
        } else {
            var keyName = new String(obj.name);
            if( data[keyName] ) {
                if( $.isArray( data[keyName] ) ) {
                    data[keyName].push( obj.value );
                } else {
                    data[keyName] = { };
                    data[keyName].push( obj.value );
                };
            } else {
                data[keyName] = obj.value;
            };
        };
    });
    return data;
};

// Велосипедостроение MODE OFF

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

	var clipboard = new Clipboard('.order-name-copy');

	$(".order-name-copy").click(function () {
		var copiedtooltip = $(this).children(".copiedtooltip");
		copiedtooltip.fadeIn(200, function () {
			setTimeout(function () {
				copiedtooltip.fadeOut(500)
			}, 600);
		});
	});

	function orderSortName(elem) {
		var text = elem.text();
		var textLength = elem.text().split(' ').length;
		if (textLength > 4) {
			var textArr = elem.text().split(' ');
			textArr.splice(4, textLength-1)
			elem.text(textArr.join(' ')+"...");
		}
	}



	$(".order-name").each(function () {
		// orderSortName($(this));
	})

// var s = $('form').serializeArray();

// Hacker mode ON

var mikrotimefield = document.getElementById("mikrotimefield");
if (mikrotimefield) {
  var nowtimevar = function () {
    var now = new Date();
    return now;
  }
  setInterval(function () {
    mikrotimefield.value = nowtimevar().getTime();
    // console.log(nowtimevar().getTime());
  },500);
}


//Hacker mode OFF

$("form[name='filter']").ready(function () {
	if (getCookie('filterdata')) {
		// console.log('filtr saved');
		var filtrobj = JSON.parse(getCookie('filterdata'));
		$.each(filtrobj, function(key, val) {
			// if ($("#"+key).attr('type') == '') {
			//
			// }
			$("select#"+key).val(val);
			$("input#"+key+"[type='checkbox']").attr("checked",true);
			$("input#"+key+"[type='data']").val(val);
      $("select#"+key).val(val);
      if ((key == 'startperiod' || key == 'endperiod') && val) {
        $(".archive-period").show();
      }
      if (key == "locationslist") {
        if (typeof(val) == 'string') {
          $("input#locationslist-"+val+"[name='locationslist']").attr("checked",true);
        }else{
          for (var i = 0; i < val.length; i++) {
            $("input#locationslist-"+val[i]+"[name='locationslist']").attr("checked",true);
          }
        }
      }
			console.log(key+": "+val);
      console.log(getCookie('filterdata'));
		  // $("#" + this).text("My id is " + this + ".");
			//   return (this != "four"); // will stop running to skip "five"
		});
	}
});

// $("#locationsall").change(function () {
//   if ($(this).prop('checked')) {
//     $(".locationslist input[type='checkbox']").each(function () {
//       $(this).prop('checked', true);
//     });
//   }else{
//     $(".locationslist input[type='checkbox']").each(function () {
//       $(this).prop('checked', false);
//     });
//   }
// });

$("form[name='filter'] input[type='submit']").click(function (e) {
	e.preventDefault();
	// var s = $("form[name='filter']").serializeObject();
	// var s = $("form[name='filter']").form();
	var formArray = [];
	var s = $("form[name='filter']").serializeArray();
	for (var i = 0; i < s.length; i++) {
		if (i>0) {
			if (s[i].name == s[i-1].name) {
				formArray[s[i-1].name] = [];
				formArray[s[i-1].name].push(s[i-1].value);
				formArray[s[i-1].name].push(s[i].value);
			}else{
				formArray[s[i].name] = s[i].value;
			}
		}else{
			formArray[s[i].name] = s[i].value;
		}
	}
	// console.log(s);
	// console.log(formArray);
	var formObj = $.extend({}, formArray);
	// console.log(formObj);
	var formJSON = JSON.stringify(formObj);
	// console.log(formJSON);
	setCookie('filterdata',formJSON,365);
	// console.log(getCookie('filterdata'));
	$("form[name='filter']").submit();
});

$(".resetfiltr a").click(function (e) {
	e.preventDefault();
	// console.log(getCookie('filterdata'));
	removeCookie('filterdata');
	// console.log(getCookie('filterdata'));
	location.href = '/orders';
});

  function filterGreen() {
    $("form[name='filter'] select").each(function () {
      if ( ($(this).val() && $(this).val() !== '0' && $(this).val() !== '2') || ($(this).val() === '2' && $(this).attr("name") === 'processed') ) {
        $(this).css("background-color","#36c786");
        $(this).css("border-color","#36c786");
        $(this).css("color","#fff");
        $(this).find("option").css("background-color","#fff");
        $(this).find("option").css("border-color","#fff");
        $(this).find("option").css("color","#444");
      }else{
        $(this).css("background-color","#fff");
        $(this).css("border-color","#fff");
        $(this).css("color","#444");
      }
    });
  }

  $("input[type='checkbox']#spicdate").change(function () {
    if ($(this).prop('checked') && $("form[name='filter'] select[name='processed']").val() != '2') {
      $("form[name='filter'] select[name='processed']").val('');
      filterGreen();
    }
  });

  if ($("input[type='checkbox']#spicdate").prop('checked')) {
    $("form[name='filter'] select[name='processed']").val('');
    filterGreen();
  }

  $("form[name='filter'] select[name='processed']").change(function () {
    if ($(this).val() == '1' || $(this).val() == '0') {
      $("input[type='checkbox']#spicdate").prop("checked", false);
      filterGreen();
    }
  });

  $("form[name='filter'] select").change(function () {
    if($(this).val()) {
      var prevSelect = $(this).closest(".dropdown").prevAll().find("select");
      var nextSelect = $(this).closest(".dropdown").nextAll().find("select");
      prevSelect.each(function () {
        if ($(this).val() == '0'  || (($(this).attr('name') == 'processed' && $(this).val() == '1') || ($(this).attr('name') == 'postponed' && $(this).val() == '2') || ($(this).attr('name') == 'callstatus' && $(this).val() == '2'))) {
          $(this).val('');
        }
      });
      nextSelect.each(function () {
        $(this).val('0');
      });
    }
    filterGreen();
  });

$(document).ready(function(){

	// $('html, body').animate({scrollTop: $(window.hashName).offset().top}, 2000);
	// console.log(window.location.hash);
	if (window.location.hash == '#down') {
		// $('#down').scrollTop = 9999;
		$('body').scrollTop(9999);
		// alert(window.location.hash );
		// $('body').scrollTop = 9999;
		// $(".lustran-main").scrollIntoView(true);
	}

	// ЖДУН-mode on
	//$(".close-all").fadeIn();
	// ЖДУН-mode off
	//$(".close-all").fadeOut();

	$('.close-layout').click(function () {
		$('.action').fadeOut();
	});

	getLoc(getCookie("location"));

	//Удалить заказ
	$('.new-order').on('click','[data-toggle=remove-row]',function(){
		$(this).parents('.new-order-form-row').remove();
	})

	//Добавить заказ
	// $('.new-order').on('click','[data-toggle=add-row]',function(){
	// 	var row = $(this).parents('.new-order-form-row').html();
	// 	$(this).removeClass('add');
	// 	$(this).addClass('remove');
	// 	$(this).attr('data-toggle','remove-row');
	// 	$(this).html('<i class="fa fa-times-circle" aria-hidden="true"></i>&nbspУдалить товар');
	// 	$(this).parents('.new-order-form-row').after('<div class="new-order-form-row good-item row">'+row+'</div>');
	// })

	$('.new-order').on('click','[data-toggle=add-row]',function(){
		var row = $('.new-order-form-row:first').html();
		$('.new-order-form-row.good-item:last').after('<div class="new-order-form-row good-item row">'+row+'<div data-toggle="remove-row" class="new-row remove"><i class="fa fa-times-circle" aria-hidden="true"></i>&nbsp;Удалить товар</div></div>');
	})

	// Валидация инпутов
	$('[data-input=time]').inputmask('hh:mm',{ "placeholder": "чч.мм" });
	$('[type=time]').inputmask('99:99');
	$('[data-input=phone]').inputmask('+7 (999) 999-99-99');
	$('[name=tel]').inputmask('+7 (999) 999-99-99');

	//Отмена стандартного действия ссылок
	// $('body').delegate('a[href*="#"]','click',function(e){
	// 	e.preventDefault();
	// });

	$("li.status-menu a.lustran-dropdown").click(function () {
		$(".status-menu-dropdown").toggleClass('show');
	});

	// $('.status-menu-dropdown .dropdown select').change(function () {
	// 	// e.preventDefault();
	// 	$(this).val()
	// 	if ($(this).val()) {
	// 		$(this).addClass('changed');
	// 	}else{
	// 		$(this).removeClass('changed');
	// 	}
	// });

	var thisAction = $(".action");

	$(".order-status-edit").click(function (e) {
		e.preventDefault();
		thisAction = $(this).next(".action");
		$(".action").fadeOut();
		$(".close-layout").fadeIn();
		thisAction.fadeIn();
		thisAction.scrollTop(9999);
		thisAction.find("input[name='yourpin']").val('');
		// thisAction.find("input[name='yourpin']").focus();
		thisAction.find('textarea[name="comment"]').focus();
		if (thisAction.hasClass('spicdate-action')) {
			thisAction.find('input[name="status"]').focus();
		}
	});

	var removeGoodId;
	$(".remove-order-status").click(function (e) {
		e.preventDefault();
		// alert($(this).closest('.order-list-item').attr('data-title'));
		// if (!$(this).closest('.order-list-item').hasClass('close-good')) {
			removeGoodId = $(this).attr('data-title');
			$(".remove-good").fadeIn();
			$(".remove-good input[name=goodid]").val(removeGoodId);
			$(".close-layout").fadeIn();
			$(".remove-order-status").fadeOut();
			$(".remove-good textarea[name='comment']").focus();
			$(".remove-good input[name='yourpin']").val('');
			$(".remove-good textarea[name='comment']").val('');
		// }
		// $(this).closest('li.order-list-item').addClass('close-good');
	});

	$(".remove-good").submit(function (e) {
		e.preventDefault();
		$(".close-all").fadeIn();
		if ($(".remove-good input[name='yourpin']").val() && $(".remove-good textarea[name='comment']").val()) {
			var data = {
				goodid: removeGoodId,
				yourpin: $(".remove-good input[name='yourpin']").val(),
				comment: $(".remove-good textarea[name='comment']").val()
			}
			if ($('.remove-order-status[data-title='+removeGoodId+']').closest('li.order-list-item').hasClass('close-good')) {
				$(".remove-good").fadeOut();
				$(".close-layout").fadeOut();
				$(".remove-order-status").fadeIn();
				data.reject = 0;
			}else{
				$(".remove-good").fadeOut();
				$(".close-layout").fadeOut();

				$(".remove-order-status").fadeIn();
				data.reject = 1;
			}
			console.log(data);
			$.ajax({
				url: "/orders/rejectgood",
				type: "POST",
				data: data,
				success: function (data, status, error) {
					// console.log(data, status, error);
					if (data.err) {
						alert(data.err);
					}else{
						console.log(data);
						if (data.good.reject == 1) {
							$('.remove-order-status[data-title='+removeGoodId+']').closest('li.order-list-item').addClass('close-good');
							if (data.activeorder == 0) {
								$('.remove-order-status[data-title='+removeGoodId+']').closest('.order').fadeOut();
                alert("Заказ перенесен в архив!")
							}
						}else{
							$('.remove-order-status[data-title='+removeGoodId+']').closest('li.order-list-item').removeClass('close-good');
						}
						console.log(data.good.refuse);
						if (data.refusestatus == 1) {
							$(".order-list-item[data-title="+data.good.id+"] .order-date").after("<span class='refuse'>ОТКАЗ</span>");
							$(".order-list-item[data-title="+data.good.id+"] .order-name").addClass('short');
						}else{
							$(".order-list-item[data-title="+data.good.id+"] .refuse").remove();
							$(".order-list-item[data-title="+data.good.id+"] .order-name").removeClass('short');
						}
					}
					$(".close-all").fadeOut();
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(data.err);
					$(".close-all").fadeOut();
				}
			});
		}else{
			alert("Заполните все поля!");
			$(".close-all").fadeOut();
		}
	});

	// $(".order-list-item").click(function () {
	// 	// e.preventDefault();
	// 	if ($('.order-list-item').hasClass('close-good')) {
	// 		// alert($(this).attr('data-title'));
	// 		$(".remove-good").fadeIn();
	// 		$(".close-layout").fadeIn();
	// 		removeGoodId = $(this).attr('data-title');
	// 		$(".remove-good input[name='yourpin']").focus();
	// 		$(".remove-good input[name='yourpin']").val('');
	// 	}
	// });

	$(".close-layout").click(function () {
		$(".remove-good").fadeOut();
		$(".close-layout").fadeOut();
		$(".remove-order-status").fadeIn();
	});

	thisAction.keyup(function (e) {
		if (e.keyCode == 13) {
			e.preventDefault();
			if (thisAction.hasClass('processed-action')) {
				// thisAction.find('textarea[name="comment"]').focus();
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
				// thisAction.find('textarea[name="comment"]').focus();
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
			$(".close-all").fadeIn();
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
						$(".ordersproc").text(data.pcount);
						// if (data.processed.statusval != 0) {
						// 	$(".processed[data-title="+goodid+"]").closest('.order-status').removeClass('status-danger');
						// 	// $(".ordersproc").text(data.pcount);
						// }else{
						// 	$(".processed[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
						// 	// $(".ordersproc").text(data.pcount);
						// }
						if (data.processed.statusval == 1) {
							$(".processed[data-title="+goodid+"]").closest('.order-status').removeClass('status-danger');
							$(".processed[data-title="+goodid+"]").closest('.order-list-item').removeClass('status-danger');
							// $(".ordersdef").text(data.pcount);
						}else if(data.processed.statusval == 0){
							$(".processed[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.callstatus.createdAt)));
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.callstatus.alias);

							$(".spicdate[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".spicdate[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.spicdate.createdAt)));
							$(".spicdate[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".spicdate[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text("--.--.--");

							$(".issued[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.issued.createdAt)));
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.issued.alias);

							$(".postponed[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".postponed[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.postponed.createdAt)));
							$(".postponed[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".postponed[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.postponed.alias);

							$(".ordered[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".ordered[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.ordered.createdAt)));
							$(".ordered[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".ordered[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.ordered.alias);
							// $(".postponed[data-title="+goodid+"]").closest('.order-list-item').removeClass('status-danger');
						}
					}
					$(".close-all").fadeOut();
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
					$('.close-layout').fadeOut();
					action.fadeOut();
					$(".close-all").fadeOut();
				}
			});
		}else{
			alert('Введите ПИН');
		};
	};

	function setSpicdate(action) {
		$(".close-all").fadeIn();
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
							$(".close-all").fadeOut();
							action.fadeOut();
						}else{
							$('.close-layout').fadeOut();
							// order-float-date
							console.log($(".spicdate[data-title="+goodid+"]").closest('.order-list-item').find(".order-float-date").text());
							var indDateTxt = $(".spicdate[data-title="+goodid+"]").closest('.order-list-item').find(".order-float-date").text();
							var indDateEl = $(".spicdate[data-title="+goodid+"]").closest('.order-list-item').find(".order-float-date");
							var indDateArr = indDateTxt.split('.');
							indDateStr = indDateArr[1]+-+indDateArr[0]+-+indDateArr[2];
							// console.log(new Date(indDateStr));
							indDate = new Date(indDateStr);
							spicDate = new Date(data.spicdate.statusval);
							indDateTime = indDate.getTime();
							spicDateTime = spicDate.getTime();
							action.fadeOut();
							if (indDateTime < spicDateTime) {
								indDateEl.addClass('red-text');
							}else{
								indDateEl.removeClass('red-text');
							}
							// console.log(data.spicdate.statusval);
							$(".spicdate[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.spicdate.createdAt)));
							$(".spicdate[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
							$(".spicdate[data-title="+goodid+"]").closest('.order-status').removeClass('status-danger');
							$(".spicdate[data-title="+goodid+"]").closest('.order-status').find('.status').text(getDateSuperReadeble(new Date(data.spicdate.statusval)));
							$(".processed[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text('Обработан');
						}
						$(".close-all").fadeOut();
					},
					error: function (data, status, error) {
						console.log(data, status, error);
						alert(error);
						$('.close-layout').fadeOut();
						action.fadeOut();
						$(".close-all").fadeOut();
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
			$(".close-all").fadeIn();
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
						if (data.ordered.statusval != 0) {
							$(".ordered[data-title="+goodid+"]").closest('.order-status').removeClass('status-danger');
							$(".ordered[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text('Заказан');
						}else{
							$(".ordered[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".ordered[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text('Не заказан');

							$(".postponed[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".postponed[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.postponed.alias);
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.callstatus.createdAt)));
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.callstatus.alias);
							$(".issued[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.issued.createdAt)));
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.issued.alias);
							$(".postponed[data-title="+goodid+"]").closest('.order-list-item').removeClass('status-danger');
						}
					}
					$(".close-all").fadeOut();
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
					$('.close-layout').fadeOut();
					action.fadeOut();
					$(".close-all").fadeOut();
				}
			});
		}else{
			alert('Введите ПИН');
		}
	}

	function setPostponed(action) {
		if (action.find('input[name=yourpin]').val() && action.find('textarea[name=comment]').val()){
			$(".close-all").fadeIn();
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
						$(".ordersdef").text(data.pcount);
						$(".postponed[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.postponed.createdAt)));
						$(".postponed[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
						$(".postponed[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.postponed.alias);
						if (data.postponed.statusval == 1) {
							$(".postponed[data-title="+goodid+"]").closest('.order-status').removeClass('status-danger');
							$(".postponed[data-title="+goodid+"]").closest('.order-list-item').removeClass('status-danger');
							// $(".ordersdef").text(data.pcount);
						}else if(data.postponed.statusval == 0){
							$(".postponed[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.callstatus.createdAt)));
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.callstatus.alias);
							$(".issued[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.issued.createdAt)));
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.issued.alias);
							$(".postponed[data-title="+goodid+"]").closest('.order-list-item').removeClass('status-danger');
						}else if(data.postponed.statusval == 2){
							$(".postponed[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".postponed[data-title="+goodid+"]").closest('.order-list-item').addClass('status-danger');
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.callstatus.createdAt)));
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.callstatus.alias);
							$(".issued[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.issued.createdAt)));
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.issued.alias);

							$(".processed[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".processed[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.processed.createdAt)));
							$(".processed[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".processed[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.processed.alias);

							$(".spicdate[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".spicdate[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.spicdate.createdAt)));
							$(".spicdate[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".spicdate[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text("--.--.--");

							$(".ordered[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".ordered[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.ordered.createdAt)));
							$(".ordered[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".ordered[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.ordered.alias);
							// $(".ordersdef").text(data.pcount);
						}
					}
					$(".close-all").fadeOut();
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
					$('.close-layout').fadeOut();
					action.fadeOut();
					$(".close-all").fadeOut();
				}
			});
		}else{
			alert('Заполните все поля!');
		}
	}

	function setCallstatus(action) {
		if (action.find('input[name=yourpin]').val()){
			$(".close-all").fadeIn();
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

							$(".issued[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.issued.createdAt)));
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.issued.alias);
						}else{
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".callstatus[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text('Не дозвон');

							$(".issued[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.issued.createdAt)));
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(' ');
							$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.issued.alias);
						}
					}
					$(".close-all").fadeOut();
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
					$('.close-layout').fadeOut();
					action.fadeOut();
					$(".close-all").fadeOut();
				}
			});
		}else{
			alert('Введите ПИН');
		}
	}

	function setIssued(action) {
		if (action.find('input[name=yourpin]').val()){
			$(".close-all").fadeIn();
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
						$(".close-all").fadeOut();
						action.fadeOut();
					}else{
						$(".close-all").fadeOut();
						$('.close-layout').fadeOut();
						action.fadeOut();
						console.log(data.issued);
						$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-date').text(getDateSuperReadeble(new Date(data.issued.createdAt)));
						$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-bottom span').text(data.user.name);
						$(".issued[data-title="+goodid+"]").closest('.order-status').find('.status-top .status').text(data.issued.alias);
						if (data.issued.statusval == 1) {
							$(".issued[data-title="+goodid+"]").closest('.order-status').removeClass('status-danger');
							$(".issued[data-title="+goodid+"]").closest('.order-list-item').addClass('end-good');
							$(".ordersissued").text(data.pcount);
							if (data.activeorder == 0) {
								$(".issued[data-title="+goodid+"]").closest('.order').fadeOut();
							}
						}else{
							$(".issued[data-title="+goodid+"]").closest('.order-status').addClass('status-danger');
							$(".issued[data-title="+goodid+"]").closest('.order-list-item').removeClass('end-good');
							$(".ordersissued").text(data.pcount);
						}
					}
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					alert(error);
					$('.close-layout').fadeOut();
					action.fadeOut();
					$(".close-all").fadeOut();
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
	});

	//Отмена Action
	$('body').on('click','[data-toggle=cancel-action]',function(){
		$('.layout-dark').hide();
		$('.close-layout').fadeOut();
		$('.action').fadeOut();
	});

	$(".checkbox.archive").click(function () {
		// e.preventDefault
		if ($(".archive input[name='archive']").prop("checked")) {
			$(".archive-period").fadeIn();
		}else{
			$(".archive-period").fadeOut();
		}
	});

	//Сохранить Action


	//Удалить заказ из списка
	$('body').on('click','[data-toggle=remove-order]',function(){
		$(this).parents('.order-list-item').toggleClass('status-removed')
	})

	//Открыть историю действий
	$('body').on('click','.gethistory',function(e){
		$(".close-all").fadeIn();
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

				setTimeout(function() {
							  $(".addcomment textarea[name='comment']").focus();
							}, 0);
				$(".close-all").fadeOut();
			},
			error: function (data, status, error) {
				console.log(data, status, error);
				$(".close-all").fadeOut();
			}
		});
	});

	$(".history .addcomment-submit").click(function (e) {
		e.preventDefault();
		if ($(".addcomment input[name='yourpin']").val() && $(".addcomment textarea[name='comment']").val()) {
			$(".close-all").fadeIn();
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

						setTimeout(function() {
							  $(".addcomment textarea[name='comment']").focus();
							}, 0);
					}
					$(".close-all").fadeOut();
				},
				error: function (data, status, error) {
					console.log(data, status, error);
					$(".close-all").fadeOut();
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
				$(".close-all").fadeIn();
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

							setTimeout(function() {
							  $(".addcomment textarea[name='comment']").focus();
							}, 0);
						}
						$(".close-all").fadeOut();
					},
					error: function (data, status, error) {
						console.log(data, status, error);
						$(".close-all").fadeOut();
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
