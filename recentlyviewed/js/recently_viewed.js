(function ($) {
  Drupal.behaviors.recentlyViewedStorage = {
    _carouselVisibleItems: function () {
      var $this = $(this), w = $this.parent().width();
      return Math.floor(w / 255);
    },

    attach: function () {
      if (!this.attached) {
        if (Drupal.behaviors.framesCustomEventManager) {
          Drupal.behaviors.framesCustomEventManager.listen(
              Drupal.behaviors.recentlyViewedStorage.onUpdate,
              Drupal.behaviors.recentlyViewedStorage
          );
        }
        $('.recently-viewed-widget .clear-list').live('touchstart click', function() {
          $('.recently-viewed-widget').fadeOut('slow', function() {
            Drupal.behaviors.recentlyViewedStorage.clear_all();

            $('#recently-viewed-carousel')
              .html('')
              .trigger('destroy');
          });
          return false;
        });

        $('.recently-viewed-widget a.remove-item').live('touchstart click', function (e) {
          e.preventDefault();
          var sku = $(this).parent().attr('data-attr-sku');
          Drupal.behaviors.recentlyViewedStorage.remove(sku);

          return false;
        });

        // Force <a> to work on mobiles (need to find out why this happens).
        $('#recently-viewed-carousel').on('touchstart', 'a.recent-link', function() {
            if($(this).parent().hasClass('recently-hover')){
                var link = $(this).attr('href');
                window.location = link;
            }
            else{
                $('.recently-hover').removeClass('recently-hover');
                $(this).parent().addClass('recently-hover');
            }
        });
      }

    if (this.isLocalStorageSupported()) {
      this.build();
    }

      // Pagination links center align
      var recentlyViewsPaginationWidth = 0;
      $('#recently-viewed-carousel a.recent-link').each(function(){
        recentlyViewsPaginationWidth += $(this).outerWidth(true); // include margin
      });
      $('#recently-viewed-carousel').width(recentlyViewsPaginationWidth);

      if (Drupal.settings.frames_custom !== undefined) {
        this.insert(
          Drupal.settings.frames_custom.sku,
          Drupal.settings.frames_custom.plu.brand,
          Drupal.settings.frames_custom.plu.name,
          window.location.pathname,
          "frame",
          Drupal.formatString(
            Drupal.settings.recentlyviewed.path,
            {
              '@sku': Drupal.settings.frames_custom.sku,
              '@type': 'front',
              '@size': '200x113'
            }
          )
        );
      } else if (Drupal.settings.custom_contact_lenses !== undefined) {
        this.insert(
          Drupal.settings.custom_contact_lenses.plu,
          Drupal.settings.custom_contact_lenses.brand,
          Drupal.settings.custom_contact_lenses.vendor,
          window.location.pathname,
          "contact-lens",
          Drupal.settings.custom_contact_lenses.image
        );
      }

      Drupal.behaviors.recentlyViewedStorage.resized = false;
      if (!this.attached) {
        $(window).resize(function () {
          if (Drupal.behaviors.recentlyViewedStorage.resized === false) {
            Drupal.behaviors.recentlyViewedStorage.resized = true;
            setTimeout(function () {
              $('#recently-viewed-carousel').trigger(
                'configuration',
                [
                  'items', {
                    visible: Drupal.behaviors.recentlyViewedStorage._carouselVisibleItems
                  }
                ],
                true
              ).trigger("resize");
              Drupal.behaviors.recentlyViewedStorage.resized = false;
            }, 250);
          }
        });


        $(window).resize();
      }

      this.attached = true;
    },

    isLocalStorageSupported : function () {
        var testKey = 'SS', storage = window.sessionStorage;
        try {
            storage.setItem(testKey, '1');
            storage.removeItem(testKey);
            return true;
        } catch (error) {
              return false;
        }
    },

    build: function () {
      var skus = this.get(),
          carousel = $('#recently-viewed-carousel'),
          rendered = 0;

      if (skus.length === 0) {
        return;
      }

      $.each(skus, function (index, item) {
        if (carousel.find('div[data-attr-sku="' + item.sku + '"]').length > 0 || item.path === undefined) {
          return;
        }

        var sku = $('<div>')
          .addClass('recently-viewed-item')
          .attr('data-attr-sku', item.sku)
          .appendTo(carousel);

        var remove = $('<a>')
          .addClass('remove-item')
          .attr('href', '#')
          .appendTo(sku);

        var link = $('<a>')
          .attr('href', item.path + '?sku=' + item.sku)
          .addClass('recent-link')
          .appendTo(sku);

        var item_title = '';
        if (window.stripos(item.title, item.brand) !== false) {
          item_title = item.title;
        } else {
          item_title = item.brand + ' ' + item.title;
        }

        var item_src = item.src !== undefined ?
          item.src :
          Drupal.formatString(Drupal.settings.recentlyviewed.path, {'@sku':item.sku, '@type':'front', '@size':'200x113'});

        var img = $('<img>')
          .attr('src', item_src)
          .attr('alt', item_title)
          .attr('title', item_title)
          .attr('class', 'img-responsive')
          .appendTo(link);

        var title = $('<span>')
          .html(item_title)
          .appendTo(link);

        rendered += 1;
      });

      if (rendered > 0) {
        this.updateCount();

        $('.recently-viewed-widget').show();

        carousel.carouFredSel({
          responsive: true,
          circular: false,
          infinite: false,
          auto: false,
          items: {
            visible: Drupal.behaviors.recentlyViewedStorage._carouselVisibleItems,
            width: 260,
            height: 165
          },

          pagination: '#recently-viewed-pages',
          prev: '#recently-viewed-prev',
          next: '#recently-viewed-next'
        });

        carousel.swipe({
          excludedElements: "button, input, select, textarea, .noSwipe",
          swipeLeft: function() {
            carousel.trigger('next', Drupal.behaviors.recentlyViewedStorage._carouselVisibleItems());
          },
          swipeRight: function() {
            carousel.trigger('prev', Drupal.behaviors.recentlyViewedStorage._carouselVisibleItems());
          },
          click: function(event, target) {
            var $target = $(target);
            if (!$target.hasClass('remove-item')) {
              var $link = $target.closest('li[data-attr-sku]').find('a[href!="#"]:first');
              if ($link.length > 0) {
                window.open($link.attr('href'), '_self');
              }
            }
          }
        });
      }
    },

    updateCount: function () {
      var title = $('.carousel-header h3'),
          value = title.html();
      if(value){
        idx = value.indexOf(' (');
      }
      else{
        return;
      }
      if (idx > -1) {
        value = value.substr(0, idx);
      }

      title.html(value + ' (' + $('#recently-viewed-carousel .recently-viewed-item[data-attr-sku]').length + ')');
    },

    insert: function (sku, brand, title, path, type, src) {
      if (localStorage !== undefined) {
        var skus = this.get(),
            found = false,
            tmpSkus = [];

        for (var i = 0, len = skus.length; i < len; i++) {
          if (skus[i].sku === sku) {
            continue;
          }

          tmpSkus.push(skus[i]);
        }

        skus = tmpSkus;

        if (skus.length + 1 > Drupal.settings.recentlyviewed.max) {
          skus.pop();
        }

        skus.unshift({
          sku: sku,
          brand: brand || '',
          title: title || '',
          path: path,
          type: type,
          src: src
        });

        this._set(skus);
      }

      return this;
    },

    _set: function (skus) {
      if (localStorage !== undefined) {
        localStorage.setItem('recentlyviewed_widget', JSON.stringify(skus));
      }

      return this;
    },

    remove: function (sku) {
      var me = this,
          skus = this.get(),
          new_skus = [];

      $.each(skus, function (index, item) {
        if (item.sku !== sku) {
          new_skus.push(item);
        }
      });

      this._set(new_skus);

      $('#recently-viewed-carousel .recently-viewed-item[data-attr-sku="' + sku + '"]')
        .fadeOut('slow', function () {
          $('#recently-viewed-carousel').trigger('removeItem', [$(this), null, 0]);

          if ($('#recently-viewed-carousel .recently-viewed-item').length == 0) {
            $('.recently-viewed-widget').fadeOut('slow', function() {
              $('#recently-viewed-carousel').trigger('destroy');
            });
          }

          me.updateCount();
        });

      return this;
    },

    get: function () {
      if(window.localStorage) {
        if (localStorage !== undefined) {
          var data = localStorage.getItem('recentlyviewed_widget') || [];
          try {
            if (typeof data == 'string') {
              data = JSON.parse(data);
            }
          }
          catch (err) {
            data = [];
          }

          return data;
        }
      }

      return [];
    },

    clear_all: function () {
      this._set([]);
      return this;
    },

    onUpdate: function (sku, event) {
      if (event === 'click') {
        this.insert(
          sku,
          Drupal.settings.frames_custom.plu.brand,
          Drupal.settings.frames_custom.plu.name,
          window.location.pathname
        );
      }
    }
  };

  window.stripos = function (f_haystack, f_needle, f_offset) {
    var haystack = (f_haystack + '').toLowerCase();
    var needle = (f_needle + '').toLowerCase();
    var index = 0;

    if ((index = haystack.indexOf(needle, f_offset)) !== -1) {
      return index;
    }
    return false;
  }
})(jQuery);
