(function ($) {
   $.fn.overlayMask = function (action, cssClass, isBody) {
      //debugger;
      isBody = isBody || false;
      var css = (cssClass == null) ? 'a-overlay-mask' : cssClass;
      var pos = (isBody == false) ? 'relative' : 'inherit';

      // calculate height
      var h = '100%';
      if (isBody === true) {
         h = $(document).height() + 'px';
      }

      var mask = this.find('.' + css);

      // Create the required mask
      if (!mask.length) {
         this.css({
            position: pos
         });

         mask = $('<div class="' + css + '" style="height:' + h + '"></div>');
         mask.appendTo(this);
      }

      // Act based on params
      if (!action || action === 'show') {
         mask.show();
      } else if (action === 'hide') {
         mask.hide();
      }

      return this;
   };
})(jQuery);