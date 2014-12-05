angularApp.filter("firstLetter", function() {
	return function(str) {
		//http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript&usg=AFQjCNEpddQ5ZA9SxbNoOds8SwEhenD3OQ
		if (!_.isUndefined(str))
			return str.substring(0, 1).toUpperCase();
		else
			return '-';
	};

});

angularApp.filter("titlecase", function() {
	return function(str) {
		//http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript&usg=AFQjCNEpddQ5ZA9SxbNoOds8SwEhenD3OQ
		if (!_.isUndefined(str))
			return str.replace(/\w\S*/g, function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		else
			return str;
	};

});

angularApp.filter("capital", function() {
    return function(str) {
        //http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript&usg=AFQjCNEpddQ5ZA9SxbNoOds8SwEhenD3OQ
        if (!_.isUndefined(str))
            return str.replace(/\w\S*/g, function(txt) {
                return txt.toUpperCase();
            });
        else
            return str;
    };

});

angularApp.filter('isodate', function() {
	return function(datetime) {
		var n = datetime.split(' ');
		if (n.length == 1) return datetime;
		else return n.join('T') + 'Z';
	};
});

angularApp.filter("selectFormat", function() {
	return function(arr) {
		if (_.isArray(arr)) {
			if (arr.length < 1)
				return "N/A";
			var str = [];
			_.each(arr, function(val) {

				var temp = val['n'].toString().replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
				if (!_.isUndefined(str))
					temp = temp.replace(/\w\S*/g, function(txt) {
						return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
					});

				str.push(temp);
			});
			return str.join(", ");
		} else {
			if (_.isEmpty(arr))
				return "N/A";
			else
				return arr;
		}


	};
});

angularApp.filter("selectTo" +
    "Text", function() {
    return function (arr,sep) {
        if(arr && arr.length){
            var result = [];
            for(var i=0;i<arr.length;i++) result.push(arr[i].n);
            return result.join(sep||',');
        }
        else return '';
    }
});

angularApp.filter("toArrayId", function() {
    return function(arr) {
        if (_.isArray(arr)) {
            if (arr.length < 1)
                return "";
            var str = [];
            _.each(arr, function(val) {

                var temp = val['v'].toString().replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
                if (!_.isUndefined(str))
                    temp = temp.replace(/\w\S*/g, function(txt) {
                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                    });

                // var x = temp.replace(/^[a-z]|[^\s][A-Z]/g, function(str, offset) {
                //                      if (offset == 0)
                //                              return(str.toUpperCase());
                //                      else
                //                              return(str.substr(0,1) + " " + str.substr(1).toUpperCase());
                //                      })

                str.push(temp.trim());
            });
            return str.join(",");
        } else {
            if (_.isEmpty(arr))
                return "";
            else
                return arr;
        }


    };
});
angularApp.filter("formatSystem", function() {
    return function(list) {
        var str = "";
        if (!_.isUndefined(list))
            _.each(list, function(sys) {
             str+='<div class="pop-sys"><div class="pop-line"><i class="fa  fa-desktop"></i>  '+sys.name;
//             str+='<div class="pop-sys"><div class="pop-line"><i class="fa  fa-desktop"></i>  '+sys.name+'</div><div class="pop-des"> <div> <i class="fa fa-map-marker">&nbsp;&nbsp;</i>&nbsp;'+sys.location+'</div> <div> <i class="fa fa-bar-chart-o"></i> '+sys.operation+' </div> <div> <i class="fa  fa-tags "></i> '+sys.account+' </div> </div></div>';
            });
        return str;
    };
});
angularApp.filter("list2text", function() {
	return function(list) {
		if (!_.isUndefined(list))
			return list.join(", ");
		else
			return list;
	};
});

angularApp.filter("toHumanReadable", function() {
	return function(input) {
		return input.toString().replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1").replace(/\w\S*/g, function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
		// var out = str.replace(/^[a-z]|[^\s][A-Z]/g, function(str, offset) {
		//         if (offset == 0)
		//                 return(str.toUpperCase());
		//         else
		//                 return(str.substr(0,1) + " " + str.substr(1).toUpperCase());
		//         });
		// return(out);
	};
});
angularApp.filter("workflowArray2text", function() {
	return function(arr) {
		var str = [];
		_.each(arr, function(val) {
			var x = val['v'].replace(/^[a-z]|[^\s][A-Z]/g, function(str, offset) {
				if (offset == 0)
					return (str.toUpperCase());
				else
					return (str.substr(0, 1) + " " + str.substr(1).toUpperCase());
			})

			if ((val['n'] != 'user') || (val['n'] === 'user' && val['g'] === 'group')) {
				if (val['c'] === "*")
					var y = 'All';
				else
					var y = 'Any ' + val['c'];
				str.push(x + " (" + y + ")");
			} else
				str.push(x);
		});
		return str.join(", ");
	};
});

/**
 * @author nishith.modi@searce.com
 * @name slice
 * @filterService
 *
 * @description slice the input array from starting index to end index
 * @param {arr, from, to} input 'arr', 'from' index, 'to' index
 * @return {Array} return the sliced array
 */
angularApp.filter("slice", function() {
    return function(arr, from, to) {
      return (arr || []).slice(from,to);
    };
});//end: filter(slice)
// To order object elements
//angularApp.filter('orderObjectBy', function() {
//    return function(items, field, reverse) {
//        var filtered = [];
//        angular.forEach(items, function(item) {
//            filtered.push(item);
//        });
//        filtered.sort(function (a, b) {
//            return (a[field] > b[field]);
//        });
//        if(reverse) filtered.reverse();
//        return filtered;
//    };
//});


