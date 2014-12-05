angularApp.factory('mainFactory', function() {
    var list = [];
    return list;
});


angularApp.factory('basket', function() {
    var items = [];
    var myBasketService = {};

    myBasketService.addItem = function(item) {
        items.push(item);
    };
    myBasketService.removeItem = function(item) {
        var index = items.indexOf(item);
        items.splice(index, 1);
    };
    myBasketService.items = function() {
        return items;
    };

    return myBasketService;
});

angularApp.factory('imsFactory', function() {
    // var items = [];
    var items = {};
    var imsService = {};

    imsService.clearAllItem = function(item) {
        // items=[];
        items = {};
    };

    imsService.addItem = function(item) {
        // items.push(item);
        items = item;
    };
    imsService.removeItem = function(item) {
        var index = items.indexOf(item);
        items.splice(index, 1);
    };
    imsService.items = function() {
        return items;
    };

    return imsService;
});