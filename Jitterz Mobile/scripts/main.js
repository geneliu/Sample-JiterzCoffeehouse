document.addEventListener("deviceready", onDeviceReady, false);

// Apache Cordova is ready
function onDeviceReady() {
    
}

(function($, console, doc) {
    var _app,
		_mapElem,
		_mapObj,
		_storeListElem,
		_private,
		_appData = new AppData(),
		_announcementData,
		_isOnline = true,
		//TEMPLATES
		_tmplAnnouncements = kendo.template($("#announcement-listview-template").html()),
		_tmplStoreList,
		//UI ELEMENTS
		$announcementsEle = $("#announcements-listview");

	_announcementData = [
    		{ title: "Holiday Drinks Are Here", description: "Enjoy your favorite holiday drinks, like Pumpkin Spice Lattes.", url: "images/holiday.png" },
    		{ title: "Register & Get Free Drinks", description: "Register any Jitterz card and start earning rewards like free drinks. Sign-up now.", url: "images/rewards.png" },
    		{ title: "Cheers to Another Year", description: "Raise a cup of bold and spicy Jitterz Anniversary Blend.", url: "images/cheers.png" },
    		{ title: "Hot Drinks Anytime", description: "Find and enjoy our, hot drinks anytime.", url: "images/hot-drink.png" },
    		{ title: "Friend and Love", description: "Get more for your friends.Get Love.", url: "images/love-friend.png" },
    		{ title: "Wide range of choice", description: "Raise a cup of bold and spicy Jitterz Anniversary Blend.", url: "images/best-coffee.png" }
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
			var myOptions,
				mapObj = _mapObj,
				mapElem = _mapElem,
				pin,
				locations = [];

			_mapElem = mapElem; //Cache DOM element
                
			//TODO: Don't reinit entire map if already iniatlized in the app
			
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
			    
				mapObj = new google.maps.Map(mapElem, myOptions);
				_mapObj = mapObj; //Cache at app level
			    
			    

			    pin = [{
			    	position: latlng,
			    	title: "Your Location"
			    }];

			    _private.addMarkers(pin, mapObj);
			
		    
			// Get stores nearby
			_appData.getStarbucksLocations(position.coords.latitude, position.coords.longitude)
				.done(function(result){
					var len = result.length,
						pinImage = new google.maps.MarkerImage("../images/cofeeCup-sprite.png",
												   new google.maps.Size(49, 49),
												   new google.maps.Point(0, 202),
												   new google.maps.Point(0, 32));

						markerImage = new google.maps.MarkerImage('icons/coffeecupbutton.png');

					for (var i = 0; i < len; i++) {
                        locations.push({
							title: result[i].WalkInAddressDisplayStrings[0] + ", " + result[i].WalkInAddressDisplayStrings[1],
							position: new google.maps.LatLng(result[i].WalkInAddress.Coordinates.Latitude, result[i].WalkInAddress.Coordinates.Longitude),
							icon: pinImage,
							animation: google.maps.Animation.DROP
						});
					}

					_private.addMarkers(locations, mapObj);
				})
				.fail(function(error){
					alert("Error loading locations.");
				});
		},
		addMarkers: function(locations, mapObj){
            var marker,
    		currentMarkerIndex = 0;
    		function createMarker(index) {
    			if (index < locations.length){
    				var tmpLocation = locations[index];

    				marker = new google.maps.Marker({
    					position:tmpLocation.position,
    					map:mapObj,
    					title:tmpLocation.title,
    					icon: tmpLocation.icon,
    					shadow: tmpLocation.shadow,
    					animation: tmpLocation.animation
    				});
    			    oneMarkerAtTime();
                }
    		}
            
    		createMarker(0);
    		function oneMarkerAtTime() {
    			google.maps.event.addListener(marker, "animation_changed", function() {
    				if (marker.getAnimation() == null) {
    					createMarker(currentMarkerIndex+=1);
    				}
    			});
    		}
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
			if(isMap){
				$(_storeListElem).hide();
				$(_mapElem).show();
			}else{
				$(_storeListElem).show();
				$(_mapElem).hide();
			}
		}
	};
    
    cardsData.init();
    cardsData.cards.bind("change", writeIntoLocalStorage);
    _app = {
    	init: function() {
            console.log(window.localStorage.getItem("cards"));
            if(window.localStorage.getItem("cards")===null)
            {
                var cardData = new initialCardData(),
                initialCards = cardData.getInitialCardsData();
                localStorage.setItem("cards",initialCards);
            }  
        },
        announcementListViewTemplatesInit: function() {
            $announcementsEle.kendoMobileListView({
    			dataSource: kendo.data.DataSource.create({ data: _announcementData }),
    			template: $("#announcement-listview-template").html()
    		});
    	},
        
    	onAddCardViewShow: function () {
    		$('#cardNumberField').focus();
            var addCardViewModel = new AddCardViewModel();
    		kendo.bind($("#addCardView"), addCardViewModel);
    	},
        
            
    	rewardCardShow: function(e) {
            var bonusPoints = e.view.params.bonusPoints,
                cardNumber = e.view.params.cardNumber;
           
            var rewardsViewModel = new RewardsViewModel(cardNumber, bonusPoints);
            
            kendo.bind($("#rewardCard"), rewardsViewModel);
    	},
        
    	singleCardShow: function (arguments) {
        	var cardId = arguments.view.params.cardNumber;
        
            var singleCardViewModel = new SingleCardViewModel(cardId);
        	debugger;
            $("#singleCardView").on("click", ".singleCardDeleteButton", function(e){
            	debugger;
                alert('gg');
            });
            
            kendo.bind($("#singleCardView"), singleCardViewModel);
    	},
        storesInit: function(){
			_mapElem = document.getElementById("map");
			_storeListElem = document.getElementById("storeList");
			_tmplStoreList = kendo.template($("#tmplStoreListItem").html());


			$("#btnStoreViewToggle").data("kendoMobileButtonGroup")
				.bind("select", function(e){
				_private.toggleStoreView(e.sender.selectedIndex);
			})
		},
        
        storesShow: function() {
    		//Don't attempt to reload map/sb data if offline
            console.log("ONLINE", _isOnline);
    		if(_isOnline === false){				
    			alert("Please reconnect to the Internet to load locations.");
    
    			return;
    		}
    
    		_private.getLocation()
    			.done(function(position){ 
                    _private.initStoreList(position);
                    _private.initMap(position); 
    			})
    			.fail(function(error){ 
    				alert(error.message); /*TODO: Better handling*/ 
    			});
            
            if(_isOnline === true){
                $("#stores").show();
                $(".offline").hide();
            }else{
                $("#stores").hide();
                $(".offline").show();
            }
    	}
    
    }
    _app.init();
	$.extend(window, {
		cardsData: _app.cardsData,
		rewardCardShow: _app.rewardCardShow,
		singleCardShow: _app.singleCardShow,
		onAddCardViewShow: _app.onAddCardViewShow,
        announcementListViewTemplatesInit: _app.announcementListViewTemplatesInit,
        storezShow: _app.storesShow,
        storesInit: _app.storesInit, 
	});
}(jQuery, console, document));
