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
            $(".checking-in-list").append('<li class="checking-in-list-item lateness"><span class="checking-in-date">'+getTimeReadeble(datetime)+'</span><span class="checking-in-location sep-dot">'+$('a.location-name').text()+'</span><span class="checking-in-person">'+data.user.name+'</span></li>');
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
  })
});
