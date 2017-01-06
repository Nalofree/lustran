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
          console.log(data, status, error);
        },
        error: function (data, status, error) {
          console.log(data, status, error);
        }
      });
    }else{
      alert('Введите ПИН');
    }
  });
});
