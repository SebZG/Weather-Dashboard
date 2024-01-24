const todayTime = dayjs().format('(dd/mm/yyyy)');

const todayEl = $('#today');
const forecastEl = $('#forecast');
const historyEl = $('#history');
const searchBtn = $('#search-button');

let lat;
let lon;
let searchTerm = $('#search-input').val();

const API_KEY = '0e780f9d810b18eee750098926ce4384';

let forecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}.`;
let today = `https://api.openweathermap.org/data/2.5/weather?q=${searchTerm}&appid=${API_KEY}`;
