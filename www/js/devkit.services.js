app.factory('windowEventsFactory', [function(){
	
	var result = {};
	var queue = {};
	
	result.addToQueue = function( event, callback ){		
		if( !Array.isArray(queue[ event ]) ) queue[ event ] = [];
		queue[ event ].push( callback );		
	}
	
	result.runQueue = function( event ) {
		queue[ event ].forEach(function(callback){
			callback.call();
		});
	}
	
	return result;
	
}]);

app.filter("toArray", function(){
    return function(obj) {
        var result = [];
        angular.forEach(obj, function(val, key) {
            result.push(val);
        });
        return result;
    };
});