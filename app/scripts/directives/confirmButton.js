angularApp.directive('confirmButton', function($document, $parse) {
          return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                        var buttonId, html, message, nope, title, yep;
              
                        buttonId = Math.floor(Math.random() * 10000000000);
              
                        attrs.buttonId = buttonId;
                        message = attrs.message || "Are you sure?";
                        yep = attrs.yes || "Yes";
                        nope = attrs.no || "No";
                        title = attrs.title || "Confirm";
                        html = "&lt;div id=\"button-" + buttonId + "\">\n  &lt;span class=\"confirmbutton-msg\">Are you sure?&lt;/span>&lt;br>\n  &lt;button class=\"confirmbutton-yes btn btn-danger\">Yes&lt;/button>\n    &lt;button class=\"confirmbutton-no btn\">No&lt;/button>\n&lt;/div>";
                      
                        element.popover({
                                content: html,
                                html: true,
                                trigger: "manual",
                                title: "Confirm"
                                }
                        );


                        element.bind('click', function(e) {

                                var dontBubble = true;                                
                                e.stopPropagation();                                
                                element.popover('show');                                
                                var pop = $("#button-" + buttonId);                                
                                pop.closest(".popover").click(function(e) {
                                  if (dontBubble) {
                                    e.stopPropagation();
                                  }
                                });
                                
                                pop.find('.confirmbutton-yes').click(function(e) {
                                  dontBubble = false;
                                  
                                  var func = $parse(attrs.confirmButton);
                                  func(scope);
                                });
                                
                                pop.find('.confirmbutton-no').click(function(e) {
                                  dontBubble = false;
                                  
                                  $document.off('click.confirmbutton.' + buttonId);
                                  
                                  element.popover('hide');
                                });
                                
                                $document.on('click.confirmbutton.' + buttonId, ":not(.popover, .popover *)", function() {
                                  $document.off('click.confirmbutton.' + buttonId);
                                  element.popover('hide');
                                });
                        });

              
             
                }
          };
});