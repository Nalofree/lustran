$(document).ready(function () {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
   if(dd<10){
          dd='0'+dd
      }
      if(mm<10){
          mm='0'+mm
      }
  today = yyyy+'-'+mm+'-'+dd;
  $(".new-order-form input[type=date]").attr("min", today);
  var goods = [];
  var order = {};
  $('.setorder-button').click(function(e) {
    e.preventDefault();
    var nowdate = new Date();
    var nowtime = nowdate.getTime();
    correctDate = true;
    $('.new-order-form-row.good-item').each(function () {
      indicativedate = new Date($(this).find('input[name=indicativedate]').val());
      indicativetime = indicativedate.getTime();
      if ((indicativetime < nowtime) || (!/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/g.test($(this).find('input[name=indicativedate]').val()))) {
        correctDate = false;
      }
    });
    var namexist = true;
    $('input[name=name]').each(function () {
      if (!$(this).val()) {
        namexist = false;
      }
    });
    if ($('input[name=customername]').val() && $('input[name=customerphone]').val() && namexist) { //КАК ЖЕ МЕНЯ ЭТО БЕСИТ НАХУЙ
      if (correctDate) {
        $('.new-order-form-row.good-item').each(function() {
          var good = {};
          good.vencode = $(this).find('input[name=vencode]').val();
          good.name = $(this).find('input[name=name]').val();
          good.num = $(this).find('input[name=number]').val();
          good.inddate = $(this).find('input[name=indicativedate]').val();
          good.prepay = $(this).find('input[name=prepayment]').val() ? $(this).find('input[name=prepayment]').val() : 0;
          goods.push(good);
        });
        order.customername = $('input[name=customername]').val();
        order.customerphone = $('input[name=customerphone]').val();
        order.comment = $('textarea[name=comment]').val();
        order.locationid = getCookie('location');
        order.number = $('.new-order-iter').text();
        $('.close-layout').fadeIn();
        $('.addorder').fadeIn();
        $(".addorder input[name=yourpin]").val('');
        $(".addorder input[name=yourpin]").focus();
      }else{
        alert('Некорректная дата!');
      }
    }else{
      alert('Заполните поля наименование товара, имени заказчика и номера телефона заказчика!')
    }
  });

  $(".addorder-submit").click(function (e) {
    e.preventDefault();
    if ($(".addorder input[name=yourpin]").val()) {
      var yourpin = $(".addorder input[name=yourpin]").val();
      // console.log(goods);
      // console.log(order);
      // console.log(yourpin);
      var data = {
        yourpin: yourpin,
        goods: goods,
        order: order,
      }
      $('.addorder').fadeOut();
      $(".addorder input[name=yourpin]").val('');
      $.ajax({
        url: '/addorder',
        type: 'POST',
        data: data,
        success: function (data, status, error) {
          console.log(data, status, error);

          $('.close-layout').fadeOut();
          // $(".new-order-form").reset();
          if (data.err) {
            alert(data.err);
          }else{
            document.getElementById("neworderform").reset();
            $(".new-order-id").text(parseInt($(".new-order-id").text())+1);
            $(".new-order-iter").text(parseInt($(".new-order-iter").text())+1);
            window.location = '/orders';
            window.open(
              '/addorder/order-'+data.order.id,
              '_blank' // <- This is what makes it open in a new window.
            );
            goods = [];
            order = {};
          }
        },
        error: function (data, status, error) {
          console.log(data, status, error);
          $('.close-layout').fadeOut();
        }
      });
    }else{
      alert("Введите ПИН");
    }
  });

  $(".addorder input[name=yourpin]").keyup(function (e) {
    if (e.which == 13) {
      e.preventDefault();
      if ($(".addorder input[name=yourpin]").val()) {
        var yourpin = $(".addorder input[name=yourpin]").val();
        // console.log(goods);
        // console.log(order);
        // console.log(yourpin);
        var data = {
          yourpin: yourpin,
          goods: goods,
          order: order,
        }
        $('.addorder').fadeOut();
        $(".addorder input[name=yourpin]").val('');
        $.ajax({
          url: '/addorder',
          type: 'POST',
          data: data,
          success: function (data, status, error) {
            console.log(data, status, error);

            $('.close-layout').fadeOut();
            // $(".new-order-form").reset();
            if (data.err) {
              alert(data.err);
            }else{
              document.getElementById("neworderform").reset();
              $(".new-order-id").text(parseInt($(".new-order-id").text())+1);
              $(".new-order-iter").text(parseInt($(".new-order-iter").text())+1);
              window.location = '/orders';
              window.open(
                '/addorder/order-'+data.order.id,
                '_blank' // <- This is what makes it open in a new window.
              );
              goods = [];
              order = {};
            }
          },
          error: function (data, status, error) {
            console.log(data, status, error);
            // $('.close-layout').fadeOut();
            $('.addorder').fadeOut(100,function () {
              $(".new-order input[name='name']:first").focus();
            });
          }
        });
      }else{
        alert("Введите ПИН");
      }
    }else if (e.keyCode == 27) {
      $('from.addorder').fadeOut(100,function () {
        $(".new-order input[name='name']:first").focus();
        $('.close-layout').fadeOut();
      });
    }
  });

  $(".new-order").keyup(function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      var nowdate = new Date();
      var nowtime = nowdate.getTime();
      correctDate = true;
      $('.new-order-form-row.good-item').each(function () {
        indicativedate = new Date($(this).find('input[name=indicativedate]').val());
        indicativetime = indicativedate.getTime();
        if ((indicativetime < nowtime) || (!/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/g.test($(this).find('input[name=indicativedate]').val()))) {
          correctDate = false;
        }
      });
      var namexist = true;
      $('input[name=name]').each(function () {
        if (!$(this).val()) {
          namexist = false;
        }
      });
      if ($('input[name=customername]').val() && $('input[name=customerphone]').val() && namexist) { //КАК ЖЕ МЕНЯ ЭТО БЕСИТ НАХУЙ
        if (correctDate) {
          $('.new-order-form-row.good-item').each(function() {
            var good = {};
            good.vencode = $(this).find('input[name=vencode]').val();
            good.name = $(this).find('input[name=name]').val();
            good.num = $(this).find('input[name=number]').val();
            good.inddate = $(this).find('input[name=indicativedate]').val();
            good.prepay = $(this).find('input[name=prepayment]').val() ? $(this).find('input[name=prepayment]').val() : 0;
            goods.push(good);
          });
          order.customername = $('input[name=customername]').val();
          order.customerphone = $('input[name=customerphone]').val();
          order.comment = $('textarea[name=comment]').val();
          order.locationid = getCookie('location');
          order.number = $('.new-order-iter').text();
          $('.close-layout').fadeIn();
          $('.addorder').fadeIn(100,function () {
            $(".addorder input[name=yourpin]").focus();
          });
          $(".addorder input[name=yourpin]").val('');
        }else{
          alert('Некорректная дата!');
        }
      }else{
        alert('Заполните поля наименование товара, имени заказчика и номера телефона заказчика!')
      }
    }
  });
});
