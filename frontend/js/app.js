
/* =========================================
   WEATHER INTELLIGENCE PRO
   Open-Meteo Weather and Air Quality APIs
========================================= */


/* =========================================
   WEATHER CONDITION INFORMATION
========================================= */

function getWeatherInfo(code) {

    const weatherConditions = {
        0: { description: "Clear Sky", icon: "☀️" },
        1: { description: "Mainly Clear", icon: "🌤️" },
        2: { description: "Partly Cloudy", icon: "⛅" },
        3: { description: "Overcast", icon: "☁️" },
        45: { description: "Fog", icon: "🌫️" },
        48: { description: "Depositing Rime Fog", icon: "🌫️" },
        51: { description: "Light Drizzle", icon: "🌦️" },
        53: { description: "Moderate Drizzle", icon: "🌦️" },
        55: { description: "Dense Drizzle", icon: "🌧️" },
        61: { description: "Slight Rain", icon: "🌧️" },
        63: { description: "Moderate Rain", icon: "🌧️" },
        65: { description: "Heavy Rain", icon: "🌧️" },
        71: { description: "Slight Snow", icon: "🌨️" },
        73: { description: "Moderate Snow", icon: "❄️" },
        75: { description: "Heavy Snow", icon: "❄️" },
        80: { description: "Rain Showers", icon: "🌦️" },
        81: { description: "Moderate Rain Showers", icon: "🌧️" },
        82: { description: "Heavy Rain Showers", icon: "⛈️" },
        95: { description: "Thunderstorm", icon: "⛈️" },
        96: { description: "Thunderstorm with Hail", icon: "⛈️" },
        99: { description: "Heavy Thunderstorm with Hail", icon: "⛈️" }
    };

    return weatherConditions[code] || {
        description: "Unknown Weather",
        icon: "🌡️"
    };
}


/* =========================================
   UV INDEX CATEGORY
========================================= */

function getUVLevel(uvIndex) {

    if (uvIndex <= 2) return "Low";
    if (uvIndex <= 5) return "Moderate";
    if (uvIndex <= 7) return "High";
    if (uvIndex <= 10) return "Very High";

    return "Extreme";
}


/* =========================================
   AIR QUALITY CATEGORY
========================================= */

function getAQIStatus(aqi) {

    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";

    return "Hazardous";
}


/* =========================================
   FORMAT TIME
========================================= */

function formatTime(dateTime) {

    if (!dateTime) return "--";

    const date = new Date(dateTime);

    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}


/* =========================================
   DISPLAY HOURLY FORECAST
========================================= */

function displayHourlyForecast(hourly, currentTime) {

    const container = document.getElementById("hourlyForecast");

    if (!hourly || !hourly.time || !hourly.temperature_2m) {
        container.textContent = "Hourly forecast unavailable.";
        return;
    }

    const currentHour = currentTime.substring(0, 13);

    let startIndex = hourly.time.findIndex(time =>
        time.startsWith(currentHour)
    );

    if (startIndex === -1) {
        startIndex = 0;
    }

    const selectedTimes = hourly.time.slice(startIndex, startIndex + 8);

    const selectedTemperatures =
        hourly.temperature_2m.slice(startIndex, startIndex + 8);

    const selectedCodes =
        hourly.weather_code.slice(startIndex, startIndex + 8);

    if (selectedTimes.length === 0) {
        container.textContent = "Hourly data unavailable.";
        return;
    }

    container.innerHTML = selectedTimes.map((time, index) => {

        const weather = getWeatherInfo(selectedCodes[index]);

        const hour = new Date(time).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            hour12: true
        });

        return `
            <div class="hour-card">
                <p>${hour}</p>
                <div class="hour-icon">${weather.icon}</div>
                <h4>${Math.round(selectedTemperatures[index])}°</h4>
            </div>
        `;

    }).join("");
}


/* =========================================
   DISPLAY 7-DAY FORECAST
========================================= */

function displayDailyForecast(daily) {

    const container = document.getElementById("dailyForecast");

    if (!daily || !daily.time) {
        container.textContent = "Daily forecast unavailable.";
        return;
    }

    container.innerHTML = daily.time.map((date, index) => {

        const weather = getWeatherInfo(daily.weather_code[index]);

        const day = new Date(date + "T12:00:00").toLocaleDateString(
            "en-IN",
            { weekday: "long" }
        );

        const maxTemp = Math.round(daily.temperature_2m_max[index]);
        const minTemp = Math.round(daily.temperature_2m_min[index]);

        return `
            <div class="daily-item">
                <span class="daily-day">${day}</span>
                <span class="daily-icon">${weather.icon}</span>
                <span class="daily-condition">${weather.description}</span>

                <span class="daily-temperature">
                    ${maxTemp}° 
                    <span>${minTemp}°</span>
                </span>
            </div>
        `;

    }).join("");
}


/* =========================================
   DISPLAY UV INDEX
========================================= */

function displayUVIndex(daily) {

    const uvElement = document.getElementById("uvIndex");
    const levelElement = document.getElementById("uvLevel");

    const uvIndex = daily?.uv_index_max?.[0];

    if (uvIndex == null) {
        uvElement.textContent = "--";
        levelElement.textContent = "Data unavailable";
        return;
    }

    uvElement.textContent = Number(uvIndex).toFixed(1);
    levelElement.textContent = getUVLevel(uvIndex);
}


/* =========================================
   DISPLAY AIR QUALITY
========================================= */

