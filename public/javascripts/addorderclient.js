$(document).ready(function () {
  $('.setorder-button').click(function(e) {
    e.preventDefault();
    $('from.addorder').fadeIn();
    $('.close-layout').fadeIn();
  });

  $('.addorder-submit').click(function(e) {
    e.preventDefault();
    if ($('.addorder input[name=yourpin]').val()) {
      var order = {};
      var goods = [];
      $('.new-order-form-row.good-item').each(function() {
        var good = {};
        good.article = $(this).find('input[name=article]').val();
        good.name = $(this).find('input[name=name]').val();
        good.number = $(this).find('input[name=number]').val();
        good.indicativedate = $(this).find('input[name=indicativedate]').val();
        good.prepayment = $(this).find('input[name=prepayment]').val();
        goods.push(good);
      });
      order.goods = goods;
      order.customername = $('input[name=customername]').val();
      order.customerphone = $('input[name=customerphone]').val();
      order.comment = $('textarea[name=comment]').val();
      order.locationid = getCookie('location');
      order.number = $('.new-order-iter').text();
      order.yourpin = $('input[name=yourpin]').val();
      console.log(order);
      $.ajax({
        url: '/addorder',
        type: 'POST',
        data: order,
        success: function(data, status, error) {
          // console.log(data, status, error);
          if (data.err) {
            alert(data.err);
          }else{
            // console.log(data);
            $('from.addorder').fadeOut();
            $('.close-layout').fadeOut();
            $('input[name=yourpin]').val('');
            document.location.href="/addorder/printorder"+data.orderid;
          }
        },
        error: function(data, status, error) {
          console.log(data, status, error);
        }
      });
    }else{
      alert('Заполните ПИН');
    }
  });
});
