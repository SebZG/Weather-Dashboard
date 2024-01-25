$(document).ready(() => {
	// HTML ELements
	const todayTimeEl = $('#today-time');
	const todayEl = $('#today');
	const fiveDayEl = $('#forecast');
	const formEl = $('#search-form');
	const inputEl = $('#search-input');
	const historyEl = $('#history');

	// Update the current time
	const updateCurrentTime = () => {
		const localTime = new Date();
		const currentTime = dayjs(localTime).format('hh:mm:ss A');
		todayTimeEl.text(currentTime);
	};

	updateCurrentTime();

	setInterval(updateCurrentTime, 1000);

	const API_KEY = '0e780f9d810b18eee750098926ce4384';

	const searchCity = (e, searchTerm) => {
		if (e) {
			e.preventDefault();
		}

		// Retrieve existing history from local storage
		let history = JSON.parse(localStorage.getItem('searchHistory')) || [];

		// Add new search term to history
		if (searchTerm) {
			history.unshift(searchTerm);
			history = [...new Set(history)];
			history = history.slice(0, 7);
		}

		// Save updated history to local storage
		localStorage.setItem('searchHistory', JSON.stringify(history));

		// Update the history UI
		renderHistory();

		todayEl.empty();
		fiveDayEl.empty();

		searchTerm = searchTerm || inputEl.val() || 'London';

		let today = `https://api.openweathermap.org/data/2.5/weather?q=${searchTerm}&appid=${API_KEY}`;

		// Fetch today's forecast
		fetch(today)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				// Grab local time from API
				const localTime = data.dt;
				const localDate = new Date(localTime * 1000);

				// Format local date
				const localDateString = dayjs(localDate).format('(DD/MM/YYYY)');

				// Grab lat and lon for five day forecast
				const lat = data.coord.lat;
				const lon = data.coord.lon;

				// Grab today's weather info
				const name = data.name;
				const desc = data.weather[0].description;
				const icon = data.weather[0].icon;
				const temp = data.main.temp;
				const celcius = temp - 273.15;
				const windSpeed = data.wind.speed;
				const humidity = data.main.humidity;
				let iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

				// Display todays forecast
				todayEl.append(`
        <div id="today-card" class="card mx-lg-3">
          <div class="card-body">
            <h3 class="today-title card-title">${name} ${localDateString}
            <img class="today-icon" src=${iconUrl} alt=${desc} />
            </h3>
            <h5 class="today-desc card-subtitle mb-2">${desc}</h5>
            <p class="today-info card-text">Temp: ${Math.floor(
							celcius,
						)} &#8451</p>
            <p class="today-info card-text">Wind: ${windSpeed} KPH</p>
            <p class="today-info card-text">Humidity: ${humidity}%</p>
          </div>
        </div>
      `);

				let forecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

				// Fetch five day forecast
				return fetch(forecast);
			})
			.then((response) => {
				return response.json();
			})
			.then((forecastData) => {
				// Grab five day forecast array
				const list = forecastData.list;

				// Display five day forecast
				for (let i = 8; i < list.length; i += 8) {
					const date = list[i].dt_txt.split(' ')[0].replace(/\-/g, ' ');
					const revDate = reverseDate(date);
					const icon = list[i].weather[0].icon;
					const desc = list[i].weather[0].description;
					const temp = list[i].main.temp;
					const celcius = temp - 273.15;
					const windSpeed = list[i].wind.speed;
					const humidity = list[i].main.humidity;
					let iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
					fiveDayEl.append(`
        <div id="fiveDay-card" class="card mb-2 mb-sm-2 mx-lg-3">
          <div class="card-body">
            <h3 class="fiveDay-title card-title">${revDate}</h3>
            <img class="fiveDay-icon" src=${iconUrl} alt=${desc} />
            <h5 class="fiveDay-desc card-subtitle mb-2">${desc}</h5>
            <p class="fiveDay-info card-text">Temp: ${Math.floor(
							celcius,
						)} &#8451</p>
            <p class="fiveDay-info card-text">Wind: ${windSpeed} KPH</p>
            <p class="fiveDay-info card-text">Humidity: ${humidity}%</p>
          </div>
					</div>
        `);
				}
			});
	};

	const loadDefaultCity = () => {
		searchCity(null, 'London');
	};

	const renderHistory = () => {
		historyEl.empty();

		const history = JSON.parse(localStorage.getItem('searchHistory')) || [];

		history.forEach((term) => {
			const button = $('<button>')
				.text(term)
				.addClass('btn btn-secondary mr-2 mb-3');
			button.on('click', () => searchCity(null, term));
			historyEl.append(button);
		});
	};

	const reverseDate = (date) => date.split(' ').reverse().join('/');

	formEl.on('submit', (e) => {
		e.preventDefault();

		searchCity(null, inputEl.val());
	});

	loadDefaultCity();
	renderHistory();
});
