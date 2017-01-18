$(document).ready(function () {
  var number = $("#barcode").attr('data-title');
  console.log(number);
  while(number.length<8){
    number='0'+number;
  }
  $("#barcode").barcode(number, "code128", {barWidth:2, barHeight:50});
});
