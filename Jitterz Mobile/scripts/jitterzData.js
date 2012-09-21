var JitterzData = function(){
	var _endpoints;

	_endpoints = {
		starbucksLocs: {path:"http://www.starbucks.com/api/location.ashx?&features=&lat={LAT}&long={LONG}&limit={MAX}",verb:"GET"},
        starbucksTest: {path:"scripts/testData/starbucksTest.json",verb:"GET"}
	};

	var _private = {
		load: function(route, options) {
			var path = route.path,
            	verb = route.verb,
                dfd = new $.Deferred();

            console.log("GETTING", path, verb, options);

            //TODO: Use cached data before re-querying (if fresh)
            if (!dfd.isRejected()) {
                $.ajax({
                    type: verb,
                    url: path,
                    data: options,
                    dataType: "json"
                }).success(function (data, code, xhr) {
                    dfd.resolve(data, code, xhr);
                }).error(function (e, r, m) {
                    console.log("ERROR", e, r, m);
                    dfd.reject(m);
                });
            }

            return dfd.promise();
        }
	}

	return{
		getStarbucksLocations: function(lat, lng, max){
			var route = $.extend({}, _endpoints.starbucksLocs);

            route.path = route.path.replace(/{LAT}/g, lat);
            route.path = route.path.replace(/{LONG}/g, lng);
            route.path = route.path.replace(/{MAX}/g, max || 10);

            if(document.location.hostname == "coffee"){
                //Test environment (localhost) - fake response
                route = $.extend({}, _endpoints.starbucksTest);
            }

            return _private.load(route, {});
		}

	}
}