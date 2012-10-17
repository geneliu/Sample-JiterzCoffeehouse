//TODO: Decompose larger funcitons in to more managable modules

//Create applicaiton object closure
(function($,console,doc){
	//Declar all private app variables
	var _app,
		_mapElem,
		_mapObj,
		_storeListElem,
		_private,
		_appData = new JitterzData(),
		_announcementData,
		_isOnline = navigator.onLine,
		//TEMPLATES
		_tmplAnnouncements = kendo.template($("#announcement-listview-template").html()),
		_tmplStoreList,
		//UI ELEMENTS
		$announcementsEle = $("#announcements-listview");

	_announcementData = [
		{ title: "Holiday Drinks Are Here", description: "Enjoy your favorite holiday drinks, like Pumpkin Spice Lattes.", url: "images/holiday.jpg" },
		{ title: "Register & Get Free Drinks", description: "Register any Jitterz card and start earning rewards like free drinks. Sign-up now.", url: "images/rewards.jpg" },
		{ title: "Cheers to Another Year", description: "Raise a cup of bold and spicy Jitterz Anniversary Blend.", url: "images/anniversary.jpg" }
	];

	//Private methods
	_private = {
		getLocation: function(options){
			var dfd = new $.Deferred();

			//Default value for options
			if(options === undefined){ options = {enableHighAccuracy: true}; }

			navigator.geolocation.getCurrentPosition(
				function(position){ 
					dfd.resolve(position);
				}, 
				function(error){
					dfd.reject(error);
				}, 
				options);

			return dfd.promise();
		},
		initMap: function(position){
			//Delcare function variables
			var laglng,
				myOptions,
				mapObj = _mapObj,
				mapElem = _mapElem,
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
			var marker,
			    i = 0,
				len = locations.length;

			for (i = 0; i < len; i++) {				
				var tmpLocation = locations[i];

				marker = new google.maps.Marker({
					position:tmpLocation.position,
					map:mapObj,
					title:tmpLocation.title,
					icon: tmpLocation.icon,
					shadow: tmpLocation.shadow,
					animation: tmpLocation.animation
				});
			};			
		},
		initStoreList: function(position){
			_appData.getStarbucksLocations(position.coords.latitude, position.coords.longitude)
				.done(function(data){
					//TODO: Bind data to listview
					$(_storeListElem).kendoMobileListView({
						dataSource: kendo.data.DataSource.create({ data: data }),
						template: _tmplStoreList
					});
				})
				.fail();
		},
		toggleStoreView: function(index){
			var isMap = (index === 0);

			_private.getLocation()
				.done(function(position){ 
					if(isMap){
						$(_storeListElem).hide();
						$(_mapElem).show();

						_private.initMap(position);
					}else{
						$(_storeListElem).show();
						$(_mapElem).hide();

						_private.initStoreList(position);
					} 
				})
				.fail(function(error){ 
					console.log(error); /*TODO: Better handling*/ 
				});			
		}
	};

	//PUBLIC API
	_app = {
		init: function(){
			//TODO: Wire-up online status change event listener
		},
		cardInit: function(eleFront,eleBack,eleContainer,eleWrapper,eleSpinner, eleBalance){
			//Setup card flip interaction
			//TODO: Refactor selector caching 
			var ccFront = $(eleFront),
				ccBack = $(eleBack),
				ccContainer = $(eleContainer),
				ccWrapper = $(eleWrapper),
				ccSpinner = $(eleSpinner),
				ccBalance = $(eleBalance),
				isFlipped = false,
				face = (isFlipped) ? ccBack : ccFront,
				back = (isFlipped) ? ccFront : ccBack,
				degree = (isFlipped) ? 0 : 180;

			ccContainer.on("click", function(){
				ccWrapper.kendoAnimate({
					effects: "flip:horizontal",
					duration: 1500,
					degree: degree,
					face: face,
					back: back,
					reverse: isFlipped,				
					complete: function(){ 
						isFlipped = !isFlipped; 

						(isFlipped) ? ccSpinner.fadeIn() : ccSpinner.hide();
						(isFlipped) ? ccBalance.hide() : ccBalance.fadeIn();
					}
				})
			});

			//Init barcode
			ccBack.children("figure").barcode({code:'I25'});
		},
		homeInit: function(){
			//Init MobileListView
			$announcementsEle.kendoMobileListView({
				dataSource: kendo.data.DataSource.create({ data: _announcementData }),
				template: _tmplAnnouncements
			});
		},
		storesShow: function(){
			//Don't attempt to reload map/sb data if offline
			console.log("ONLINE", _isOnline);
			if(_isOnline === false){				
				alert("Please reconnect to the Internet to load locations.");

				return;
			}

			_private.getLocation()
				.done(function(position){ 
						_private.initMap(position); 
				})
				.fail(function(error){ 
					alert(error.message); /*TODO: Better handling*/ 
				});
		},
		storesInit: function(){
			_mapElem = document.getElementById("map");
			_storeListElem = document.getElementById("storeList");
			_tmplStoreList = kendo.template($("#tmplStoreListItem").html());

			$("#btnRefreshMap").on("click", function(){ JitterzApp.storesShow(); });

			$("#btnStoreViewToggle").data("kendoMobileButtonGroup")
				.bind("select", function(e){
				_private.toggleStoreView(e.sender.selectedIndex);
			})
		},
		get_isOnline: function(){
			return _isOnline;
		}
	};

	_app.init();

	window.JitterzApp = _app;

}(jQuery, console, document));