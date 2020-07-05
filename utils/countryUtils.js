const stringUtils = require('./stringUtils');
const countryData = require('./countries');


const transformNull = (object) => {
	if (typeof object === 'object') {
		Object.entries(object).forEach((entry) => entry[0] !== 'countryInfo' && (object[entry[0]] = entry[1] === null ? 0 : transformNull(entry[1])));
	}
	// eslint-disable-next-line no-return-assign
	return object;
};

const getCountryCode = (countryName) => countryData.find(country => country.country.toLowerCase() === countryName.toLowerCase()).iso2;


const getCountryName = (countryCode) => countryData.find(country => country.iso2.toLowerCase() === countryCode.toLowerCase()).country;


const getCountryData = (countryNameParam) => {
	const countryName = stringUtils.wordsStandardize(countryNameParam);
	const nullReturn = { _id: null, country: null, iso2: null, iso3: null, lat: 0, long: 0, flag: 'https://disease.sh/assets/img/flags/unknown.png' };
	const countryFound = countryData.find(item => (stringUtils.wordsStandardize(item.country) === countryName
		|| stringUtils.wordsStandardize(item.iso2) === countryName
		|| stringUtils.wordsStandardize(item.iso3) === countryName
		|| item.id === parseInt(countryName))
		|| !!(item.possibleNames ? item.possibleNames : []).find(synonym => stringUtils.wordsStandardize(synonym) === countryName));

	return countryFound ? {
		_id: countryFound.id,
		country: countryFound.country,
		iso2: countryFound.iso2,
		iso3: countryFound.iso3,
		lat: countryFound.lat,
		long: countryFound.long,
		flag: `https://disease.sh/assets/img/flags/${countryFound.iso2.toLowerCase()}.png`
	} : nullReturn;
};


const fuzzySearch = (ctry, nameParam, standardizedName, selector) => ((ctry.countryInfo || {}).iso3 || '').toLowerCase() === nameParam.toLowerCase()
	|| ((ctry.countryInfo || {}).iso2 || '').toLowerCase() === nameParam.toLowerCase()
	|| ((nameParam.length > 3 || isCountryException(nameParam.toLowerCase()))
		&& stringUtils.wordsStandardize(ctry[selector]).includes(standardizedName));


const getWorldometersData = (data, nameParam, strictMatching, continentMode) => {
	const selector = continentMode ? 'continent' : 'country';
	const isText = Number.isNaN(nameParam);
	const countryInfo = isText ? getCountryData(nameParam) : {};
	const standardizedName = stringUtils.wordsStandardize(countryInfo.country ? countryInfo.country : nameParam);
	return data.find((ctry) => !isText ? ctry.countryInfo && ctry.countryInfo._id === Number(nameParam)
		: strictMatching ? stringUtils.wordsStandardize(ctry[selector]) === standardizedName : fuzzySearch(ctry, nameParam, standardizedName, selector));
};

const countryExceptions = ['UK', 'UAE', 'DR'];

const isCountryException = (countryname) => !!countryExceptions.find(exception => stringUtils.wordsStandardize(countryname) === stringUtils.wordsStandardize(exception));


const getCountriesFromContinent = (continent, countries) => countries
	.filter(country => stringUtils.wordsStandardize(country.continent).includes(stringUtils.wordsStandardize(continent)))
	.map(country => country.country || 'no data');

module.exports = {
	getCountryCode,
	getCountryName,
	getCountryData,
	getWorldometersData,
	isCountryException,
	getCountriesFromContinent,
	transformNull
};
