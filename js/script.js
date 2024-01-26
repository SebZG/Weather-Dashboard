$(document).ready(() => {
	// HTML ELements
	const todayTimeEl = $('#today-time');
	const todayEl = $('#today');
	const fiveDayEl = $('#forecast');
	const formEl = $('#search-form');
	const inputEl = $('#search-input');
	const historyEl = $('#history');

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

		let history = JSON.parse(localStorage.getItem('searchHistory')) || [];

		if (searchTerm) {
			history = Array.from(new Set([searchTerm, ...history])).slice(0, 7);
		}

		localStorage.setItem('searchHistory', JSON.stringify(history));

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
				const localDate = new Date(data.dt * 1000);
				const localDateString = dayjs(localDate).format('(DD/MM/YYYY)');

				const { name, weather, main, wind } = data;

				let iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

				// Display todays forecast
				todayEl.append(`
        <div id="today-card" class="card mx-lg-3">
          <div class="card-body">
            <h3 class="today-title card-title">${name} ${localDateString}
            <img class="today-icon" src=${iconUrl} alt=${
					weather[0].description
				} />
            </h3>
            <h5 class="today-desc card-subtitle mb-2">${
							weather[0].description
						}</h5>
            <p class="today-info card-text">Temp: ${Math.floor(
							main.temp - 273.15,
						)} &#8451</p>
            <p class="today-info card-text">Wind: ${wind.speed} KPH</p>
            <p class="today-info card-text">Humidity: ${main.humidity}%</p>
          </div>
        </div>
      `);

				const lat = data.coord.lat;
				const lon = data.coord.lon;

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
				for (let i = 7; i < list.length; i += 8) {
					const { dt_txt, weather, main, wind } = list[i];
					const date = dt_txt.split(' ')[0].replace(/\-/g, ' ');
					const revDate = reverseDate(date);
					const temp = main.temp;
					const celcius = temp - 273.15;
					let iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

					fiveDayEl.append(`
        <div id="fiveDay-card" class="card mb-2 mb-sm-2 mx-lg-3 text-center">
          <div class="card-body">
            <h3 class="fiveDay-title card-title">${revDate}</h3>
            <img class="fiveDay-icon" src=${iconUrl} alt=${
						weather[0].description
					} />
            <h5 class="fiveDay-desc card-subtitle mb-2">${
							weather[0].description
						}</h5>
            <p class="fiveDay-info card-text">Temp: ${Math.floor(
							celcius,
						)} &#8451</p>
            <p class="fiveDay-info card-text">Wind: ${wind.speed} KPH</p>
            <p class="fiveDay-info card-text">Humidity: ${main.humidity}%</p>
          </div>
					</div>
        `);
				}
			});
	};

	const loadDefaultCity = () => {
		const history = JSON.parse(localStorage.getItem('searchHistory')) || [];

		const lastSearchTerm = history[0];

		if (lastSearchTerm) {
			searchCity(null, lastSearchTerm);
		} else {
			searchCity(null, 'London');
		}
	};

	const renderHistory = () => {
		historyEl.empty();

		const history = JSON.parse(localStorage.getItem('searchHistory')) || [];

		history.forEach((term) => {
			const button = $('<button>')
				.text(term)
				.addClass('btn btn-secondary mr-2 mb-3 flex-grow-1');
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
