var viewModels = viewModels || {};

//Cards informations
// TODO: rename to cardsDataViewModel
var cardsData = kendo.observable({
	init: function() {
		var i;
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
	cards : [],
	_cardNumbers: {}
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
		alert('gg');
		var that = this;
		var cardNumberValue = $('#cardNumberField').val();
		var newCard = that._generateRandomCard(cardNumberValue);
                
		var positionAdded = cardsData.cards.push(newCard) - 1;
		cardsData.cardNumbers()[cardNumberValue] = positionAdded;
                
		app.navigate("views/cardsView.html");
            	
	},
        
	cardIdChanged: function(e) {

		var that = this, 
		cardForAddId = e.currentTarget.value,
		isValidCardNumber = that._checkIsValid(cardForAddId);
                
		that.set("canAddCard", isValidCardNumber);
	},
        
	_generateRandomCard: function(cardNumberValue) {
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
                
		return cardToAdd;
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

var cardsViewModelBase = kendo.data.ObservableObject.extend({
	init: function() {
		var that = this;
		kendo.data.ObservableObject.fn.init.apply(that, [that]);
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
        
	appendCardFadeEffect: function ($cardFront, $cardBack) {
		$cardFront.click(function(e) {
			console.log("clickFront");
			$(e.currentTarget).fadeOut(500, "linear", function() {
				$cardBack.fadeIn(500, "linear");
			});
            
		});
                
		$cardBack.click(function(e) {
			console.log("clickBack");
			$(e.currentTarget).fadeOut(500, "linear", function() {
				$cardFront.fadeIn(500, "linear");
			});
		});
	}
});    

var SingleCardViewModel = cardsViewModelBase.extend({
	barcodeUrl : "",
	cardId : "",
	cardAmount : "",
	currentDate : "",
	cardStatus: "",
        
	setValues: function(cardNumber, bonusPoints, cardAmount) {
		var that = this;
			
		if (bonusPoints < 50) {
			that.set("cardStatus", "silver");
		}
		else {
			that.set("cardStatus", "gold");
		}
            
		that.set("cardId", cardNumber);
		that.set("barcodeUrl", that._generateBarcodeUrl(cardNumber));
		that.set("cardId", "#" + cardNumber);
		that.set("cardAmount", kendo.toString(parseFloat(cardAmount), "c"));
		that.set("barcodeURL", bonusPoints);
		that.set("currentDate", kendo.toString(new Date(), "yyyy/MM/dd hh:mm tt"));
	},
        
	deleteCard: function() {
		var that = this, 
		cardIdString = that.cardId,
		cardIdLength = that.cardId.length,
		realCardId = cardIdString.substring(1, cardIdLength);

		that._processDeleteCard(realCardId);
            
		app.navigate('views/cardsView.html');
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

var RewardsViewModel = cardsViewModelBase.extend({
	_rewardsForCard : {
		gold : [
			{reward: "Free coffee every day"},
			{reward: "Free refill"},
			{reward: "Free cookies with every drink"}
		],
		silver : [
			{reward: "Free refill"},
			{reward: "Free cookies with every drink"}
            			
		]
	},
	cardStatus: "",
	rewards: [],
	bonusPoints: "",
	barcodeURL: "",
	currentDate: "",
	cardNumber: "",
    
	setValues: function(cardNumber, bonusPoints) {
		var that = this;			
		
        if (bonusPoints < 50) {
			that.set("cardStatus", "silver");
			that.set("rewards", that._rewardsForCard["silver"]);
		}
		else {
			that.set("cardStatus", "gold");
			that.set("rewards", that._rewardsForCard["gold"]);
		}
            
		var barcode = that._generateBarcodeUrl(cardNumber);
            
		that.set("cardNumber", "#" + cardNumber);
		that.set("bonusPoints", "Bonus:" + bonusPoints);
		that.set("barcodeURL", barcode);
		that.set("currentDate", kendo.toString(new Date(), "yyyy/MM/dd hh:mm tt"))
	}
});

window.singleCardViewModel = new SingleCardViewModel();
window.rewardsViewModel = new RewardsViewModel();
window.addCardViewModel = new AddCardViewModel();

//TODO: Do something with this function  
function writeIntoLocalStorage(e) {
	var dataToWrite = JSON.stringify(cardsData.cards);
	window.localStorage.setItem("cards", dataToWrite);
}