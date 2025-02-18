document.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showWeatherByLocation, () => fetchWeatherData('Delhi'));
    } else {
        fetchWeatherData('Delhi');
    }
});

document.getElementById('search-button').addEventListener('click', () => {
    const location = document.getElementById('search-bar').value;
    if (location) {
        fetchWeatherData(location);
    }
});

function showWeatherByLocation(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetchWeatherDataByCoordinates(lat, lon);
}

function fetchWeatherData(location) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=bc242953a66f5f4f69b4a53a0b5f2f40`)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                displayWeather(data);
            } else {
                alert('Location not found');
            }
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function fetchWeatherDataByCoordinates(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=bc242953a66f5f4f69b4a53a0b5f2f40`)
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(error => console.error('Error fetching weather data:', error));
}

function displayWeather(data) {
    document.getElementById('location-name').innerText = data.name;
    document.getElementById('weather-description').innerText = data.weather[0].description;
    document.getElementById('temperature').innerText = `Temperature: ${data.main.temp}°C`;
    document.getElementById('wind-speed').innerText = `Wind Speed: ${data.wind.speed} m/s`;
    document.getElementById('humidity').innerText = `Humidity: ${data.main.humidity}%`;

    const currentDate = new Date();
    document.getElementById('date-time').innerText = `Date & Time: ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

    setWeatherImage(data.main.temp);
    setHumidityImage(data.main.humidity);
    fetchForecast(data.coord.lat, data.coord.lon);
}

function setWeatherImage(temp) {
    const weatherImage = document.getElementById('weather-image');
    if (temp < 20) {
        weatherImage.src = 'cold.png';
        weatherImage.alt = 'Cold Weather';
        

    } else if (temp >= 20 && temp <= 35) {
        weatherImage.src = 'moderate.png';
        weatherImage.alt = 'Moderate Weather';
    } else {
        weatherImage.src = 'hot.png';
        weatherImage.alt = 'Hot Weather';
    }
}



function setHumidityImage(humidity) {
    const humidityImage = document.getElementById('humidity-image');
    if (humidity < 40) {
        humidityImage.src = 'lessrain.png';
        humidityImage.alt = 'Low Humidity';
    } else if(humidity>40 && humidity<65)
    { humidityImage.src = 'midrain.png';
        humidityImage.alt = 'Low Humidity';}
        
        else {
        humidityImage.src = 'rain.png';
        humidityImage.alt = 'High Humidity';
    }
}

function fetchForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=40&appid=bc242953a66f5f4f69b4a53a0b5f2f40`)
        .then(response => response.json())
        .then(data => displayForecast(data))
        .catch(error => console.error('Error fetching forecast:', error));
}

function displayForecast(data) {
    const dailyForecasts = {};
    const forecastLabels = [];
    const forecastTemps = [];

    data.list.forEach(item => {
        const date = new Date(item.dt_txt);
        const day = date.toLocaleDateString(undefined, { weekday: 'long' });

        // Only take one forecast per day, ideally at 12:00 PM if available
        if (date.getHours() === 12) {
            dailyForecasts[day] = item;
        }
    });

    Object.entries(dailyForecasts).forEach(([day, item]) => {
        forecastLabels.push(day);
        forecastTemps.push(item.main.temp);
    });

    // If there are less than 7 days of data, add extra days with placeholder data
    while (forecastLabels.length < 7) {
        forecastLabels.push(`Day ${forecastLabels.length + 1}`);
        forecastTemps.push(null);
    }

    createForecastChart(forecastLabels, forecastTemps);
}

function createForecastChart(labels, data) {
    const ctx = document.getElementById('forecast-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
