

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
    //Cards informations
    	// TODO: rename to cardsDataViewModel
    	cardsData = kendo.observable({
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
     
    var SingleCardViewModel = cardsViewModelBase.extend({
        
        barcodeUrl : "",
		cardId : "",
		cardAmount : "",
		currentDate : "",
        
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

        //TODO: Do something with this function  
    	function writeIntoLocalStorage(e) {
    		var dataToWrite = JSON.stringify(cardsData.cards);
    		window.localStorage.setItem("cards", dataToWrite);
    	}