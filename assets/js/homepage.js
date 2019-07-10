// -------------------------------------------------------
// CONTAINS FUNCTIONS APPLIED TO THE HOMEPAGE ONLY
// -------------------------------------------------------

;(function($) {

  // Function to randomize array element order in-place using Durstenfeld shuffle algorithm.
  // Used for department slider colors
  var shuffleArray = function(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  };



  // Moments Slider on Homepage
  // Thanks to Dudley Storey: https://codepen.io/dudleystorey/pen/JDphy
  var initMoments = function() {

    var $moments = $('.moments-slider');

    $moments.each(function(){
      var $thisSlider = $(this);
      var $leftSide = $thisSlider.find('.moments-slider-picture-left');
      var $rightSide = $thisSlider.find('.moments-slider-picture-right');
      var $captions = $thisSlider.find('.moments-slider-caption');
      var rect = $thisSlider[0].getBoundingClientRect();

      // Move divider line by tracking mouse location
      $leftSide[0].addEventListener('mousemove',trackLocation,false);
      $leftSide[0].addEventListener('touchstart',trackLocation,false);
      $leftSide[0].addEventListener('touchmove',trackLocation,false);

      $rightSide[0].addEventListener('mousemove',trackLocation,false);
      $rightSide[0].addEventListener('touchstart',trackLocation,false);
      $rightSide[0].addEventListener('touchmove',trackLocation,false);

      function trackLocation(e){
        var eLeft = e.pageX ? e.pageX : (e.touches ? e.touches[0].pageX : e.pageX); // required for touch events on
        var position = ((eLeft - rect.left) / rect.width)*100;
        if (position <= 100) {
          $leftSide[0].style.width = position+'%';
        }
      }

      // Measure rectangle again after window resize
      var remeasure = debounce(function(){
        rect = $thisSlider[0].getBoundingClientRect();
      }, 200, false); // wait until the users stops resizing the window for [x]ms before remeasuring
                      // since mouse tracking will only occur once user stops resizing window
      $win.on('resize',function(){
        remeasure();
      });
    });
  };



  // Function to slide department stories on the homepage
  var initDepartmentSlider = function() {

    var $slider = $('.dpt-slider'),
        $sliderHandle = $slider.find('.dpt-slider-handle'),
        $sliderItems = $slider.find('.dpt-slider-item'),
        $colorBar = $('.dpt-colors-list'); // exclude this element to display slider without color bar

    if ( $slider.length && $sliderHandle.length && $sliderItems.length ) {


      // Sort slider items alphabetically by attribute "data-title"
      function sortByTitle(a, b){
        return ($(b).data('title')) < ($(a).data('title')) ? 1 : -1;
      }
      $sliderItems = $sliderItems.sort(sortByTitle); // $sliderItems now refers to the sorted object
      $sliderHandle.empty().append($sliderItems);


      // Find the number of items in the slider and set the width of each item
      var numSliderItems = $sliderItems.length;
      var itemWidth = 100/numSliderItems; // needed later on
      $sliderItems.outerWidth(itemWidth+'%');


      // Function to set the slider size
      var setSliderSize = function() {

        // Largest desktop sizing
        var itemsPerScreen = 2.7;

        if (window.matchMedia('(max-width: 459px)').matches){

          // Small mobile sizing
          itemsPerScreen = 1.2;

        } else if (window.matchMedia('(min-width: 460px)').matches && window.matchMedia('(max-width: 559px)').matches) {

          // Large mobile sizing
          itemsPerScreen = 1.2;

        } else if (window.matchMedia('(min-width: 560px)').matches && window.matchMedia('(max-width: 767px)').matches) {

          // Portrait Tablet sizing
          itemsPerScreen = 1.5;

        } else if (window.matchMedia('(min-width: 768px)').matches && window.matchMedia('(max-width: 991px)').matches) {

          // Landscape Tablet sizing
          itemsPerScreen = 1.8;

        }  else if (window.matchMedia('(min-width: 992px)').matches && window.matchMedia('(max-width: 1200px)').matches) {

          // Small Desktop sizing
          itemsPerScreen = 2.2;
        }

        // Set the slider width
        var div = Math.floor(numSliderItems/itemsPerScreen);
        var rem = numSliderItems % itemsPerScreen;
        $sliderHandle.width((div*100) + (rem/itemsPerScreen*100) + '%');

        // Set the slider height
        var maxItemHeight = Math.max.apply(null, $sliderItems.map(function() {
            return $(this).height();
        }).get());
        $slider.height(maxItemHeight);
      };

      setSliderSize(); // set size immediately, before calling Dragdealer


      // Assign unique, random color to each each slider item. There are 54 colors total.
      var numColors = 54;
      var colorArr = Array.apply(null, {length: numColors}).map(function(element, index) {
        return index + 1;
      });
      shuffleArray(colorArr);
      var colors = colorArr.slice(0, $sliderItems.length);

      var previousLetter = ''; // holds first letter of each item title
      $sliderItems.each(function(i){
        var $this = $(this);
        var n = (i + 1);

        // Assign unique id and random color to each slider item
        $this.addClass('color-'+colors[i]).attr('id', 'dpt-'+n);

        // Populate color bar above slider with colors and letters
        if ( $colorBar ) {
          var thisLetter = ($this.data('title').match(/[a-zA-Z]/) || []).pop();

          var $colorBlock = $('<li class="color-'+colors[i]+'"><a class="dpt-colors-color" href="#dpt-'+n+'"><span class="sr-only">View '+$this.data('title')+'</span></a></li>');

          if ( thisLetter !== previousLetter ) {
            $colorBlock.attr('data-letter', thisLetter);
            previousLetter = thisLetter;
          }

          $colorBar.append($colorBlock);
        }
      });

      var $colorBlocks = $colorBar.find('a');


      // Load the Dragdealer plugin via AJAX then create the slider
      $.ajax({
        url: assetPath+'js/dragdealer.js',
        dataType: 'script',
        cache: true
      }).done(function(){ // once the script loads

          // Create Dragdealer slider
          var slider = new Dragdealer('dpt-slider', {
            loose: true,
            slide: true,
            steps: numSliderItems,
            speed: 0.15,
            requestAnimationFrame: true, // animate with requestAnimationFrame
            callback: function() { // highlight color block when slider is moved
              var step = Math.round(slider.getStep()[0]); // round to nearest integer. dragdealer occasionally returns step value off by 0.00001
              $colorBlocks.removeClass('is-active');
              $colorBlocks.eq(step-1).addClass('is-active');
            }
          });

          // Start the slider on a random item with data-start="true", otherwise start on first item by default
          var $startItems = $sliderItems.filter('[data-start="true"]');
          var $randomStartItem = $startItems ? $startItems[Math.floor(Math.random()*$startItems.length)] : 0;
          slider.setStep($sliderItems.filter($randomStartItem).index() + 1);

          // Slide to each item when you click or focus on a color block
          $colorBar.on('click focus', 'a', function(e){
            e.preventDefault();
            var id = $(this).attr('href');
            slider.setStep($sliderItems.filter(id).index() + 1);
          });

          // Slide to each item when you click on an item but not when you drag
          $sliderItems.on('mousedown', function() {
            var dragged = false;
            $this = $(this);
            $this
            .one('mousemove', function() { // check for drag events after mousedown
              dragged = true;
            })
            .one('mouseup', function() {
              $this.off('mousemove');  // remove drag detection after mouseup
              if (!dragged) {
                setTimeout(function(){
                  slider.setStep( $this.index() + 1 ); // move slider if no drag has occurred
                }, 20); // wait for dragdealer events to occur before moving slider
              }
            });
          });

          // Slide to each item when you focus on a link inside the item
          $sliderItems.on('focus', 'a', function() {
            slider.setStep($(this).parents('.dpt-slider-item').index() + 1);
          });

          // Remove active state each time mouse enters color bar
          $colorBar.on('mouseenter', function(e){
            $colorBlocks.removeClass('is-active');
          });


          // Resize slider after window resize
          var resizeSlider = throttle(function(){
            setSliderSize(); // reset number of items per screen and slider height
            slider.reflow(); // recalculate the wrapper bounds of the Dragdealer instance
          }, 250); // trigger on leading and trailing edge and every [x]ms

          $win.on('resize',function(){
            resizeSlider();
          });
      });
    }
  };



  // Run these functions on DOM ready:
  initMoments();
  initDepartmentSlider();

})(jQuery);