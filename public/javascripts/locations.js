$(document).ready(function () {

  $(".addloc").click(function (e) {
    e.preventDefault();
    $(".close-layout").fadeIn();
    $(".addlocform").fadeIn();
    $(".setlocpin input[name=fullname]").focus();
  });
  $('.close-layout').click(function () {
    $('.addlocform').fadeOut();
    $('.close-layout').fadeOut();
    $('.editlocpin').fadeOut();
    $('.history').fadeOut();
  });
  $('.addloc-submit').click(function (e) {
    e.preventDefault();
    var data = {
      name: $(".addlocform input[name='name']").val(),
      fullname: $(".addlocform input[name='fullname']").val(),
      opentime: $(".addlocform input[name='opentime']").val(),
      closetime: $(".addlocform input[name='closetime']").val(),
      password: $(".addlocform input[name='password']").val(),
      alias: $(".addlocform input[name='alias']").val(),
      adres: $(".addlocform input[name='adres']").val(),
      yourpin: $(".addlocform input[name='yourpin']").val(),
    }
    console.log(data);
    $.ajax({
      url: '/locations',
      type: 'POST',
      data: data,
      success: function (data, status, error) {
        console.log(data, status, error);
        if (data.err) {
          alert(data.err);
        }else{
          $('.locations-table tbody').append('<tr id="'+data.location.id+'"><td>'+data.location.fullname+'</td><td> c ' + data.location.opentime + ' по ' + data.location.closetime+'</td><td><div data-title="'+data.location.id+'" class="btn btn-success choose-location">Выбрать</div></td><td><div data-title="'+data.location.id+'" class="btn btn-default edit-location">Редактировать</div></td></tr>');
          $('.addlocform').fadeOut();
          $('.close-layout').fadeOut();
          $('.addlocform input').val('');
        }
      },
      error: function (data, status, error) {
        console.log(data, status, error);
      }
    });
    // $('.addlocform').fadeOut();
    // $('.close-layout').fadeOut();
  });

  $( ".locations-table" ).on( "click", "div.choose-location", function() {
    // alert($(this).attr('data-title'));
    $(".setlocpin").fadeIn();
    $(".close-layout").fadeIn();
    $(".setlocpin-submit").attr('data-title',$(this).attr('data-title'));
    $(".setlocpin input[name=yourpin]").focus();
  });

  $('.setlocpin-submit').click(function (e) {
    e.preventDefault();
    if ($(".setlocpin input[name=yourpin]").val()) {
      var data = {
        yourpin: $(".setlocpin input[name=yourpin]").val(),
        status: 'manager'
      }
      var locId = $(this).attr('data-title');
      console.log(locId);
      $.ajax({
        url: '/pinauth',
        type: 'POST',
        data: data,
        success: function (data, status, error) {
          if (data.err) {
            alert(data.err);
          }else{
            setCookie("location",locId,365);
            $(".locations-table tr").css('background-color', '#fff');
            $(".locations-table div.choose-location").text('Выбрать');
            $("div.choose-location").each(function () {
              if ($(this).attr('data-title') == getCookie("location")) {
                $(this).parent().parent().css('background-color', '#36C786');
                $(this).text("Выбрано");
              }
            });
            getLoc(getCookie("location"));
            $(".setlocpin").fadeOut();
            $(".setlocpin input[name=yourpin]").val("");
            $(".close-layout").fadeOut();
          }
        },
        error: {function (data, status, error) {
          console.log(data, status, error);
          $(".setlocpin").fadeOut();
          $(".setlocpin input[name=yourpin]").val("");
          $(".close-layout").fadeOut();
        }}
      });
    }else{
      alert('Заполните поля');
    }
  })

  $( ".locations-table" ).on( "click", "div.edit-location", function() {
    // alert($(this).attr('data-title'));
    $(".editlocpin").fadeIn();
    $(".close-layout").fadeIn();
    $(".editlocpin-submit").attr('data-title',$(this).attr('data-title'));
    // $(".editlocpin input[name='opentime']").val("10:10");
    data = {
      locid: $(this).attr('data-title')
    }
    $.ajax({
      url: '/locations/getlocinfo',
      type: 'POST',
      data: data,
      success: function (data, status, error) {
        console.log(data, status, error);
        $(".editlocpin").fadeIn();
        $(".editlocpin input[name='fullname']").val(data.location.fullname);
        $(".editlocpin input[name='alias']").val(data.location.alias);
        $(".editlocpin input[name='adres']").val(data.location.adres);
        $(".editlocpin input[name='opentime']").val(data.location.opentime);
        $(".editlocpin input[name='closetime']").val(data.location.closetime);
      },
      error: function (data, status, error) {
        console.log(data, status, error);
        $(".close-layout").fadeOut();
      }
    });
  });

  $(".editlocpin-submit").click(function (e) {
    e.preventDefault();
    if ($(".editlocpin input[name='fullname']").val() && $(".editlocpin input[name='alias']").val() && $(".editlocpin input[name='adres']").val() && $(".editlocpin input[name='opentime']").val() && $(".editlocpin input[name='closetime']").val() && $(".editlocpin input[name='yourpin']").val()) {
      // alert('ok');
      var data = {};
      data.fullname = $(".editlocpin input[name='fullname']").val();
      data.alias = $(".editlocpin input[name='alias']").val();
      data.adres = $(".editlocpin input[name='adres']").val();
      data.opentime = $(".editlocpin input[name='opentime']").val();
      data.closetime = $(".editlocpin input[name='closetime']").val();
      data.yourpin = $(".editlocpin input[name='yourpin']").val();
      data.locid = $(this).attr('data-title');
      console.log(data);
      $.ajax({
        url: '/locations/updatelocinfo',
        type: 'POST',
        data: data,
        success: function (data, status, error) {
          console.log(data, status, error);
          if (data.err) {
            alert(data.err);
          }else{
            // $('.locations-table tbody').append('<tr id="'+data.location.id+'"><td>'+data.location.fullname+'</td><td> c ' + data.location.opentime + ' по ' + data.location.closetime+'</td><td><div data-title="'+data.location.id+'" class="btn btn-success choose-location">Выбрать</div></td><td><div data-title="'+data.location.id+'" class="btn btn-default edit-location">Редактировать</div></td></tr>');
            $('tr#'+data.location.id).html('<td>'+data.location.fullname+'</td><td> c ' + data.location.opentime + ' по ' + data.location.closetime+'</td><td><div data-title="'+data.location.id+'" class="btn btn-success choose-location">Выбрать</div></td><td><div data-title="'+data.location.id+'" class="btn btn-default edit-location">Редактировать</div></td>');
            $(".editlocpin input[name='fullname']").val('');
            $(".editlocpin input[name='alias']").val('');
            $(".editlocpin input[name='adres']").val('');
            $(".editlocpin input[name='opentime']").val('');
            $(".editlocpin input[name='closetime']").val('');
            $(".editlocpin input[name='yourpin']").val('');
            $(".editlocpin").fadeOut();
            $(".close-layout").fadeOut();
          }
        },
        error: function (data, status, error) {
          console.log(data, status, error);
          alert('Что-то пошло не так, обратитесь к администратору');
          $(".editlocpin input[name='fullname']").val('');
          $(".editlocpin input[name='alias']").val('');
          $(".editlocpin input[name='adres']").val('');
          $(".editlocpin input[name='opentime']").val('');
          $(".editlocpin input[name='closetime']").val('');
          $(".editlocpin input[name='yourpin']").val('');
          $(".editlocpin").fadeOut();
          $(".close-layout").fadeOut();
        }
      });
    }else{
      alert('Заполните все поля!');
    }
    // alert($(this).attr('data-title'));
    // input(type='time',name='opentime',required).form-control
    // $(".editlocpin input[name='opentime']").value = "22:53:05";
  });

  $('.addloc-cancel').click(function (e) {
    e.preventDefault();
    $('.addlocform').fadeOut();
    $('.close-layout').fadeOut();
  });
});