function displayAirQuality(data) {

    const aqiElement = document.getElementById("aqiValue");
    const statusElement = document.getElementById("aqiStatus");
    const pm25Element = document.getElementById("pm25Value");
    const pm10Element = document.getElementById("pm10Value");

    if (!data || !data.current || data.current.us_aqi == null) {

        aqiElement.textContent = "N/A";
        statusElement.textContent = "Data unavailable";
        pm25Element.textContent = "--";
        pm10Element.textContent = "--";

        return;
    }

    const current = data.current;
    const aqi = current.us_aqi;

    aqiElement.textContent = Math.round(aqi);
    statusElement.textContent = getAQIStatus(aqi);

    pm25Element.textContent =
        current.pm2_5 == null ? "--" : Number(current.pm2_5).toFixed(1);

    pm10Element.textContent =
        current.pm10 == null ? "--" : Number(current.pm10).toFixed(1);
}


/* =========================================
   DISPLAY WEATHER ANALYTICS CHARTS
========================================= */

function displayWeatherCharts(hourly, currentTime) {

    const temperatureChart =
        document.getElementById("temperatureChart");

    const windChart =
        document.getElementById("windChart");

    if (!hourly || !hourly.time ||
        !hourly.temperature_2m ||
        !hourly.wind_speed_10m) {

        temperatureChart.textContent = "Temperature data unavailable.";
        windChart.textContent = "Wind data unavailable.";

        return;
    }

    const currentHour = currentTime.substring(0, 13);

    let startIndex = hourly.time.findIndex(time =>
        time.startsWith(currentHour)
    );

    if (startIndex === -1) {
        startIndex = 0;
    }

    function createBars(container, values, unit) {

        const selectedValues = values.slice(startIndex, startIndex + 8);

        const selectedTimes = hourly.time.slice(startIndex, startIndex + 8);

        if (selectedValues.length === 0) {
            container.textContent = "Chart data unavailable.";
            return;
        }

        const numericValues = selectedValues.map(Number);

        const minValue = Math.min(...numericValues, 0);
        const maxValue = Math.max(...numericValues, 1);

        const range = maxValue - minValue || 1;

        container.innerHTML = selectedValues.map((value, index) => {

            const height = Math.max(
                ((Number(value) - minValue) / range) * 100,
                5
            );

            const time = selectedTimes[index].substring(11, 16);

            return `
                <div class="chart-bar-item">

                    <span class="chart-value">
                        ${Number(value).toFixed(1)}${unit}
                    </span>

                    <div class="chart-bar-track">
                        <div
                            class="chart-bar-fill"
                            style="height:${height}%">
                        </div>
                    </div>

                    <span class="chart-time">${time}</span>

                </div>
            `;

        }).join("");
    }

    createBars(temperatureChart, hourly.temperature_2m, "°");
    createBars(windChart, hourly.wind_speed_10m, "");
}


/* =========================================
   MAIN WEATHER FUNCTION
========================================= */

async function getWeather(city) {

    const statusMessage = document.getElementById("statusMessage");
    const searchButton = document.getElementById("searchButton");

    try {

        statusMessage.textContent = "Searching for city...";
        searchButton.disabled = true;

        /* GET CITY COORDINATES */

        const geoUrl =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Unable to connect to location service.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please enter a valid city name.");
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        const locationName = location.name;
        const country = location.country || "";

        statusMessage.textContent = "Fetching weather information...";


        /* GET WEATHER DATA */

        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&hourly=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&forecast_days=7&timezone=auto`;

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const weatherData = await weatherResponse.json();


        /* GET AIR QUALITY DATA */

        const airQualityUrl =
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10&timezone=auto`;

        let airQualityData = null;

        try {

            const airResponse = await fetch(airQualityUrl);

            if (airResponse.ok) {
                airQualityData = await airResponse.json();
            }

        } catch (airError) {

            console.error("Air Quality Error:", airError);

        }


        /* CURRENT WEATHER */

        const current = weatherData.current;
        const daily = weatherData.daily;

        const weatherInfo = getWeatherInfo(current.weather_code);

        document.getElementById("weatherCity").textContent =
            `${locationName}, ${country}`;

        document.getElementById("temperature").textContent =
            Math.round(current.temperature_2m);

        document.getElementById("weatherCondition").textContent =
            weatherInfo.description;

        document.getElementById("weatherIcon").textContent =
            weatherInfo.icon;

        document.getElementById("feelsLike").textContent =
            Math.round(current.apparent_temperature);

        document.getElementById("lastUpdated").textContent =
            `Last updated: ${formatTime(current.time)}`;


        /* WEATHER HIGHLIGHTS */

        document.getElementById("humidity").textContent =
            current.relative_humidity_2m;

        document.getElementById("windSpeed").textContent =
            Number(current.wind_speed_10m).toFixed(1);

        document.getElementById("precipitation").textContent =
            Number(current.precipitation).toFixed(1);

        document.getElementById("sunrise").textContent =
            formatTime(daily.sunrise[0]);

        document.getElementById("sunset").textContent =
            formatTime(daily.sunset[0]);


        /* DISPLAY ALL FORECASTS AND ANALYTICS */

        displayUVIndex(daily);

        displayHourlyForecast(weatherData.hourly, current.time);

        displayDailyForecast(daily);

        displayAirQuality(airQualityData);

        displayWeatherCharts(weatherData.hourly, current.time);

        statusMessage.textContent =
            `Weather successfully loaded for ${locationName}.`;

    } catch (error) {

        console.error("Weather Error:", error);

        statusMessage.textContent = error.message;

    } finally {

        searchButton.disabled = false;

    }
}


/* =========================================
   SEARCH FORM EVENT
========================================= */

document.getElementById("searchForm").addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const city = document.getElementById("cityInput").value.trim();

        if (city) {
            getWeather(city);
        }

    }
);


/* =========================================
   DEFAULT CITY
========================================= */

getWeather("Pune");
