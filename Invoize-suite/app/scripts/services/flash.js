 'use strict';

angularApp.factory("flash", function($rootScope) {

        var queue = [], currentMessage = {};
  
        $rootScope.$on('$routeChangeSuccess', function() {
                if (queue.length > 0) 
                        currentMessage = queue.shift();
                else
                        currentMessage = {};
        });
  
        return {
                set: function(message) {
                        var msg = message;
                        queue.push(msg);
                },

                get: function(message) {
                        return currentMessage;
                },

                pop: function(message) {
                        switch(message.type) {
                            case 'success':
                                        toastr.success(message.body, message.title,message.options); // eg. message.options:{'timeOut':'0',"extendedTimeOut": "0"} for sticky notification.
                                        break;
                                case 'info':
                                        toastr.info(message.body, message.title,message.options);
                                        break;
                                case 'warning':
                                        toastr.warning(message.body, message.title,message.options);
                                        break;
                                case 'error':
                                        toastr.error(message.body, message.title,message.options);
                                        break;
                        }
                }
          };
});