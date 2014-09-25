(function( Hammer ) {

  /**
   * @ngdoc module
   * @name material.components.swipe
   * @description Swipe module!
   */
  angular.module('material.components.swipe',['ng'])

    /**
     * @ngdoc directive
     * @module material.components.swipe
     * @name $materialSwipe
     *
     *  This service allows directives to easily attach swipe and pan listeners to
     *  the specified element.
     *
     * @private
     */
    .service("$materialSwipe", ['$log', function($log) {

      SwipeService.PAN_LEFT = 'panleft';
      SwipeService.PAN_RIGHT = 'panright';
      SwipeService.SWIPE_LEFT = 'swipeleft';
      SwipeService.SWIPE_RIGHT = 'swiperight';

      return SwipeService;

      /**
       * SwipeService constructor pre-captures scope and customized event types
       *
       * @param scope
       * @param eventTypes
       * @returns {*}
       * @constructor
       */
      function SwipeService(scope, eventTypes) {
        // match expected API functionality
        var attachNoop = function(){ return angular.noop; };

        if ( !angular.isObject(scope) ) return angular.noop;
        if ( !eventTypes ) eventTypes = 'swipeleft swiperight panleft panright';

        // publish configureFor() method for specific element instance
        return function configureFor(element, onSwipeCallback, attachLater )
        {
          onSwipeCallback = onSwipeCallback || angular.noop;

          if (angular.isUndefined( Hammer )){
            $log.error('Swipe features not available: $materialSwipe requires HammerJS to be preloaded.');
            return attachNoop;
          }

          var hammertime = new Hammer(element[0], {
            recognizers: [
              [ Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL } ],
              [ Hammer.Pan,{ direction: Hammer.DIRECTION_HORIZONTAL } ]
            ]
          });

          // auto-disconnect during destroy
          scope.$on('$destroy', function() {
            hammertime.destroy();
          });

          // Attach swipe listeners now
          if ( !attachLater ) attachSwipe();

          return attachSwipe;

          // **********************
          // Internal methods
          // **********************

          function swipeHandler(ev) {
            scope.$apply(function() {
              onSwipeCallback(ev);
            });
          }

          // enable listeners are return detach() fn
          function attachSwipe() {
            hammertime.on(eventTypes, swipeHandler );
            return detachSwipe;
          }

          // disable listeners
          function detachSwipe() {
            hammertime.off( eventTypes );
            return angular.noop;
          }

        };
      };
    }])

    /**
    * @ngdoc directive
    * @module material.components.swipe
    * @name materialSwipeLeft
    *
    * @order 0
    * @restrict A
    *
    * @description
    * The `<div  material-swipe-left="<expression" >` directive identifies an element on which
    * HammerJS horizontal swipe left and pan left support will be active. The swipe/pan action
    * can result in custom activity trigger by evaluating `<expression>`.
    *
    * @param {boolean=} noPan Use of attribute indicates flag to disable detection of `panleft` activity
    * @param {boolean=} disabled Use of attribute indicates flag to disable swipe/pan actions
    *
    * @usage
    * <hljs lang="html">
    *
    * <div class="animate-switch-container"
    *      ng-switch on="data.selectedIndex"
    *      material-swipe-left="data.selectedIndex+=1;"
    *      material-swipe-right="data.selectedIndex-=1;" >
    *
    * </div>
    * </hljs>
    *
    */
    .directive("materialSwipeLeft", ['$parse', '$materialSwipe',
      function MaterialSwipeLeft($parse, $materialSwipe) {

        return {
          restrict: 'A',

          link: function (scope, element, attrs) {
            var noPan = angular.isDefined(attrs.noPan);
            var parentGetter = $parse(attrs["materialSwipeLeft"]) || angular.noop;
            var configureSwipe = $materialSwipe(scope, noPan ? "swipeleft" : "swipeleft panleft");
            var requestSwipeLeft = function(locals) {
              // build function to request scope-specific swipe response
              parentGetter(scope, locals);
            };

            configureSwipe( element, function onHandleSwipe(ev) {
              if (element[0].hasAttribute('disabled')) return;

              switch (ev.type) {
                case $materialSwipe.SWIPE_LEFT:
                case $materialSwipe.PAN_LEFT  :

                  requestSwipeLeft();
                  break;
              }
            });
          }
        };

      }])

   /**
    * @ngdoc directive
    * @module material.components.swipe
    * @name materialSwipeRight
    *
    * @order 1
    * @restrict A
    *
    * @description
    * The `<div  material-swipe-right="<expression" >` directive identifies functionality
    * that attaches HammerJS horizontal swipe right and pan right support to an element. The swipe/pan action
    * can result in activity trigger by evaluating `<expression>`
    *
    * @param {boolean=} noPan Use of attribute indicates flag to disable detection of `panright` activity
    *
    * @usage
    * <hljs lang="html">
    *
    * <div class="animate-switch-container"
    *      ng-switch on="data.selectedIndex"
    *      material-swipe-left="data.selectedIndex+=1;"
    *      material-swipe-right="data.selectedIndex-=1;" >
    *
    * </div>
    * </hljs>
    *
    */
    .directive( "materialSwipeRight", ['$parse', '$materialSwipe',
      function MaterialSwipeRight($parse, $materialSwipe) {

        return {
          restrict: 'A',

          link: function(scope, element, attrs)
          {
            var noPan = angular.isDefined(attrs.noPan);
            var parentGetter = $parse(attrs["materialSwipeRight"]) || angular.noop;
            var configureSwipe = $materialSwipe(scope, noPan ? "swiperight" : "swiperight panright");
            var requestSwipeRight = function(locals) {
              // build function to request scope-specific swipe response
              parentGetter(scope, locals)
            };

            configureSwipe( element, function onHandleSwipe(ev) {
              switch(ev.type) {
                case $materialSwipe.SWIPE_RIGHT:
                case $materialSwipe.PAN_RIGHT  :
                  if (element[0].hasAttribute('disabled')) return;

                  requestSwipeRight();
                  break;
              }
            });
          }
        };
      }
    ]);


})( window.Hammer );

