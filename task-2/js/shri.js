/**
 * Реализация API, не изменяйте ее
 * @param {string} url
 * @param {function} callback
 */
function getData(url, callback) {
    var RESPONSES = {
        '/countries': [
            {name: 'Cameroon', continent: 'Africa'},
            {name :'Fiji Islands', continent: 'Oceania'},
            {name: 'Guatemala', continent: 'North America'},
            {name: 'Japan', continent: 'Asia'},
            {name: 'Yugoslavia', continent: 'Europe'},
            {name: 'Tanzania', continent: 'Africa'}
        ],
        '/cities': [
            {name: 'Bamenda', country: 'Cameroon'},
            {name: 'Suva', country: 'Fiji Islands'},
            {name: 'Quetzaltenango', country: 'Guatemala'},
            {name: 'Osaka', country: 'Japan'},
            {name: 'Subotica', country: 'Yugoslavia'},
            {name: 'Zanzibar', country: 'Tanzania'},
        ],
        '/populations': [
            {count: 138000, name: 'Bamenda'},
            {count: 77366, name: 'Suva'},
            {count: 90801, name: 'Quetzaltenango'},
            {count: 2595674, name: 'Osaka'},
            {count: 100386, name: 'Subotica'},
            {count: 157634, name: 'Zanzibar'}
        ]
    };

    setTimeout(function () {
        var result = RESPONSES[url];
        if (!result) {
            return callback('Unknown url');
        }

        callback(null, result);
    }, Math.round(Math.random * 1000));
}

/**
 * Мои изменения ниже
 */
var requests = ['/countries', '/cities', '/populations'];
var responses = {};

/**
 * Получаем население по имени континента, страны или города
 * @param  {string} name
 */
function getPopulationByName(name) {
    var population = 0;
    var countries = [];
    var cities = [];

    countries = getCountriesByContinent(name);
    if (countries.length === 0) {
        countries.push(name);
    }

    cities = getCitiesByCountries(countries);
    if (cities.length === 0) {
        cities.push(name);
    }

    population = getPopulationByCities(cities);

    if (population > 0) {
        console.log('Population in ' + name + ':', population);
    } else {
        console.log('We haven\'t information about ' + name + '.');
    }
}

/**
 * Получаем список стран континента
 * @param  {string} continent
 * @return {array}
 */
function getCountriesByContinent(continent) {
    var countries = [];
    for (var i = 0; i < responses['/countries'].length; i++) {
        if (responses['/countries'][i].continent === continent) {
            countries.push(responses['/countries'][i].name);
        }
    }
    return countries;
}

/**
 * Получаем список городов страны
 * @param  {array} countries
 * @return {array}
 */
function getCitiesByCountries(countries) {
    var cities = [];
    for (var i = 0; i < responses['/cities'].length; i++) {
        for (var j = 0; j < countries.length; j++) {
            if (responses['/cities'][i].country === countries[j]) {
                cities.push(responses['/cities'][i].name);
            }
        }
    }
    return cities;
}

/**
 * Получаем население городов
 * @param  {array} cities
 * @return {integer}
 */
function getPopulationByCities(cities) {
    var population = 0;
    for (var i = 0; i < responses['/populations'].length; i++) {
        for (var j = 0; j < cities.length; j++) {
            if (responses['/populations'][i].name === cities[j]) {
                population += responses['/populations'][i].count;
            }
        }
    }
    return population;
}

/**
 * Я вынес диалог с пользователем в отдельную функцию, 
 * чтобы можно было вызывать его не перегружая страницы 
 * если это будет необходимо
 */
function askUser() {
    var name = window.prompt(
        'If you want to know population of some area, enter its name.',
        'Africa'
    );
    if (name !== null) {
        getPopulationByName(name);
    }
}

requests.forEach(function (request) {
    var callback = function (error, result) {
        if (error !== null) {
            console.log('Error in request:', error);
            return false;
        }

        responses[request] = result;

        if (Object.keys(responses).length === 3) {
            getPopulationByName('Africa');
            askUser();
        }
    };
    getData(request, callback);
});
