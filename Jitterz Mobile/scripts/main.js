document.addEventListener("deviceready", onDeviceReady, false);

// Apache Cordova is ready
function onDeviceReady() {
}

(function($) {
    var mapElem,
        cachedLocations = [];
	
    //STORES VIEW
    function getPosition(handler) {
		navigator.geolocation.getCurrentPosition(handler, onGeolocationError, { enableHighAccuracy: true });
	}
    
	function getLocations(position, handler) {
		$.getJSON("http://www.starbucks.com/api/location.ashx?&features=&lat=" + position.coords.latitude + "&long=" + position.coords.longitude + "&limit=10",
				  function(data) {
					  var locations = [];
					  $.each(data, function() {
						  locations.push(
							  {
							  address: this.WalkInAddressDisplayStrings[0] + ", " + this.WalkInAddressDisplayStrings[1], 
							  latlng: new google.maps.LatLng(this.WalkInAddress.Coordinates.Latitude, this.WalkInAddress.Coordinates.Longitude)
						  });                
					  });
					  handler(locations);
				  }).error(function(error) {
					  alert(error.message);
				  });
	}
    
	function storesShow(e) {
		$("#storesNavigate").kendoMobileButtonGroup({
			select: function() {
				if (this.selectedIndex == 0) {
					$("#storeswrap").hide();
					$("#mapwrap").show();
					google.maps.event.trigger(map, "resize");
				}
				else if (this.selectedIndex == 1) {
					$("#mapwrap").hide();
					$("#storeswrap").show();
				}
			},
			index: 0
		});
        
		var iteration = function() {
			getPosition(function(position) {
				// Use Google API to get the location data for the current coordinates
				var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                
				var myOptions = {
					zoom: 12,
					center: latlng,
					mapTypeControl: false,
					navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL },
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};
				mapElem = new google.maps.Map(document.getElementById("map"), myOptions);
				var marker = new google.maps.Marker({
					position: latlng,
					map: mapElem,
					title: "Your Location",
					zIndex:google.maps.Marker.MAX_ZINDEX
				});
            
				if (cachedLocations.length > 0) {
					setStiresViews(cachedLocations);
				}
				else {
                	
					getLocations(position, function(locations) {
						cachedLocations = locations;
						setStiresViews(locations);
					});
				}
			});
		};
		iteration();
	}
    
    function onGeolocationError(error) {
		alert(error.message);
	}
    
	function setStiresViews(locations) {
		var pimImage = new google.maps.MarkerImage("../images/cofeeCup-sprite.png",
												   new google.maps.Size(49, 49),
												   new google.maps.Point(0, 202),
												   new google.maps.Point(0, 32));
        
		var marker,
		currentMarkerIndex = 0;
		function createMarker(index) {
			if (index < locations.length)
				marker = new google.maps.Marker({
					map: mapElem,
					animation: google.maps.Animation.DROP,
					position: locations[index].latlng,
					title: locations[index].address.replace(/(&nbsp)/g, " "),
					icon: pimImage
				});
			oneMarkerAtTime();
		}
        
		createMarker(0);
		function oneMarkerAtTime() {
			google.maps.event.addListener(marker, "animation_changed", function() {
				if (marker.getAnimation() == null) {
					createMarker(currentMarkerIndex+=1);
				}
			});
		}
    	
		$("#stores-listview").kendoMobileListView({
			dataSource: kendo.data.DataSource.create({ data: locations}),
			template: $("#stores-listview-template").html()
		});
	}
    

	var announcementData = [
		{ title: "Holiday Drinks Are Here", description: "Enjoy your favorite holiday drinks, like Pumpkin Spice Lattes.", url: "images/holiday.png" },
		{ title: "Register & Get Free Drinks", description: "Register any Jitterz card and start earning rewards like free drinks. Sign-up now.", url: "images/rewards.png" },
		{ title: "Cheers to Another Year", description: "Raise a cup of bold and spicy Jitterz Anniversary Blend.", url: "images/cheers.png" },
		{ title: "Hot Drinks Anytime", description: "Find and enjoy our, hot drinks anytime.", url: "images/hot-drink.png" },
		{ title: "Friend and Love", description: "Get more for your friends.Get Love.", url: "images/love-friend.png" },
		{ title: "Wide range of choice", description: "Raise a cup of bold and spicy Jitterz Anniversary Blend.", url: "images/best-coffee.png" }
	];
    
	function announcementListViewTemplatesInit() {
		console.log(announcementData);
        $("#announcements-listview").kendoMobileListView({
			dataSource: kendo.data.DataSource.create({ data: announcementData }),
			template: $("#announcement-listview-template").html()
		});
	}
    
	//Cards informations
	// TODO: rename to cardsDataViewModel
	var cardsData = kendo.observable({
		init:function() {
			var i;
			this._cardNumbers = {};
			var cards = [];
			if (window.localStorage.getItem("cards") !== null) {
				cards = JSON.parse(window.localStorage.getItem("cards"));
			}
			for (i = 0; i < cards.length; i+=1) {
				this._cardNumbers[cards[i].cardNumber] = i;
			}
			cardsData.set("cards", cards);
		},
		cardNumbers: function(value) {
			if (value) {
				this._cardNumbers = value;
			}
			else {
				return this._cardNumbers;
			}
		},
		cards : []
	});
    
	function writeIntoLocalStorage(e) {
		var dataToWrite = JSON.stringify(cardsData.cards);
		window.localStorage.setItem("cards", dataToWrite);
	}
    
    var cardsViewModelBase = kendo.data.ObservableObject.extend({
        init: function() {
            kendo.data.ObservableObject.fn.init.apply(this, [this]);
        },
        _generateBarcodeUrl: function(cardId) {
			var size = "130",
			urlSizeParameter = "chs=" + size + "x" + size,
			urlQrParameter = "cht=qr",
			urlDataParameter = "chl=" + cardId,
			urlBase = "https://chart.googleapis.com/chart?",
			imageRequestString = urlBase + urlSizeParameter + "&" + urlQrParameter + "&" + urlDataParameter; 
            
			return imageRequestString;
		},
        _appendCardFadeEffect: function ($cardFront, $cardBack) {
    		$cardFront.click(function(e) {
    			$(e.currentTarget).fadeOut(500, "linear", function() {
    				$cardBack.fadeIn(500, "linear");
    			});
        
    		});
            
    		$cardBack.click(function(e) {
    			$(e.currentTarget).fadeOut(500, "linear", function() {
    				$cardFront.fadeIn(500, "linear");
    			});
    		});
    	}
    });
    
	var SingleCardViewModel = cardsViewModelBase.extend({
        init: function(cardId) {
            var that = this;
            that.cardId = cardId;
            cardsViewModelBase.fn.init.apply(this);
            that.setValues();
            var $cardFront = $("#cardFront"),
		    $cardBack = $("#cardBack");
    	
		    that._appendCardFadeEffect($cardFront, $cardBack);
        },
		setValues: function() {
			var that = this,
			cardPosition = cardsData.cardNumbers()[that.cardId],
			currentCard = cardsData.cards[cardPosition];
			if (currentCard.bonusPoints < 50) {
				$("#cardFront").removeClass("gold").addClass("silver");
				$("#cardBack").removeClass("gold").addClass("silver");
			}
			else {
				$("#cardFront").removeClass("silver").addClass("gold");
				$("#cardBack").removeClass("silver").addClass("gold");
			}
			that.set("barcodeUrl", that._generateBarcodeUrl(that.cardId));
			that.set("cardId", "#" + that.cardId);
			that.set("cardAmount", kendo.toString(currentCard.amount, "c"));
			that.set("barcodeURL", currentCard.bonusPoints);
			that.set("currentDate", kendo.toString(new Date(), "yyyy/MM/dd hh:mm tt"));
		},
		barcodeUrl : "",
		cardId : "",
		cardAmount : "",
		bonusPoints : "",
		currentDate : "",
        
		deleteCard: function() {
			var that = this, 
			cardIdString = that.cardId,
			cardIdLength = that.cardId.length,
			realCardId = cardIdString.substring(1, cardIdLength);
            
			that._processDeleteCard(realCardId);
            
			app.navigate('#cardsView');
		},
        
		_processDeleteCard: function(cardId) {
			var allCardsArray = cardsData.cards;
    
			for (var i = -1, len = allCardsArray.length; ++i < len;) {
				if (allCardsArray[i].cardNumber === cardId) {
					allCardsArray.splice(i, 1);
					delete cardsData.cardNumbers()[cardId];
					break;
				}
			} 
		}
	});
    
	/*------------------- Rewards ----------------------*/
	var rewardCards = {
		gold : {
			imageURLFront:"http://www.arbolcrafts.co.uk/images/gold%20card%20blanks.jpg",
			imageURLBack:"http://www.arbolcrafts.co.uk/images/gold%20card%20blanks.jpg",
			rewards:[
				{reward:"Free coffee every day"},
				{reward:"Free refill"},
				{reward:"Free cookies with every drink"}
			]
		},
		silver:{
			imageURLFront:"http://originalgiftsforwoman.com/wp-content/uploads/2012/02/prepaid-gift-cards.s600x600-300x190.jpg",
			imageURLBack:"http://originalgiftsforwoman.com/wp-content/uploads/2012/02/prepaid-gift-cards.s600x600-300x190.jpg",
			rewards:[
				{reward:"Free refill"},
				{reward:"Free cookies with every drink"}
			]
		}
	};
    
	var RewardsViewModel = cardsViewModelBase.extend({
		init: function(cardNumber, bonusPoints) {
            var that = this;
            that.cardNumber = cardNumber;
            cardsViewModelBase.fn.init.apply(this);
                    
            var $rewardCardFront = $("#rewardCardFront"),
    		    $rewardCardBack = $("#rewardCardBack");
            
		    that._appendCardFadeEffect($rewardCardBack, $rewardCardFront);
            that._setBonusPoints(cardNumber, bonusPoints);
        },
        rewards: [],
		bonusPoints:"",
		barcodeURL:"",
		currentDate:"",
		cardNumber:"",
		_setBonusPoints: function(cardNumber, bonusPoints) {
			var that = this;
			    currentCard = null,
			barcode = that._generateBarcodeUrl(cardNumber);
			that.set("cardNumber", "#" + cardNumber);
			that.set("bonusPoints", "Bonus:" + bonusPoints);
			if (bonusPoints < 50) {
				currentCard = rewardCards["silver"];
				$("#rewardCardFront").removeClass("gold").addClass("silver");
				$("#rewardCardBack").removeClass("gold").addClass("silver");
			}
			else {
				currentCard = rewardCards["gold"];
				$("#rewardCardFront").removeClass("silver").addClass("gold");
				$("#rewardCardBack").removeClass("silver").addClass("gold");
			}
			that.set("rewards", currentCard.rewards);
			that.set("barcodeURL", barcode);
			that.set("currentDate", kendo.toString(new Date(), "yyyy/MM/dd hh:mm tt"))
		}
	});
    
	/*Add card view model*/
	var AddCardViewModel = kendo.data.ObservableObject.extend({
		cardNumber: null,
		canAddCard: false,
		init: function() {
            kendo.data.ObservableObject.fn.init.apply(this, [this]);
            
            var that = this;
			that.set("canAddCard", false);
			that.set("cardNumber", null);
        },
		addNewCard: function() {
			var cardNumberValue = $('#cardNumberField').val();
            
			var currentAmount = Math.floor((Math.random() * 100) + 10),
			bonusPoints = Math.floor(Math.random() * 100),
			currentDate = new Date(),    
			expireDate = currentDate.setFullYear(currentDate.getFullYear() + 2);
            
			var cardToAdd = {
				cardNumber : cardNumberValue,
				amount: currentAmount,
				bonusPoints: bonusPoints,
				expireDate: kendo.toString(expireDate, "yyyy/MM/dd")
			}
            
			var positionAdded = cardsData.cards.push(cardToAdd) - 1;
			cardsData.cardNumbers()[cardNumberValue] = positionAdded;
            
			console.log(app);
			app.navigate("#cardsView");
        	
		},
		cardIdChanged: function(e) {
			var that = this, 
			cardForAddId = e.currentTarget.value,
			isValidCardNumber = that._checkIsValid(cardForAddId);
            
			that.set("canAddCard", isValidCardNumber);
		},
		_checkIsValid: function(typedCardId) {
			var that = this;
            
			return that._validateCardNumber(typedCardId) && !that._isDublicateNumber(typedCardId);
		},
		_validateCardNumber: function(cardNumberValue) {
			var validateNumberRegex = /^[0-9]{9}$/;
			var isValidCardNumber = validateNumberRegex.test(cardNumberValue);
            
			return isValidCardNumber;
		},
		_isDublicateNumber: function (cardNumberValue) {
			var isDublicate = cardsData.cardNumbers().hasOwnProperty(cardNumberValue);
			return isDublicate;
		}
	});
    
    
	function onAddCardViewShow() {
		$('#cardNumberField').focus();
        var addCardViewModel = new AddCardViewModel();
		kendo.bind($("#addCardView"), addCardViewModel);
	}
    
        
	function rewardCardShow(e) {
        var bonusPoints = e.view.params.bonusPoints,
            cardNumber = e.view.params.cardNumber;
       
        var rewardsViewModel = new RewardsViewModel(cardNumber, bonusPoints);
        
        kendo.bind($("#rewardCard"), rewardsViewModel);
	}
    
	function singleCardShow(arguments) {
    	var cardId = arguments.view.params.cardNumber;
    
        var singleCardViewModel = new SingleCardViewModel(cardId);
    	  
        kendo.bind($("#singleCardView"), singleCardViewModel);
	}
    
	cardsData.init();
	cardsData.cards.bind("change", writeIntoLocalStorage);
    
	$.extend(window, {
		cardsData: cardsData,
		rewardCardShow: rewardCardShow,
		singleCardShow: singleCardShow,
		onAddCardViewShow: onAddCardViewShow,
        announcementListViewTemplatesInit: announcementListViewTemplatesInit,
        storesShow: storesShow
	});
}(jQuery));
