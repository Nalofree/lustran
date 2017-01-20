$(document).ready(function () {
  $(".login-form input[type='submit']").click(function (e) {
    e.preventDefault()
    if ($(".login-form input[type='password']").val()) {
      var pass = $(".login-form input[type='password']").val();
      // console.log($(this).val());
      $.ajax({
        url: '/login',
        type: 'POST',
        data: {pass: pass},
        success: function (data, status, error) {
          console.log(data, status, error);
          if (data.isauth) {
            window.open('/');
          }else{
            alert('Неверный пароль!');
          }
        },
        error: function (data, status, error) {
          console.log(data, status, error);
        }
      });
    }else{
      alert('Введите пароль!');
    }
  });
});
