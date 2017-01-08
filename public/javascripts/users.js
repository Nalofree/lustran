$(document).ready(function () {
  function statusToAlias(status) {
    switch (status) {
      case "manager":
        return "Руководитель";
        break;
      case "saler":
        return "Продавец";
        break;
      case "supplier":
        return "Снабженец";
        break;
    }
  };
  function aliasToStatus(alias) {
    switch (status) {
      case "Руководитель":
        return "manager";
        break;
      case "Продавец":
        return "saler";
        break;
      case "Снабженец":
        return "supplier";
        break;
    }
  };

  $('.users-table tr').each(function () {
    // console.log();
    console.log($(this).find('td').eq(1).text());
    var alias = statusToAlias($(this).find('td').eq(1).text());
    $(this).find('td').eq(1).text(alias);
  });//.eq(1).text()
  $(".adduser").click(function (e) {
    e.preventDefault();
    $(".close-layout").fadeIn();
    $(".adduserform").fadeIn();
  });
  $(".close-layout").click(function () {
    $(".adduserform").fadeOut();
    $(".close-layout").fadeOut();
    $(".edituserform").fadeOut();
    $('.setlocpin').fadeOut();
    $(".dellocpin").fadeOut();
    $('from.addorder').fadeOut();
  });
  $(".adduser-cancel").click(function (e) {
    e.preventDefault();
    $(".adduserform").fadeOut();
    $(".close-layout").fadeOut();
  });

  $(".adduser-submit").click(function (e) {
    e.preventDefault();
    if($('.adduserform input[name="fio"]').val() && $('.adduserform select[name="status"]').val() && $('.adduserform input[name="yourpin"]').val()){
      var data = {
        fio: $('.adduserform input[name="fio"]').val(),
        status: $('.adduserform select[name="status"]').val(),
        yourpin: $('.adduserform input[name="yourpin"]').val(),
      }
      console.log(data);
      $.ajax({
        url: '/users',
        type: 'POST',
        data: data,
        success: function (data, error, status) {
          console.log(data, error, status);
          if (data.err) {
            alert(data.err);
          }else{
            alert("ФИО: "+data.user.name+" пин: "+data.user.pin+" должность: "+data.user.status);
            $('.users-table tbody').append('<tr id="'+data.user.id+'"><td>'+data.user.name+'</td><td>'+statusToAlias(data.user.status)+'</td><td><div data-title="'+data.user.id+'" class="btn btn-danger ban-user">Запретить</div></td><td><div data-title="'+data.user.id+'" class="btn btn-default edit-user">Изменить</div></td></tr>');
            $(".adduserform").fadeOut();
            $(".close-layout").fadeOut();
            $('.adduserform input').val('');
          }
        },
        error: function (data, error, status) {
          console.log(data, error, status);
          $(".adduserform").fadeOut();
          $(".close-layout").fadeOut();
        }
      });
    }else{
        alert('Заполните поля');
    }
  });

  $('.ban-user').click(function () {
    $(".close-layout").fadeIn();
    $('.banuserpin').fadeIn();
    // var status = "manager";
    $('.banuserpin .banuserpin-submit').attr('data-title',$(this).attr('data-title'));
  });

  $('.banuserpin-submit').click(function (e) {
    e.preventDefault();
    if ($('.banuserpin input[name="yourpin"]').val()) {
      // var pin = $('.requirepin input[name="yourpin"]').val();
      // pinAuth(status,pin);
      var button = $('.ban-user[data-title='+$(this).attr('data-title')+']');
      var data = {
        userid: button.attr('data-title')
      };
      data.yourpin = $('.banuserpin input[name="yourpin"]').val();
      if(button.hasClass('useractive')) {
        url = '/users/banuser';
      }else{
        url = '/users/unbanuser';
      }
      $.ajax({
        url: url,
        type: 'POST',
        data: data,
        success: function (data, error, status) {
          if (data.err) {
            alert(data.err);
          }else{
            if(button.hasClass('useractive')) {
              button.removeClass('useractive');
              button.addClass('usernotactive');
              button.text('Разрешить');
              button.removeClass('btn-danger');
              button.addClass('btn-success');
              $(".close-layout").fadeOut();
              $('.banuserpin').fadeOut();
              $('.banuserpin input').val('');
            }else{
              button.removeClass('usernotactive');
              button.addClass('useractive');
              button.text('Запретить');
              button.addClass('btn-danger');
              button.removeClass('btn-success');
              $(".close-layout").fadeOut();
              $('.banuserpin').fadeOut();
              $('.banuserpin input').val('');
            }
          }
        },
        error: function (data, error, status) {
          alert('Что-то пошло не так, обратитесь к админитратору системы '+data.err);
          $(".close-layout").fadeOut();
          $('.banuserpin').fadeOut();
        }
      });
    }else{
      alert('Заполните поля');
    }
  });

  $('.edit-user').click(function () {
    var line = $(this).parent().parent();
    var username = line.find('td').eq(0).text();
    $('.edituserform input[name="fio"]').val(username);
    var userid = $(this).attr('data-title');
    $('.edituser-submit').attr('data-title', userid);
    $(".close-layout").fadeIn();
    $('.edituserform').fadeIn();
  });

  $(".edituser-cancel").click(function (e) {
    e.preventDefault();
    $(".edituserform").fadeOut();
    $(".close-layout").fadeOut();
  });

  $('.edituser-submit').click(function (e) {
    e.preventDefault();
    if($('.edituserform input[name="fio"]').val() && $('.edituserform select[name="status"]').val() && $('.edituserform input[name="yourpin"]').val()){
      var data = {
        fio: $('.edituserform input[name="fio"]').val(),
        status: $('.edituserform select[name="status"]').val(),
        yourpin: $('.edituserform input[name="yourpin"]').val(),
        userid: $(this).attr('data-title')
      };
      $.ajax({
        url: '/users/updateuser',
        type: 'POST',
        data: data,
        success: function (res, error, status) {
          console.log(res, error, status);
          $(".edituserform").fadeOut();
          $(".close-layout").fadeOut();
          if (res.err) {
            alert( res.err);
          }else{
            $('tr#'+data.userid+' td').eq(0).text(data.fio);
            $('tr#'+data.userid+' td').eq(1).text(statusToAlias(data.status));
            $('.edituserform input').val('');
          }
        },
        error: function (res, error, status) {
          console.log(res, error, status);
          $(".edituserform").fadeOut();
          $(".close-layout").fadeOut();
          alert('Что-то пошло не так, обратитесь к админитратору системы');
        },
      });
    }else{
      alert('Заполните поля');
    }
  });

  $('label[for="onlyactive"]').click(function () {
    if ($(this).children('#onlyactive').prop( "checked" )) {
      $('.ban-user').each(function () {
        if ($(this).hasClass('usernotactive')) {
          $(this).parent().parent().hide();
        }
      });
    }else{
      $('.users-table tr').show();
    }
  });
});
