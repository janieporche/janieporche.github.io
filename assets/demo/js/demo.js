;(function() {
  var $doc = $(document);


  var initSmoothScroll = function() {
    gumshoe.init({
      offset: 180, // Distance in pixels to offset calculations
    });
    var scroll = new SmoothScroll('a[data-scroll]');
  };


  // Open demo nav when button is clicked (demo pages only)
  var initDemoNav = function() {
    var $demoNav = $('.demo-site-nav');
    var $demoNavBtn = $('.demo-site-nav-btn');

    $doc.on('click', '.demo-site-nav-btn', function(e) {
      e.preventDefault();
        $demoNav.toggleClass('is-open');
        $demoNavBtn.attr('aria-expanded', ($demoNavBtn.attr('aria-expanded') == 'false' ? true : false) );
    });

    // close nav when clicking elsewhere
    $(window).on('click touchstart', function(e) {
      if ( !$demoNavBtn.is(e.target) && $demoNavBtn.has(e.target).length === 0 && !$demoNav.is(e.target) && $demoNav.has(e.target).length === 0 ) {
        $demoNav.removeClass('is-open');
        $demoNavBtn.attr('aria-expanded', false);
      }
    });
  };


  // On DOM ready
  initSmoothScroll();
  initDemoNav();

})();