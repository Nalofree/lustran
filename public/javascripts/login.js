$(document).ready(function () {
  $(".login-form input[type='submit']").click(function (e) {
    e.preventDefault()
    if ($(".login-form input[type='password']").val()) {
      $(".close-all").fadeIn();
      var pass = $(".login-form input[type='password']").val();
      // console.log($(this).val());
      $.ajax({
        url: '/login',
        type: 'POST',
        data: {pass: pass},
        success: function (data, status, error) {
          console.log(data, status, error);
          if (data.isauth) {
            window.location = '/';
          }else{
            alert('Неверный пароль!');
          }
          $(".close-all").fadeOut();
        },
        error: function (data, status, error) {
          console.log(data, status, error);
          $(".close-all").fadeOut();
        }
      });
    }else{
      alert('Введите пароль!');
    }
  });
});
