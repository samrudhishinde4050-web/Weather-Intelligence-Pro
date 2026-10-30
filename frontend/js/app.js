
// Step 3: Live Weather API Integration

const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const statusMessage = document.getElementById("statusMessage");

// Convert weather code into readable condition
function getWeatherCondition(code) {
    const weatherConditions = {
        0: "Clear Sky ☀️",
        1: "Mainly Clear 🌤️",
        2: "Partly Cloudy ⛅",
        3: "Overcast ☁️",
        45: "Fog 🌫️",
        48: "Depositing Rime Fog 🌫️",
        51: "Light Drizzle 🌦️",
        53: "Moderate Drizzle 🌦️",
        55: "Dense Drizzle 🌧️",
        61: "Slight Rain 🌧️",
        63: "Moderate Rain 🌧️",
        65: "Heavy Rain 🌧️",
        71: "Slight Snow ❄️",
        73: "Moderate Snow ❄️",
        75: "Heavy Snow ❄️",
        80: "Rain Showers 🌦️",
        81: "Moderate Rain Showers 🌧️",
        82: "Violent Rain Showers ⛈️",
        95: "Thunderstorm ⛈️"
    };

    return weatherConditions[code] || "Weather information unavailable";
}

// Display next 8 hours of weather
function displayHourlyForecast(hourly, currentTime) {
    const hourlyContainer =
        document.getElementById("hourlyForecast");

    if (!hourlyContainer || !hourly || !hourly.time) {
        return;
    }

    const startIndex = hourly.time.findIndex(
        time => time >= currentTime
    );

    if (startIndex === -1) {
        hourlyContainer.textContent =
            "Hourly forecast is unavailable.";
        return;
    }

    const nextHours = hourly.time.slice(
        startIndex,
        startIndex + 8
    );

    hourlyContainer.innerHTML = nextHours.map((time, index) => {
        const actualIndex = startIndex + index;

        const temperature = Math.round(
            hourly.temperature_2m[actualIndex]
        );

        const weatherCode =
            hourly.weather_code[actualIndex];

        const condition =
            getWeatherCondition(weatherCode);

        const hour = time.substring(11, 16);
        const icon = condition.split(" ").slice(-1)[0];

        return `
            <div class="hourly-card">
                <p class="hour">${hour}</p>
                <p class="hour-icon">${icon}</p>
                <p class="hour-temp">${temperature}°C</p>
            </div>
        `;
    }).join("");
}

// Display 7-day weather forecast
function displayDailyForecast(daily) {
    const dailyContainer =
        document.getElementById("dailyForecast");

    if (!dailyContainer || !daily || !daily.time ||
        daily.time.length === 0) {
        if (dailyContainer) {
            dailyContainer.textContent =
                "Daily forecast is unavailable.";
        }
        return;
    }

    dailyContainer.innerHTML = daily.time.map((date, index) => {
        const dayDate = new Date(date + "T12:00:00");

        const dayName = dayDate.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const condition =
            getWeatherCondition(daily.weather_code[index]);

        const icon = condition.split(" ").slice(-1)[0];

        const maxTemp = Math.round(
            daily.temperature_2m_max[index]
        );

        const minTemp = Math.round(
            daily.temperature_2m_min[index]
        );

        return `
            <div class="daily-card">
                <p class="day">${dayName}</p>
                <p class="day-icon">${icon}</p>
                <p class="day-condition">${condition}</p>

                <div class="day-temperatures">
                    <span class="max-temp">${maxTemp}°</span>
                    <span class="min-temp">${minTemp}°</span>
                </div>
            </div>
        `;
    }).join("");
}

// Fetch weather information for a city
async function getWeather(city) {
    try {
        statusMessage.textContent = "Loading weather data...";

        // Step 1: Get city coordinates
        const geoUrl =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Unable to search for this city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(
                "City not found. Please enter a valid city name."
            );
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Step 2: Get current, hourly and daily weather
        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=auto`;

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error(
                "Unable to fetch weather information."
            );
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        // Step 3: Update current weather
        document.getElementById("weatherCity").textContent =
            `${location.name}, ${location.country}`;

        document.getElementById("temperature").textContent =
            Math.round(current.temperature_2m);

        document.getElementById("weatherCondition").textContent =
            getWeatherCondition(current.weather_code);

        // Display feels-like temperature
        document.getElementById("feelsLike").textContent =
            Math.round(current.apparent_temperature);

        // Display last updated time
        document.getElementById("lastUpdated").textContent =
            `Last updated: ${current.time.replace("T", " ")}`;

        // Display humidity
        document.getElementById("humidity").textContent =
            `${current.relative_humidity_2m}%`;

        // Display wind speed
        document.getElementById("windSpeed").textContent =
            `${current.wind_speed_10m} km/h`;

        // Display precipitation
        document.getElementById("precipitation").textContent =
            `${current.precipitation} mm`;

        // Display hourly forecast
        displayHourlyForecast(
            weatherData.hourly,
            current.time
        );

        // Display 7-day forecast
        displayDailyForecast(weatherData.daily);

        statusMessage.textContent =
            "Weather updated successfully!";

    } catch (error) {
        statusMessage.textContent = error.message;
    }
}

// Handle city search form
searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        statusMessage.textContent =
            "Please enter a city name.";
        return;
    }

    getWeather(city);
});
