$(document).ready(function () {

  $(".addloc").click(function (e) {
    e.preventDefault();
    $(".close-layout").fadeIn();
    $(".addlocform").fadeIn();
  });
  $('.close-layout').click(function () {
    $('.addlocform').fadeOut();
    $('.close-layout').fadeOut();
  });
  $('.addloc-submit').click(function (e) {
    e.preventDefault();
    var data = {
      name: $(".addlocform input[name='name']").val(),
      yourpin: $(".addlocform input[name='yourpin']").val()
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
          $('.locations-table tbody').append('<tr id="'+data.locations.id+'"><td>'+data.locations.name+'</td><td><div data-title="'+data.locations.id+'" class="btn btn-success choose-location">Выбрать</div></td><td><div data-title="'+data.locations.id+'" class="btn btn-danger delete-location">Удалить</div></td></tr>');
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

  $( ".locations-table" ).on( "click", "div.delete-location", function() {
    // alert($(this).attr('data-title'));
    $(".dellocpin").fadeIn();
    $(".close-layout").fadeIn();
    $(".dellocpin-submit").attr('data-title',$(this).attr('data-title'));
  });

  $(".dellocpin-submit").click(function (e) {
    e.preventDefault();
    var locId = $(".dellocpin-submit").attr('data-title');
    if (locId == getCookie("location")) {
      alert('Перед удалением выберите другое место как автивное');
      $(".dellocpin").fadeOut();
      $(".dellocpin input[name=yourpin]").val('')
      $(".close-layout").fadeOut();
    }else{
      var thisloc = $('.locations-table .delete-location[data-title='+locId+']').parent().parent();
      if ($(".dellocpin input[name=yourpin]").val()) {
        var data = {
          id: locId,
          yourpin: $(".dellocpin input[name=yourpin]").val()
        };
        $.ajax({
          url: '/locations/delloc',
          type: 'POST',
          data: data,
          success: function (data, status, error) {
            if (data.err) {
              alert(data.err);
            }else{
              // console.log(data, status, error);
              $(".dellocpin").fadeOut();
              $(".dellocpin input[name=yourpin]").val('')
              $(".close-layout").fadeOut();
              thisloc.fadeOut();
            }
          },
          error: function (data, status, error) {
            console.log(data, status, error);
            $(".dellocpin").fadeOut();
            $(".dellocpin input[name=yourpin]").val('')
            $(".close-layout").fadeOut();
            // thisloc.fadeOut();
          }
        });
      }else{
        alert('Заполните поля');
      }
    }
  });

  $('.addloc-cancel').click(function (e) {
    e.preventDefault();
    $('.addlocform').fadeOut();
    $('.close-layout').fadeOut();
  });
});
