
angularApp.filter("titlecase", function(){
	return function(str){
		//http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript&usg=AFQjCNEpddQ5ZA9SxbNoOds8SwEhenD3OQ
			if (! _.isUndefined(str))
				return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
			else
				return str;
	};

});

angularApp.filter('isodate', function(){
   return function(datetime){
     var n = datetime.split(' ');
     if(n.length == 1) return datetime;
     else return n.join('T')+'Z';
   };
});

angularApp.filter("array2text", function(){
	return function(arr){
		var str = [];
		_.each(arr,function(val){
			var x = val['v'].replace(/^[a-z]|[^\s][A-Z]/g, function(str, offset) {
                        if (offset == 0)
                                return(str.toUpperCase());
                        else
                                return(str.substr(0,1) + " " + str.substr(1).toUpperCase());
                        })

			str.push(x);
		});
		return str.join(", ");
	};
});

angularApp.filter("list2text", function(){
	return function(list){
		if (! _.isUndefined(list))
			return list.join(", ");
		else
			return list;
	};
});

angularApp.filter("toHumanReadable" , function(){
	return function(str){
            var out = str.replace(/^[a-z]|[^\s][A-Z]/g, function(str, offset) {
                    if (offset == 0)
                            return(str.toUpperCase());
                    else
                            return(str.substr(0,1) + " " + str.substr(1).toUpperCase());
                    });
            return(out);
    };
});
angularApp.filter("workflowArray2text", function(){
	return function(arr){
		var str = [];
		_.each(arr,function(val){
			var x = val['v'].replace(/^[a-z]|[^\s][A-Z]/g, function(str, offset) {
                        if (offset == 0)
                                return(str.toUpperCase());
                        else
                                return(str.substr(0,1) + " " + str.substr(1).toUpperCase());
                        })

			if((val['n'] !='user') || (val['n'] === 'user' && val['g'] === 'group')){
				if(val['c'] === "*")
					var y = 'All';
				else
					var y = 'Any '+val['c'];
				str.push(x+" ("+y+")");
			}
			else
				str.push(x);
		});
		return str.join(", ");
	};
});

