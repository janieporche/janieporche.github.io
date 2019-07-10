// ----------------------------------------------------------------------
// CONTAINS GLOBAL FUNCTIONS APPLIED TO ALL PAGES AND GENERAL COMPONENTS
// ----------------------------------------------------------------------

// $win, $body, urlPathArray and assetPath are variables from public.js

;(function($) {

  // Function to securely decode encoded string
  // Used for gallery captions and randomized image captions
  function htmlDecode(encodedString) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
  }

  // Function to dynamically add skip links in the site header and footer
  // Pass the link id and the link name to display. Run on window load.
  $.fn.addSkipLink = function( linkID, linkName ) {

    // Get the ID without the hash
    var linkHash = linkID.replace(/^#/, '');

    // Get the site header and footer
    var $header = $('.site-header');
    var $footer = $('.site-footer');

    // For each destination element
    $(this).each( function() {

      var $destination = $(this);

      // UNCOMMENT TO DEBUG ----------------------------------------------
      // if ( !$('#'+linkHash).length && $destination.length ) {
      //   console.log('Adding skip destination to '+$destination.attr('class'));
      // }
      // else if ( $('#'+linkHash).length && $destination.length ) {
      //   console.log(linkName+' skip link was already added. Could not add another link to '+$destination.attr('class'));
      // }
      // else if ( !$destination.length ) {
      //   console.log('Skip destination does not exist: '+$destination.attr('class'));
      // }
      // END DEBUG CODE --------------------------------------------------


      // If this skip link hasn't already been added for another element
      // And if the destination elements exists
      if ( !$('#'+linkHash).length && $destination.length ) {

        // Add the skip destination element
        // (add a new element in case the destination already has an ID)
        $destination.prepend('<span id="'+linkHash+'" class="skip-to-destination sr-only">'+linkName+'</span>');

        // Then add a skip link to the page header and footer
        var skipLink = '<a href="'+linkID+'" class="skip-to-link">Skip to '+linkName+'&nbsp;&raquo;</a>';

        $header.prepend($(skipLink));
        $footer.append($(skipLink));
      }
    });
  };


  // Function to show a dropdown element when a button is clicked
  var showDropdownOnClick = function(container, dropdown, button, scrollIntoView) {
    var $container = $(container),
        $dropdown = $(dropdown),
        scrollIntoView = scrollIntoView ? scrollIntoView : false;

    if ( $dropdown.length ) {

      // show element when button is clicked
      $container.on('click', button, function(){

        var $this = $(this),
            $thisDropdown = $this.parents(container).find(dropdown),
            $thisOffset = $this.offset().top,
            $thisBottom = $(window).outerHeight() + $(window).scrollTop() - $thisOffset;

        $this.toggleClass('is-active')
        $this.attr('aria-expanded', $this.attr('aria-expanded') === 'true' ? 'false' : 'true');

        $thisDropdown.toggleClass('is-visible');
        $thisDropdown.find('input').focus(); // move focus if there is an input

        // scroll into view if the dropdown is not open and is less than [x] pixels from the window bottom
        if ( scrollIntoView && ($this.attr('aria-expanded') === 'true') && ($thisBottom < 140) ) {
          $('html, body').animate({ scrollTop: $thisOffset }); // scroll the dropdown to the top
        }
      });

      // close dropdown when clicking elsewhere
      $win.on('click touchstart', function(e) {
        if ( !$container.is(e.target) && $container.has(e.target).length === 0 ) {
          $(button).removeClass('is-active').attr('aria-expanded', 'false');
          $dropdown.removeClass('is-visible');
        }
      });
    }
  };


  // Function to stick header navigation to top for headers with the class "sticky"
  var initStickyHeader = function() {

    var $header =  $('.site-header.sticky');

    if ( $header.length ) {
      // sticky header starts after scrolling past header, if header is not at top of page
      var headerTop = $header.offset().top;
      var stickyStart = headerTop > 0 ? headerTop + $header.outerHeight() : 500; // adjust this value to determine where stickiness begins

      var checkStickyHeader = throttle(function(){ // throttle this function because it occurs on scroll

          var scrollTop = $(window).scrollTop();

          if (scrollTop > stickyStart) { // fix the header if scrolling below stickyStart
            $header.addClass('is-fixed');
            $body.addClass('has-fixed-site-header');
          }

          else if ( $header.hasClass('is-fixed') ) { // unfix header if scrolling above stickyStart

            $header.removeClass('is-fixed').removeClass('is-fixed-slideup');
            $body.removeClass('has-fixed-site-header');
          }
      }, 250); // trigger on leading and trailing edge and every [x]ms of scroll

      checkStickyHeader();

      $(window).scroll(function() {
        checkStickyHeader();
      });
    }
  };


  // Function to toggle site header when subsite header nav button is clicked
  var initSubsiteHeader = function() {

    var $subsiteHeader = $('.subsite-header'),
        $siteHeader = $('.site-header.collapsed'); // site-header must have the class "collapsed"

    if ( $subsiteHeader.length && $siteHeader.length ) { //
      $subsiteHeader.on('click', '.subsite-header-nav-btn', function(){
        var $btn = $(this);
        $btn.attr('aria-expanded', $btn.attr('aria-expanded') === 'true' ? 'false' : 'true');
        $subsiteHeader.toggleClass('is-with-site-header');
        $siteHeader.toggleClass('is-visible');
      });
    }
  };


  // Function to search through Quick Access links for site header search
  var initQuickAccess = function() {
    var $quickAccessSearch = $('.quickaccess-search');

    if ( $quickAccessSearch.length ) {

      // Load the QuickAccess plugin via AJAX.
      // Loading in the footer causes issues if the plugin hasn't loaded before we call it.
      $.ajax({
        url: assetPath+'js/jquery.lw-quick-access.js',
        dataType: 'script',
        cache: true
      }).done(function(){ // once the script loads

        // Call Quick Access for each search box on the page
        $quickAccessSearch.each(function() {
          $(this).quickAccess({
            links: "auto",
            combOptions: {
              remoteDataType: 'html',
              loadFrom: function () {
                return assetPath+'search/quickaccess.html';
              }
            }
          });
        });
      });
    }
  };


  // Function to dismiss alert panel
  var initAlert = function() {

    var $alert = $('.emergency-alert');

    $alert.each(function() {
      var $this = $(this);
      $this.on('click', '.emergency-alert-close', function(){
        $this.addClass('is-hidden');
      });
    });
  };



  // Function to set caption width for inline images placed in WYSIWYG area
  var sizeImageCaptions = function() {

      // Function to set caption width on window resize
      $.fn.setWidth = function(width) {
        return this.each(debounce( function() {
          $(this).outerWidth(width);
        }, 25));
      }; // trigger on leading and trailing edge and every [x]ms

      // Set width for each WYSIWYG image that has a caption
      var $figure = $('.figure.has-image');
      $figure.each(function(){

        var $this = $(this);
        var $imageCaption = $this.find('.figure-figcaption');

        if ( $imageCaption.length ) {

          var $image = $this.find('.figure-image');
          var dynamicSrc = $image.attr('src')+ '?' + new Date().getTime(); // required for IE11.
          $image.attr('src', dynamicSrc); // replace the image source. Forces IE 11 to fire load event even when images are cached.

          $image.on('load', function() { // wait for the image to load before measuring width (required for Safari)

            // set the caption width then reveal the caption
            // width is not set on figure element to support centered images
            $imageCaption.setWidth($image.outerWidth()).addClass('is-visible');

            // repeat after window resize / screen rotation because image size changes
            $win.resize( function() {
              $imageCaption.setWidth($image.outerWidth())
            });

          });
        }
      });
  }

     // Function to set caption width for inline images placed in WYSIWYG area
      var sizeImageCaptionsByElement = function() {

          // Function to set caption width on window resize
          $.fn.setWidth = function(width) {
            return this.each(debounce( function() {
              $(this).outerWidth(width);
            }, 25));
          }; // trigger on leading and trailing edge and every [x]ms

          // Set width for each WYSIWYG image that has a caption
          var $figure = $('figure.image');
          $figure.each(function(){

            var $this = $(this);
            var $imageCaption = $this.find('figcaption');

            if ( $imageCaption.length ) {

              var $image = $this.find('img');
              var dynamicSrc = $image.attr('src')+ '?' + new Date().getTime(); // required for IE11.
              $image.attr('src', dynamicSrc); // replace the image source. Forces IE 11 to fire load event even when images are cached.

              $image.on('load', function() { // wait for the image to load before measuring width (required for Safari)

                // set the caption width then reveal the caption
                // width is not set on figure element to support centered images
                $imageCaption.setWidth($image.outerWidth()).addClass('is-visible');

                // repeat after window resize / screen rotation because image size changes
                $win.resize( function() {
                  $imageCaption.setWidth($image.outerWidth())
                });

              });
            }
          });
      }


  // Function to randomize background images
  // Used for header images on core site landing pages and plain pages
  var showRandomImage = function(){

    var $imageContainer = $('.random-image');

    $imageContainer.each(function(){

      // find data attributes starting with "data-image-" and add to an array
      var imageIDs = [];
      $.each(this.attributes, function() {
        if(this.name.indexOf('data-image-') === 0 ) {
          var key = this.name.replace( 'data-image-', '' );
          imageIDs.push(key);
        }
      });

      // select random image from the array
      var $this = $(this),
          randomID = imageIDs[Math.floor(Math.random()*imageIDs.length)],
          imageData = $this.data('image-'+randomID),
          $captionWrapper = $this.find('.js-caption-wrapper'),
          $caption = $this.find('.js-caption'),
          $credit = $this.find('.js-credit');

      // set the background image
      $this.css('background-image', 'url('+imageData.src+')');

      // set the caption (if there is one)
      if ( imageData.caption && imageData.caption.length ) {
        $caption.html(imageData.caption);
      } else {
        $captionWrapper.hide();
      }

      // set the image credit (if there is one)
      if ( imageData.credit && imageData.credit.length ) {
        $credit.html(imageData.credit);
      } else {
        $credit.hide();
      }
    });
  };



  // Function to show image captions on button click
  // used for caption overlay button and photo info button
  var initCaptionBtn = function(containerName) {

    var $caption = $body.find('.'+containerName);

    if ( $caption.length ) {
      // prevent hidden caption links from being focused
      $caption.find('.'+containerName+'-text').find('a, input, button').attr('tabindex', '-1');

      // show or hide caption on click
      $caption.on('click', '.'+containerName+'-btn', function(){
        var $this = $(this);
        // find the text associated with this button
        var $thisCaption = $this.parents('.'+containerName+'');
        $thisCaption.toggleClass('is-visible');

        // toggle the caption state
        $thisCaption.data('state', $thisCaption.data('state') === 'visible' ? 'hidden' : 'visible');

        // then enable/disable keyboard focus on the links inside this caption
        var $thisCaptionLinks = $thisCaption.find('.'+containerName+'-text').find('a, input, button');
        if ( $thisCaption.data('state') === 'visible' ) {
          $thisCaptionLinks.attr('tabindex', '0');
        }
        else {
          $thisCaptionLinks.attr('tabindex', '-1');
        }
      });


      // close caption when clicking elsewhere
      $win.on('click touchstart', function(e) {
        if ( !$caption.is(e.target) && $caption.has(e.target).length === 0 ) {
          $caption.removeClass('is-visible');
          $caption.data('state', 'hidden');
        }
      });
    }
  };


  // Function to move side nav below header on mobile
  var initSideNav = function() {

    var $nav = $('.side-nav');

    if ( $nav.length ) {

      var $mainContent = $('.site-main-content');

      if ( $mainContent.length ) {

        var moveSideNav = debounce( function() {

          // move nav beneath header on mobile, if it hasn't already been moved
          if (window.matchMedia('(max-width: 991px)').matches && !$nav.hasClass('is-dropdown')){
            $nav.after('<span class="side-nav-placeholder d-none"></span>'); // create placeholder element
            $nav.addClass('is-dropdown').insertBefore($mainContent);
          }

          // move nav back to sidebar if window is resized to desktop
          else if ( window.matchMedia('(min-width: 992px)').matches && $nav.hasClass('is-dropdown') ) {
            $nav.replaceAll('.side-nav-placeholder').removeClass('is-dropdown');
          }
        }, 15); // waits until the users stops resizing the window for [x]ms before firing
        moveSideNav();

        // Repeat after window resize / screen rotation
        $win.resize( function() {
          moveSideNav();
        });
      }
    }
  };


  // Function to expand and collapse accordions
  var initAccordions = function() {
    var $accordions = $('.accordion');

    if ( $accordions.length ) {
      var $accordionSections = $accordions.find('.accordion-section'),
          $accordionBtns = $accordions.find('.accordion-section-title').find('button');
          $accordionContent = $accordionSections.find('.accordion-section-content');

      $accordions.on('click', '.accordion-section-title button', function(){
        var $this = $(this),
            $thisSection = $this.parents('.accordion-section'),
            $thisContent = $thisSection.find('.accordion-section-content');

        $thisSection.toggleClass('is-active');
        $thisContent.slideToggle(200);

        // uncomment to only have one section open at a time (also add scrolling to active section)
        // $accordionSections.not($thisSection).removeClass('is-active');
        // $accordionContent.not($thisContent).slideUp(200);
      });
    }
  };


  // Function to display content sliders and photo galleries
  // Uses flickity carousel: flickity.metafizzy.co
  var initFlickity = function() {

    // Photo galleries
    var $carousel = $('.carousel');

    if ( $carousel.length ) {

      $carousel.each(function(){

        var $thisCarousel = $(this),
            enableFullscreen = $thisCarousel.hasClass('fullscreen') ? true : false, // enable fullscreen button
            enableCell = $thisCarousel.hasClass('full-width') ? true : false, // enable full-width treatment
            cellSelector = enableCell ? '.carousel-cell' : '.carousel-image'; // cell wrapper changes for full-width treatment

        $thisCarousel.flickity({
          cellSelector: cellSelector,
          contain: true,
          freeScroll: false,
          freeScrollFriction: 0.05, // higher friction makes the slider feel stickier. default 0.075
          friction: 0.26,
          fullscreen: enableFullscreen, // requires fullscreen CSS and JS
          groupCells: false,
          lazyLoad: 2, // load image in next (n) adjacent cells
          pageDots: false,
          percentPosition: false,
          selectedAttraction: 0.022,
        });

        var flkty = $thisCarousel.data('flickity'), // Flickity instance
            $caption = $thisCarousel.find('.carousel-caption'); // caption container

        // Set new image caption when image changes
        $thisCarousel.on( 'select.flickity', function() {

          var $currentImage = enableCell ? $(flkty.selectedElement).children('.carousel-image') : $(flkty.selectedElement),
              currentImageCaption = $currentImage.data('caption') ? htmlDecode($currentImage.data('caption')) : false;

          if ( currentImageCaption ) {
            $caption.removeClass('is-hidden').html( currentImageCaption );

            // center the caption for fullwidth or fullscreen galleries
            if ( $thisCarousel.hasClass('full-width') || $thisCarousel.hasClass('is-fullscreen') ) {
              $caption.css('text-align', 'center');
            }
            // move the caption directly under the image for other galleries
            else {
              if ( flkty.selectedIndex === 0 ) {
                $caption.css('text-align', 'left');
              }
              else if ( flkty.selectedIndex === flkty.slides.length-1 ) {
                $caption.css('text-align', 'right');
              }
              else {
                $caption.css('text-align', 'center');
              }
            }

          } else {

            // hide the caption container if there's no caption
            $caption.addClass('is-hidden');
          }
        });

        // Center first image for fullscreen gallery. Stick image to right for small gallery.
        $thisCarousel.on( 'fullscreenChange.flickity', function( event, isFullscreen ) {
          if ( isFullscreen === true ) {
            $thisCarousel.flickity({
              contain: false
            });
          } else {
            $thisCarousel.flickity({
              contain: true
            });
          }
        });
      });

      // open carousel fullscreen when clicking gallery preview image
      $('.gallery').on( 'click', '.gallery-button', function() {
        var $gallery = $(this).parents('.gallery'),
            $galleryCarousel = $gallery.find('.gallery-carousel');

          $galleryCarousel.flickity('viewFullscreen');
      });
    }


    // Photo feed (Instagram)
    var $photoFeed = $('.photo-feed-list');

    if ( $photoFeed.length ) {
      $photoFeed.flickity({
        freeScroll: true, // do not align cells to end position
        freeScrollFriction: 0.05, // higher friction makes the slider feel stickier. default 0.075
        friction: 0.26,
        lazyLoad: 3, // load image in next (n) adjacent cells
        prevNextButtons: false, // disable previous & next buttons and dots
        pageDots: false,
        selectedAttraction: 0.022,
        wrapAround: true, // flick forever
        imagesLoaded: true // re-position cells once their images have loaded
      });
    }


    // Showreel sliders
    var $showreel = $('.showreel');


    if ( $showreel.length ) {

      $showreel.flickity({
        freeScroll: true,
        freeScrollFriction: 0.075, // higher friction makes the slider feel stickier. default 0.075
        lazyLoad: !$(this).hasClass('has-articles') ? 2 : false, // lazyload images in next (n) adjacent cells if this is an image gallery (not a content showreel)
        pageDots: false,
        prevNextButtons: false, // disable previous & next buttons and dots
        wrapAround: true, // flick forever
        imagesLoaded: true // re-position cells once their images have loaded
      });
    }
  };


  // Function to reposition form labels when input is focused or filled in
  // Works on text inputs or textareas
  // This behavior is already included with embedded Slate forms
  var initForms = function() {
    var $form = $('.form');

    if ( $form.length ) {
      var $formQuestions = $form.find('.form_question'),
          $formLabels = $formQuestions.find('.form_label');

      $.fn.moveLabels = function(position) {
        return this.each(function() {
          var $this = $(this),
              $thisQuestion = $this.parents('.form_question'),
              $thisLabel = $thisQuestion.find('.form_label');

          if ( position == 'top' ) {
            $thisLabel.addClass('active'); // force label to top on input focus
          } else {
            if( $this.val().length ) { // otherwise check whether input has value
              $thisLabel.addClass('active'); // move label to top
            } else {
              $thisLabel.removeClass('active'); // move label back into input
            }
          }
        });
      };

      // position labels on page load
      $formQuestions.moveLabels();

      // position labels on input blur
      $formQuestions.on('blur', 'input, textarea', function(){
        $(this).moveLabels();
      });

      // position labels on input focus
      $formQuestions.on('focus', 'input, textarea', function(){
        $(this).moveLabels('top');
      });
    }
  };


  // Function to lay out mosaic items in a masonry-style grid
  // Thanks to @andybarefoot https://codepen.io/andybarefoot/pen/QMeZda
  var initMosaics = function() {

    var $mosaic = $('.mosaic');

    if ( $mosaic.length) {

        var grid = document.getElementsByClassName('mosaic')[0],
            rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows')),
            rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap')),
            allItems = document.getElementsByClassName('mosaic-item');

      // function to apply grid-row-end to item depending on its content height
      var resizeGridItem = function(item){
        rowSpan = Math.ceil((item.querySelector('.mosaic-item-inner').getBoundingClientRect().height+rowGap)/(rowHeight+rowGap));
        item.style.gridRowEnd = 'span '+rowSpan;
      };

      // function to resize all the items at once
      var resizeAllGridItems = debounce( function(){
        for(x=0;x<allItems.length;x++){
          resizeGridItem(allItems[x]);
        }
      }, 50);  // waits until the users stops resizing the window for [x]ms before firing


      // On DOM load, layout all items in a mosaic
      resizeAllGridItems();

      // After images have loaded, resize items that have an image
      $.ajax({
        url: assetPath+'js/imagesloaded.pkgd.min.js', // load imagesLoaded plugin
        dataType: 'script',
        cache: true
      }).done(function(){ // if the script loads

        var resizeInstance = function(instance){
          item = instance.elements[0];
          resizeGridItem(item); // resize item when its image has loaded
        };

        for(x=0;x<allItems.length;x++){
          if(allItems[x].getElementsByTagName('img').length > 0) {
            imagesLoaded( allItems[x], resizeInstance);
          }
        }

      });

      // After window resize, layout all items again
      window.addEventListener('resize', resizeAllGridItems);
    }
  };



  // Function to make tabs clickable
  // Used on the calendar
  var initTabs = function() {

    var $tabButtons = $('.tabs-header').find('.tab'),
        $tabSections = $('.tabs-section');

    if ( $tabButtons.length && $tabSections.length ) {

      // prevent hidden tabs sections from being focused
      $tabSections.find('a, input, button').attr('tabindex', '-1');

      // when tab is selected, show relevant tab section
      $tabButtons.on('click', function(e) {

        e.preventDefault();

        // make tab active
        var $thisButton = $(this).addClass('is-active');
        $tabButtons.not($thisButton).removeClass('is-active');

        // then show the section associated with this tab
        var $thisSection = $($thisButton.attr('href'));
        $thisSection.addClass('is-active');
        $thisSection.find('a, input, button').attr('tabindex', '0');

        // deactivate other tab sections
        var $otherSections = $tabSections.not($thisSection).removeClass('is-active');
        $otherSections.find('a, input, button').attr('tabindex', '-1');
      });

      $tabButtons.first().trigger('click');
    }
  };


  // Responsive table styles applied to tables with .data-table
  var initResponsiveTables = function() {

    var $table = $('.data-table');

    $table.each( function() {

      var $this = $(this);

      var $tableHeaderRow = 0;
      var $tableHeaders = 0;

      // if the table has a table head
      if ( $this.find('thead').length ) {
        $tableHeaderRow = $this.find('thead');
        $tableHeaders = $tableHeaderRow.find('th');

      // if there's no thead but the first table row contains headers
      } else if ( $this.find('tbody').find('tr:first-child').has('th, h1, h2, h3, h4, h5, h6').length ) {
        $tableHeaderRow = $this.find('tr:first-child');
        $tableHeaders = $tableHeaderRow.find('td');
        $this.addClass('has-first-row-headers'); // add class to style the first table row differently
      }

      // if the table has headers
      if ( $tableHeaders.length ) {

        // add class to tables with headers
        $this.addClass('has-header');

        // create table headers array for all header columns, even if empty
        var headers = $tableHeaders.map(function() {
          var header = $.trim($(this).text());
          if ( header.length ) {
            header +=':'; // append colon to non-empty headers
          }
          return header;
        }).get();

        // add header data attribute each table cell for display on mobile
        $this.find('tr').not($tableHeaderRow).children().attr('data-th', function() {
          var col = $(this).parent().children().index($(this));
          return headers[col];
        });

        // if left column of the first row (or thead) doesn't have a header, make entire left column into headers on mobile
        $this.find('tr').not($tableHeaderRow).children(':first-child').filter(function(){
          return !$(this).first().attr('data-th');
        }).addClass('mobile-header');
      }
    });
  };


  // Run these functions on DOM ready:

  // Site header
  showDropdownOnClick('.site-header-nav', '.site-header-nav-menu', '.site-header-nav-btn');
  showDropdownOnClick('.site-header-audiences', '.site-header-audiences-menu', '.site-header-audiences-btn', true);
  showDropdownOnClick('.site-header-search', '.site-header-search-form', '.site-header-search-btn', true);
  showDropdownOnClick('.subsite-header-search', '.subsite-header-search-form', '.subsite-header-search-btn', true);
  initStickyHeader();
  initSubsiteHeader();
  initQuickAccess();
  initAlert();

  // Side nav
  showDropdownOnClick('.side-nav', '.side-nav-menu', '.side-nav-btn');
  initSideNav();

  // Images and sliders
  sizeImageCaptions();
  sizeImageCaptionsByElement();
  showRandomImage();
  initCaptionBtn('caption-overlay');
  initCaptionBtn('photo-info');
  initCaptionBtn('photo-panel');
  initFlickity();

  // Other
  initAccordions();
  initForms();
  initMosaics();
  initTabs();
  initResponsiveTables();


  // Run these on window load
  $(window).on('load', function() {

    // Add skip link pointing to start of main page content. May need a different selector for different templates.
    $('.site-main-content').addSkipLink('#skip-to-main', 'Main Content');

  });

})(jQuery);