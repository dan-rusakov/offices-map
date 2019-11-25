'use strict';

(function(){

ymaps.ready(function(){

	var json = '[{"country": "Россия","city": "Москва","offices": [{"adress": "Таганская улица, 27","managerName": "Лягушкин Иван Сергеевич","phones": ["+7(999) 222-22-22", "+7(999) 222-22-22"],"emails": ["username@flagstudio.ru"]}, {"adress": "Усачёва улица, 11И","managerName": "Харитонов Василий Артемиевич","phones": ["+7(999) 222-22-22", "+7(999) 222-22-22"],"emails": ["username@flagstudio.ru", "info@flagstudio.ru"]}]}, {"country": "Россия","city": "Новосибирск","offices": [{"adress": "улица Максима Горького, 85","managerName": "Лягушкин Иван Сергеевич","phones": ["+7(999) 222-22-22"],"emails": ["username@flagstudio.ru", "info@flagstudio.ru"]}, {"adress": "улица Добролюбова, 201","managerName": "Харитонов Василий Артемиевич","phones": ["+7(999) 222-22-22"],"emails": ["username@flagstudio.ru", "info@flagstudio.ru"]}]}, {"country": "Россия","city": "Пермь","offices": [{"adress": "Комсомольский проспект, 37","managerName": "Панфилов Анатолий Сергеевич","phones": ["+7(999) 222-22-22", "+7(999) 222-22-22"],"emails": ["username@flagstudio.ru"]}]}, {"country": "Россия","city": "Иркутск","offices": [{"adress": "Верхняя набережная, 10","managerName": "Панфилов Анатолий Сергеевич","phones": ["+7(999) 222-22-22", "+7(999) 222-22-22"],"emails": ["username@flagstudio.ru"]}]}, {"country": "Россия","city": "Волгоград","offices": [{"adress": "Советская улица, 17","managerName": "Панфилов Анатолий Сергеевич","phones": ["+7(999) 222-22-22"],"emails": ["username@flagstudio.ru"]}]}, {"country": "Беларусь","city": "Минск","offices": [{"adress": "Комсомольская улица, 23","managerName": "Панфилов Анатолий Сергеевич","phones": ["+7(999) 222-22-22", "+7(999) 222-22-22"],"emails": ["username@flagstudio.ru"]}]}, {"country": "Беларусь","city": "Могилёв","offices": [{	"adress": "улица Крыленко, 10","managerName": "Панфилов Анатолий Сергеевич","phones": ["+7(999) 222-22-22"],"emails": ["username@flagstudio.ru"]}, {"adress": "улица Бонч-Бруевича, 6","managerName": "Харитонов Василий Артемиевич","phones": ["+7(999) 222-22-22"],"emails": ["username@flagstudio.ru", "info@flagstudio.ru"]}]}, {"country": "Беларусь","city": "Витебск","offices": [{"adress": "Московский проспект, 16","managerName": "Панфилов Анатолий Сергеевич","phones": ["+7(999) 222-22-22"],"emails": ["username@flagstudio.ru", "username@flagstudio.ru"]}]}, {"country": "Беларусь","city": "Гомель","offices": [{"adress": "улица Катунина, 6","managerName": "Панфилов Анатолий Сергеевич","phones": ["+7(999) 222-22-22"],"emails": ["username@flagstudio.ru"]}]},{"country": "Беларусь", "city": "Борисов", "offices": [{"adress": "Краснознамённая улица, 65","managerName": "Панфилов Анатолий Сергеевич","phones": ["+7(999) 222-22-22"],"emails": ["username@flagstudio.ru"]}]}]';
	var data = JSON.parse(json);
	var cityTemplate = document.querySelector('.city-template').content;
	var officeTemplate = document.querySelector('.office-template').content;
	var currentAdresses = '';
	var myMap = new ymaps.Map("map", {
		center: [55.76, 37.64],
		zoom: 7
	}); 
	var MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
		'<div class="balloon-box">' +
			'<p class="balloon-box__office">$[properties.balloonOffice]</p>' +
			'<p class="balloon-box__manager-name">$[properties.balloonManagerName]</p>' +
			'<div class="balloon-box__phones-list">$[properties.balloonPhone]</div>' +
			'<div class="balloon-box__emails-list">$[properties.balloonEmail]</div>' +
		'</div>'
	);

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

				var emailElement = document.createElement('p');
				emailElement.className = 'city__email';
				emailElement.textContent = item;
				officeElement.querySelector('.city__emails-list').appendChild(emailElement);

			});

			fragment.appendChild(officeElement);

		});

		return fragment;

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
			evt.currentTarget.classList.toggle('active');
		}

	};

	function renderBounds(coords){

		myMap.geoObjects.removeAll();

		var clusterIcons = [{
			href: 'img/clusterIcon.svg',
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
					iconImageHref: 'img/singleIcon.svg',
        	iconImageSize: [24, 24],
					iconImageOffset: [-12, -12]

				});

				clusterer.add(placemark);
				myMap.setBounds(clusterer.getBounds());

				var objectState = clusterer.getObjectState(geoObjects[2]);
    if (objectState.isClustered) {

        objectState.cluster.state.set('activeObject', geoObjects[2]);
				clusterer.balloon.open(objectState.cluster);
				
    } else if (objectState.isShown) {

				geoObjects[2].balloon.open();
				
    }

			});

		};
		
		myMap.geoObjects.add(clusterer);

		

	};renderBounds(currentAdresses);

	function getOfficeData(adress){

		var currentData = adress.split(", ");
		var CurrentCity = currentData[1];
		var CurrentOffice = currentData[2] + ', ' + currentData[3];

		currentData = data.filter(function(item){
			return item.city == CurrentCity;
		});

		currentData = currentData[0].offices.filter(function(item){
			return item.adress == CurrentOffice;
		});

		return currentData[0];

	}

	function addContactInfo(arr, infoType){
		
		var contactArr = '';

		arr.forEach(function(item, i){
			contactArr += '<p class="balloon-box__'+infoType+'">' + item + '</p>';
		});

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
			myMap.setCenter(targetObject.geometry.getCoordinates(), myMap.getZoom(), {
				checkZoomRange: true
			});
		}
	};

	function openSidebarCity(city){

		var citiesList = document.querySelectorAll('.city__name');
		for(var i = 0; i < citiesList.length; i++){
			if(citiesList[i].textContent == city){
				citiesList[i].parentNode.classList.add('active');
			}
		}

	}			

});

})();
