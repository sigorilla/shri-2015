$(document).ready(function () {

$('.modal').addClass('hidden').prepend('<div class="modal-background"></div>');
$('.modal-wrapper').prepend('<span class="modal-close"><i class="fa fa-close"></i></span>');

$('.modal-background, .modal-close').on('click', function () {
  $(this).parents('.modal').addClass('hidden');
});

$('.item-flight').on('click', function () {
  if ($('.modal').hasClass('hidden')) {
    $('.modal').removeClass('hidden');
    $('.modal-content').html( $(this).find('.item-flight-more').clone() );
  }
});

});
