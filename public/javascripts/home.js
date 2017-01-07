$(document).ready(function () {
  $('.check-pin .btn-pin').click(function (e) {
    e.preventDefault();
    if ($('.check-pin input[name=yourpin]').val()) {
      // alert('nice');
      var data = {
        yourpin: $('.check-pin input[name=yourpin]').val(),
        locid: getCookie("location")
      }
      $.ajax({
        url: '/',
        type: 'POST',
        data: data,
        success: function (data, status, error) {
          // console.log(data, status, error);
          if (data.err) {
            alert(data.err);
          }else{
            var datetime = new Date(data.check.createdAt)
            console.log(datetime.getFullYear());
            if (data.check.late == 1) {
              $(".checking-in-list").append('<li class="checking-in-list-item lateness"><span class="checking-in-date">'+getTimeReadeble(datetime)+'</span><span class="checking-in-location sep-dot">'+$('a.location-name').text()+'</span><span class="checking-in-person">'+data.user.name+'</span></li>');
            }else{
              $(".checking-in-list").append('<li class="checking-in-list-item"><span class="checking-in-date">'+getTimeReadeble(datetime)+'</span><span class="checking-in-location sep-dot">'+$('a.location-name').text()+'</span><span class="checking-in-person">'+data.user.name+'</span></li>');
            }
            $('.pin-wrapper').fadeOut();
            $('.wellcome-wrapper').fadeIn();
            $('.wellcome-top .name').text(data.user.name);
            $('.check-pin input[name=yourpin]').val('');
          }
        },
        error: function (data, status, error) {
          console.log(data, status, error);
          alert('Что-то пошло не так, обратитесь к администратору');
        }
      });
    }else{
      alert('Введите ПИН');
    }
  });

  $('.wellcome-ok').click(function (e) {
    e.preventDefault();
    $('.pin-wrapper').fadeIn();
    $('.wellcome-wrapper').fadeOut();
  });

  $('.showcheckorder').click(function (e) {
    e.preventDefault();
    if ($('.checking-in-footer input[name=startdate]').val() && $('.checking-in-footer input[name=enddate]').val()) {
      var startDate = $('.checking-in-footer input[name=startdate]').val() + " 06:00";
      var endDate = $('.checking-in-footer input[name=enddate]').val() + " 23:00";
      var latesonly = 0;
      if ($('input[name=latesonly]').prop('checked')) {
        latesonly = 1;
      }else{
        latesonly = 0;
      }
      // console.log(startDate + " " + endDate + " " + latesonly);
      var data = {
        startdate: startDate,
        enddate: endDate,
        latesonly: latesonly
      }
      $.ajax({
        url: '/getcheckorder',
        type: 'POST',
        data: data,
        success: function (data, status, error) {
          console.log(data, status, error);
          $(".checking-in-list").empty();
          if (data.checks.length > 0) {
            for (var i = 0; i < data.checks.length; i++) {
              // checks[i]
              var datetime = new Date(data.checks[i].createdAt)
              if (data.checks[i].late == 1) {
                $(".checking-in-list").append('<li class="checking-in-list-item lateness"><span class="checking-in-date">'+getTimeReadeble(datetime)+'</span><span class="checking-in-location sep-dot">'+$('a.location-name').text()+'</span><span class="checking-in-person">'+data.checks[i].user.name+'</span></li>');
              }else{
                $(".checking-in-list").append('<li class="checking-in-list-item"><span class="checking-in-date">'+getTimeReadeble(datetime)+'</span><span class="checking-in-location sep-dot">'+$('a.location-name').text()+'</span><span class="checking-in-person">'+data.checks[i].user.name+'</span></li>');
              }
            }
          }else{
            $(".checking-in-list").append('<p>Нет отметок, соответсвующих запросу</p>');
          }
        },
        error: function (data, status, error) {
          console.log(data, status, error);
        },
      });
      console.log(data);
    }else{
      alert('Выберете даты');
    }
  });
});
