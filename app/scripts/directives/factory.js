angularApp.factory('mainFactory',function(){
	var list=[];
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
