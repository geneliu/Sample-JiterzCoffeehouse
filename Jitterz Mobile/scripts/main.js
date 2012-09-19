//TODO: Decompose larger funcitons in to more managable modules

//Create applicaiton object closure
window.JitterzApp = (function($,console,document){
	//Declar all private app variables
	var _mapElem,
		_mapObj,
		_private,
		_appData = new JitterzData(),
		_announcementData,
		//TEMPLATES
		_tmplAnnouncements = kendo.template($("#announcement-listview-template").html()),
		//UI ELEMENTS
		$announcementsEle = $("#announcements-listview");

	_announcementData = [
		{ title: "Holiday Drinks Are Here", description: "Enjoy your favorite holiday drinks, like Pumpkin Spice Lattes.", url: "images/holiday.jpg" },
		{ title: "Register & Get Free Drinks", description: "Register any Jitterz card and start earning rewards like free drinks. Sign-up now.", url: "images/rewards.jpg" },
		{ title: "Cheers to Another Year", description: "Raise a cup of bold and spicy Jitterz Anniversary Blend.", url: "images/anniversary.jpg" }
	];

	//Private methods
	_private = {
		getLocation: function(successCallback, errorCallback, options){
			//Default value for options
			if(options === undefined){ options = {enableHighAccuracy: true}; }

			navigator.geolocation.getCurrentPosition(
				successCallback, 
				errorCallback, 
				options);
		},
		initMap: function(position){
			//Delcare function variables
			var laglng,
				myOptions,
				mapObj = _mapObj,
				mapElem = _mapElem || document.getElementById("map"),
				marker,
				pin,
				locations = [];

			_mapElem = mapElem; //Cache DOM element

			//Don't reinit entire map if already iniatlized in the app
			if(mapObj === undefined){
				console.log("INITIALIZING MAP")
				// Use Google API to get the location data for the current coordinates
				latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				
				myOptions = {
					zoom: 12,
					center: latlng,
					mapTypeControl: false,
					navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL },
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};
			    
			    console.log("CREATE MAP", mapElem, myOptions);
				mapObj = new google.maps.Map(mapElem, myOptions);
				_mapObj = mapObj; //Cache at app level
			    
			    

			    pin = [{
			    	position: latlng,
			    	title: "Your Location"
			    }];

			    _private.addMarkers(pin, mapObj);
			}
		    
			// Get stores nearby
			_appData.getStarbucksLocations(position.coords.latitude, position.coords.longitude)
				.done(function(result){
					var len = result.length,
						pinColor = "66CCFF",
						pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
											   new google.maps.Size(21, 34),
											   new google.maps.Point(0, 0),
											   new google.maps.Point(10, 34)),
						pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
												new google.maps.Size(40, 37),
												new google.maps.Point(0, 0),
												new google.maps.Point(12, 35)),
						markerImage = new google.maps.MarkerImage('icons/coffeecupbutton.png');

					for (var i = 0; i < len; i++) {
						locations.push({
							title: result[i].WalkInAddressDisplayStrings[0] + ", " + result[i].WalkInAddressDisplayStrings[1],
							position: new google.maps.LatLng(result[i].WalkInAddress.Coordinates.Latitude, result[i].WalkInAddress.Coordinates.Longitude),
							icon: pinImage,
							shadow: pinShadow,
							animation: google.maps.Animation.DROP
						});
					};

					_private.addMarkers(locations, mapObj);
				})
				.fail(function(error){
					alert("Error loading locations.");
				});
		},
		addMarkers: function(locations, mapObj){
			console.log("HERE",locations);
			var marker,
			    i = 0,
				len = locations.length;

			for (i = 0; i < len; i++) {				
				var tmpLocation = locations[i];
				console.log("ADDING MARKER", tmpLocation);
				marker = new google.maps.Marker({
					position:tmpLocation.position,
					map:mapObj,
					title:tmpLocation.title,
					icon: tmpLocation.icon,
					shadow: tmpLocation.shadow,
					animation: tmpLocation.animation
				});
			};			
		}
	};

	//PUBLIC API
	return {
		homeInit: function(){
			//Init MobileListView
			$announcementsEle.kendoMobileListView({
				dataSource: kendo.data.DataSource.create({ data: _announcementData }),
				template: _tmplAnnouncements
			});
		},
		storesShow: function(){
			_private.getLocation(
					function(position){ 
						console.log("POSITION", position)
						_private.initMap(position); 
					},
					function(error){ alert(error.message); /*TODO: Better handling*/ }
				);
		},
		storesInit: function(){
			$("#btnRefreshMap").on("click", function(){ JitterzApp.storesShow(); });
		}
	};

}(jQuery, console, document));