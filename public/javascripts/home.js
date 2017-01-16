$(document).ready(function () {
  $('.check-pin .btn-pin').click(function (e) {
    e.preventDefault();
    if ($('.check-pin input[name=yourpin]').val()) {
      // alert('nice');
      // var now = new Date();
      var data = {
        yourpin: $('.check-pin input[name=yourpin]').val(),
        locid: getCookie("location")
        // now: getDateReadeble(now)
      };
      // console.log(data.now);
      $.ajax({
        url: '/',
        type: 'POST',
        data: data,
        success: function (data, status, error) {
          console.log(data, status, error);
          if (data.err) {
            alert(data.err);
          }else{
            $('.checking-in-list p').remove();
            // var datetime = new Date(data.check.createdAt)
            // console.log(datetime.getFullYear());
            var io = (data.check.io) ? "Ушёл" : "Пришёл";
            if (data.check.late == 1) {
              $(".checking-in-list").append('<li class="checking-in-list-item lateness"><span class="checking-in-date">'+getTimeReadeble(new Date(data.check.createdAt))+'</span><span class="checking-in-location sep-dot">'+data.location.alias+'</span><span class="checking-in-person">'+data.user.name+'</span><span>'+io+'</span></li>');
            }else{
              $(".checking-in-list").append('<li class="checking-in-list-item"><span class="checking-in-date">'+getTimeReadeble(new Date(data.check.createdAt))+'</span><span class="checking-in-location sep-dot">'+data.location.alias+'</span><span class="checking-in-person">'+data.user.name+'</span><span>'+io+'</span></li>');
            }
            if (data.check.io) {
              $('.check-pin input[name=yourpin]').val('');
            }else{
              $('.pin-wrapper').fadeOut();
              $('.wellcome-wrapper').fadeIn();
              $('.wellcome-top .name').text(data.user.name);
            }
          }
          $('.check-pin input[name=yourpin]').val('');
          $('.check-pin input[name=yourpin]').focus();
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
    $('.check-pin input[name=yourpin]').val('');
    $('.check-pin input[name=yourpin]').focus();
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
          if (data.err) {
            alert(data.err)
          }else{
            $(".checking-in-list").empty();
            if (data.checks.length > 0) {
              for (var i = 0; i < data.checks.length; i++) {
                // checks[i]
                var io = (data.checks[i].io) ? "Ушёл" : "Пришёл";
                if (data.checks[i].late == 1) {
                  $(".checking-in-list").append('<li class="checking-in-list-item lateness"><span class="checking-in-date">'+getTimeReadeble(new Date(data.checks[i].createdAt))+'</span><span class="checking-in-location sep-dot">'+data.checks[i].location.alias+'</span><span class="checking-in-person">'+data.checks[i].user.name+'</span><span>'+io+'</span></li>');
                }else{
                  $(".checking-in-list").append('<li class="checking-in-list-item"><span class="checking-in-date">'+getTimeReadeble(new Date(data.checks[i].createdAt))+'</span><span class="checking-in-location sep-dot">'+data.checks[i].location.alias+'</span><span class="checking-in-person">'+data.checks[i].user.name+'</span><span>'+io+'</span></li>');
                }
              }
            }else{
              $(".checking-in-list").append('<p>Нет отметок, соответсвующих запросу</p>');
            }
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

  $(".export-checks").click(function (e) {
    e.preventDefault();
    var lis = $('.checking-in-list li');
    var spans = [];
    var checkOrderString = '';
    var late;
    var liClasses;
    var checkOrderArray = [];
    for (var i = 0; i < lis.length; i++) {
      checkOrderString = '';
      late = '';
      if (lis[i].classList.contains('lateness')) {
        late = 'Опоздал;';
      }else{
        late = ';';
      }
      spans = lis[i].children;
      for (var j = 0; j < spans.length; j++) {
        checkOrderString += spans[j].textContent + ';';
      }
      checkOrderArray.push(checkOrderString+late);
    }
    // console.log(checkOrderArray);
    data = {
      charr: checkOrderArray
    }
    $.ajax({
      url: '/exportchecks',
      type: 'POST',
      data: data,
      success: function (data, status, error) {
        console.log(data, status, error);
        window.open(
          '/download-'+data,
          '_blank' // <- This is what makes it open in a new window.
        );
        // $.fileDownload(data.path)
        // .done(function () { alert('File download a success!'); })
        // .fail(function () { alert('File download failed!'); });
      },
      error: function (data, status, error) {
        console.log(data, status, error);
      }
    });
  });
});
