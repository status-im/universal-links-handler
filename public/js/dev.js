$(document).ready(function($) {

  var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
    $msnry;

  mobileMenu(w);
  mobileFooterMenu(w);

  $(window).on('resize', function(event) {
    w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    mobileMenu(w);
    mobileFooterMenu(w);

    if($('.js-using-snt').length){
      if(w > 767){
        if($msnry == null){
          $msnry = $('.js-items').masonry({
            itemSelector: '.js-item'
          });
          $msnry.masonry('layout');
        }
      }else{
        if($msnry != null){
          $msnry.masonry('destroy');
          $msnry = null;
        }
      }
    }

  });

  function mobileMenu(w) {
    if (w < 1199) {
      $('.js-header .js-nav, .js-header .js-btns').appendTo('.js-mobile-nav-inner');
    } else {
      $('.js-mobile-nav .js-nav, .js-mobile-nav .js-btns').insertBefore('.js-mobile-nav-trigger');
      $('.js-has-submenu').on('mouseover', function (event) {
        event.preventDefault();
        $(this).find('.js-submenu').removeClass('invisible opacity-0 pointer-events-none');
      });
      $('.js-has-submenu').on('mouseleave', function (event) {
        event.preventDefault();
        $(this).find('.js-submenu').addClass('invisible opacity-0 pointer-events-none');
      });
    }
  }2

  function mobileFooterMenu(w) {
    if (w < 768) {
      $('.js-footer .js-collapse').attr('aria-expanded', 'false').addClass('js-collapsed');
      $('.js-footer .js-collapse').addClass('hidden collapsed');
      $('.js-footer .js-collapse-trigger').addClass('collapsed');
    } else { $('.js-footer .js-collapse').attr('aria-expanded', 'true').removeClass('js-collapsed');
      $('.js-footer .js-collapse').removeClass('hidden collapsed');
    }
  }

  $('.js-mobile-nav-trigger').on('click', function(event) {
    event.preventDefault();
    $('.js-mobile-nav').removeClass('invisible opacity-0 pointer-events-none scale-95 mt-8');
    $('.js-backdrop').removeClass('invisible opacity-0 pointer-events-none');
  });

  $('.js-backdrop, .js-mobile-nav-trigger-close').on('click', function (event) {
    event.preventDefault();

    $('.js-mobile-nav').addClass('invisible opacity-0 pointer-events-none scale-95 mt-8');
    $('.js-backdrop').addClass('invisible opacity-0 pointer-events-none');
  });
});
