'use strict';

(function(){

ymaps.ready(function(){

	var getJson = function(onSuccess) {

		var xhr = new XMLHttpRequest();
		xhr.responseType = 'json';
		xhr.open('GET', '../data.json');

		xhr.addEventListener('load', function(){

			onSuccess(xhr.response); 

		});
		xhr.send();

	};
	var cityTemplate = document.querySelector('.city-template').content;
	var officeTemplate = document.querySelector('.office-template').content;
	var countryBtnTemplate = document.querySelector('.country-btn-template').content;
	var currentAdresses = '';
	var myMap = new ymaps.Map("map", {
		center: [55.76, 37.64],
		zoom: 7,
		controls: []
	}, {suppressMapOpenBlock: true}); 
	var MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
		'<div class="balloon-box">' +
			'<p class="balloon-box__office">$[properties.balloonOffice]</p>' +
			'<p class="balloon-box__manager-name">$[properties.balloonManagerName]</p>' +
			'<div class="balloon-box__phones-list">$[properties.balloonPhone]</div>' +
			'<div class="balloon-box__emails-list">$[properties.balloonEmail]</div>' +
			'<svg  class="icon balloon-box__close" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><polygon points="16 1.6 14.4 0 8 6.4 1.6 0 0 1.6 6.4 8 0 14.4 1.6 16 8 9.6 14.4 16 16 14.4 9.6 8" fill="#fff"/></svg>' +
		'</div>', { 
			build: function () {
					this.constructor.superclass.build.call(this);

					this.$element = $(this.getParentElement()).find('.balloon-box');
					//this._applyElementOffset();

					this.$element
							.find('.balloon-box__close')
							.on('click', $.proxy(this._onCloseButtonClick, this));
			},
			clear: function () {
					this.$element
							.find('.balloon-box__close')
							.off('click');

					this.constructor.superclass.clear.call(this);
			},
			_onCloseButtonClick: function (e) {
					e.preventDefault();

					this.events.fire("userclose");
			}}
	);

	getJson(function(data){

	function getCountiesArr(data){
		var countiesArr = [];
    data.forEach(function(item, pos) {
			if(pos > 0){
				if(countiesArr.indexOf(item.country) == -1){
					countiesArr.push(item.country);
				} 
			} else {
				countiesArr.push(item.country);
			}
    });
		return countiesArr;
	};

	

	function displayCountiesBtn(){

		var fragment = document.createDocumentFragment();
		var countiesArr = getCountiesArr(data);

		countiesArr.forEach(function(item, i){
			
			var btnElement = countryBtnTemplate.cloneNode(true);

			if (i == 0){ 
				btnElement.querySelector('.sidebar__country-input').checked = true; 
			}

			btnElement.querySelector('.sidebar__country-input').id = item;
			btnElement.querySelector('.sidebar__btn').htmlFor = item;
			btnElement.querySelector('.sidebar__btn').dataset.country = item;
			btnElement.querySelector('.sidebar__btn-text').textContent = item;

			fragment.appendChild(btnElement);

		});

		var btnBox = document.querySelector('.sidebar__btn-box');
		btnBox.appendChild(fragment);

	};displayCountiesBtn();

	function displayData(data, country){

		var newData = data.filter(function(item){
			return item.country == country;
		});

		currentAdresses = newData.map(function(item){
			return item.offices.map(function(office){
				return item.city + ', ' + office.adress;
			});
		});

		currentAdresses = currentAdresses.reduce(function(oldArr, currArr){
			return oldArr = oldArr.concat(currArr);
		});

		var fragment = document.createDocumentFragment();

		newData.forEach(function(item, i){

			var cityElement = cityTemplate.cloneNode(true);

			cityElement.querySelector('.city__name').textContent = item.city;
			cityElement.querySelector('.city__offices-box').appendChild(displayOffices(item));

			fragment.appendChild(cityElement);

		});

		var citiesList = document.querySelector('.sidebar__cities-list');
		while (citiesList.firstChild) {
			citiesList.removeChild(citiesList.firstChild);
		}
		citiesList.appendChild(fragment);
		addCitiesListeners();
		addOfficesListeners();

	};displayData(data, 'Россия');

	function displayOffices(city){

		var fragment = document.createDocumentFragment();

		city.offices.forEach(function(item, i){

			var officeElement = officeTemplate.cloneNode(true);

			officeElement.querySelector('.city__office-name').textContent = 'Офис ' + item.adress.toUpperCase();
			officeElement.querySelector('.city__manager-name').textContent = item.managerName;

			item.phones.forEach(function(item, i){

				var phoneElement = document.createElement('p');
				phoneElement.className = 'city__phone';
				phoneElement.textContent = item;
				officeElement.querySelector('.city__phones-list').appendChild(phoneElement);

			});

			item.emails.forEach(function(item, i){

				var emailElement = document.createElement('a');
				emailElement.className = 'city__email';
				emailElement.textContent = item;
				emailElement.href = 'mailto:' + item;
				officeElement.querySelector('.city__emails-list').appendChild(emailElement);

			});

			fragment.appendChild(officeElement);

		});

		return fragment;

	}

	function addOfficesListeners(){

		var sidebarOffice = document.querySelectorAll('.city__office-name');

		for(var i = 0; i < sidebarOffice.length; i++){

			sidebarOffice[i].addEventListener('click', sidebarOfficeHandler);
			sidebarOffice[i].addEventListener('keydown', function(evt){
				if (evt.keyCode === 13){ 
					sidebarOfficeHandler(evt); 
				};
			});

		}

		function sidebarOfficeHandler(evt){

			var cityOfOffice = evt.target.closest('.city').querySelector('.city__name').textContent;
			var fullAdress = cityOfOffice + ',' + evt.target.textContent.slice(4);

			ymaps.geocode(fullAdress)
			.then(function (res) {
					myMap.panTo(res.geoObjects.get(0).geometry.getCoordinates())
					//myMap.balloon.open(res.geoObjects.get(0).geometry.getCoordinates())
			});
		
		}

	}

	var sidebarBtn = document.querySelectorAll('.sidebar__btn');

	for(var i = 0; i < sidebarBtn.length; i++){

		sidebarBtn[i].addEventListener('click', sidebarBtnHandler);
		sidebarBtn[i].addEventListener('keydown', function(evt){
			if (evt.keyCode === 13){ 
				sidebarBtnHandler(evt); 
			};
		});

	}

	function sidebarBtnHandler(evt){

		evt.currentTarget.classList.toggle('active');
		displayData(data, evt.currentTarget.dataset.country);
		renderBounds(currentAdresses);

	}

	function addCitiesListeners(){

		var cityHeader = document.querySelectorAll('.city__header');

		for(var i = 0; i < cityHeader.length; i++){

			cityHeader[i].addEventListener('click', cityHeaderHandler);
			cityHeader[i].addEventListener('keydown', function(evt){
				if (evt.keyCode === 13){ 
					cityHeaderHandler(evt); 
				};
			});

			
		}

		function cityHeaderHandler(evt){
			var currentItem = evt.currentTarget;
			currentItem.classList.toggle('active');
			if(currentItem.classList.contains('active')){
				currentItem.nextElementSibling.style.maxHeight = currentItem.nextElementSibling.scrollHeight + 'px';
			} else {
				currentItem.nextElementSibling.style.maxHeight = '0px';
			}
		}

	};

	function renderBounds(coords){

		myMap.geoObjects.removeAll();

		var clusterIcons = [{
			href: '../img/clusterIcon.svg',
			size: [40, 40],
			offset: [-20, -20]
		}];

		var MyIconContentLayout = ymaps.templateLayoutFactory.createClass('<div style="color: #FFFFFF; font-weight: bold;">{{ properties.geoObjects.length }}</div>');

		var clusterer = new ymaps.Clusterer({
			clusterIcons: clusterIcons,
      clusterIconContentLayout: MyIconContentLayout,
			groupByCoordinates: false,
			gridSize: 80,
			clusterDisableClickZoom: false,
		});

		for(var i = 0; i < coords.length; i++){

			var geocoder = ymaps.geocode(coords[i]);
			
	
			geocoder.then(function(res){

				var officeData = getOfficeData(res.geoObjects.get(0).properties.get('text'));
					
				var coordinates = res.geoObjects.get(0).geometry.getCoordinates();
				
				window.placemark = new ymaps.Placemark(coordinates,{

					balloonOffice: 'Офис ' + officeData.adress,
					balloonManagerName: officeData.managerName,
					balloonPhone: addContactInfo(officeData.phones, 'phone'),
					balloonEmail: addContactInfo(officeData.emails, 'email'),

				},{

					balloonShadow: false,
          balloonLayout: MyBalloonContentLayout,
					balloonPanelMaxMapArea: 0,
					balloonMaxWidth: 800,
					iconLayout: 'default#imageWithContent',
					hideIconOnBalloonOpen: false,
					iconImageHref: '../img/singleIcon.svg',
        	iconImageSize: [24, 24],
					iconImageOffset: [-12, -12]

				});

				clusterer.add(placemark);
				
				myMap.setBounds(clusterer.getBounds());

			});

		};

		
		myMap.geoObjects.add(clusterer);

	};renderBounds(currentAdresses);

	function getOfficeData(adress){

		var currentData = adress.split(", ");
		var CurrentCity = currentData[currentData.length - 3];
		var CurrentOffice = currentData[currentData.length - 2] + ', ' + currentData[currentData.length - 1];

		currentData = data.filter(function(item){
			return item.city.toLowerCase() == CurrentCity.toLowerCase();
		});

		currentData = currentData[0].offices.filter(function(item){
			return item.adress.toLowerCase() == CurrentOffice.toLowerCase();
		});

		

		return currentData[0];

	}

	function addContactInfo(arr, infoType){
		
		var contactArr = '';

		if (infoType == 'phone'){
			arr.forEach(function(item, i){
				contactArr += '<p class="balloon-box__'+infoType+'">' + item + '</p>';
			});
		} else if (infoType == 'email') {
			arr.forEach(function(item, i){
				contactArr += '<a class="balloon-box__'+infoType+'" href="mailto:' + item + '">' + item + '</a>';
			});
		}

		

		return contactArr;

	}

	myMap.geoObjects.events.add('click', setBoundCentered);	

	function setBoundCentered(evt) {
		var targetObject = evt.get('target');

		ymaps.geocode(targetObject.geometry.getCoordinates(),{}).then(function(res){

			var cityOfOffice = res.geoObjects.get(0).getLocalities();
			openSidebarCity(cityOfOffice);

		});


		if (targetObject.geometry.getType() === 'Point') {
			myMap.panTo(targetObject.geometry.getCoordinates(), myMap.getZoom(), {
				checkZoomRange: true
			});
		}
	};

	function openSidebarCity(city){

		var citiesList = document.querySelectorAll('.city__name');
		for(var i = 0; i < citiesList.length; i++){
			if(citiesList[i].textContent == city){
				citiesList[i].parentNode.classList.add('active');
				citiesList[i].parentNode.nextElementSibling.style.maxHeight = citiesList[i].parentNode.nextElementSibling.scrollHeight + 'px';
			}
		}

	}		
	
});

});

})();
