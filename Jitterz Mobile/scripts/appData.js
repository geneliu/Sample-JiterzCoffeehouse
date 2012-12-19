var AppData = function(){
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

            //Return cached data if available (and fresh)
            if(verb === "GET" && _private.checkCache(path) === true){
                //Return cached data
                dfd.resolve(_private.getCache(path));
            }else{
                //Get fresh data
                $.ajax({
                    type: verb,
                    url: path,
                    data: options,
                    dataType: "json"
                }).success(function (data, code, xhr) {
                    _private.setCache(path, {
                        data: data,
                        expires: new Date(new Date().getTime() + (15*60000)) //+15min
                    })
                    dfd.resolve(data, code, xhr);
                }).error(function (e, r, m) {
                    console.log("ERROR", e, r, m);
                    dfd.reject(m);
                });
            }

            return dfd.promise();
        },
        checkCache: function(path){
            var data,
                path = JSON.stringify(path);

            try{
                data = JSON.parse(localStorage.getItem(path));
                
                if(data === null || data.expires <= new Date().getTime()) 
                {
                    console.log("CACHE EMPTY", path);
                    return false;
                }
            }
            catch(err){
                console.log("CACHE CHECK ERROR", err);
                return false;
            }

            console.log("CACHE CHECK", true, path);
            return true;
        },
        setCache: function(path, data, expires){
            var cache = {
                    data: data,
                    expires: expires
                },
                path = JSON.stringify(path);

            //TODO: Serialize JSON object to string
            localStorage.setItem(path, JSON.stringify(cache));

            console.log("CACHE SET", cache, new Date(expires), path);
        },
        getCache: function(path){
            var path = JSON.stringify(path),
                cache = JSON.parse(localStorage.getItem(path));

            console.log("LOADING FROM CACHE", cache, path);

            //TODO: Deserialize JSON string
            return cache.data.data;
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