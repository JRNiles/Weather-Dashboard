const API_KEY = "17c2ea19cba0caf392b42e91caa8c981";
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchHistoryContainer = document.getElementById("search-history"); // Rename to avoid naming conflict
const currentWeather = document.getElementById("current-weather");
const forecast = document.getElementById("forecast");

// Initialize searchHistory from local storage or set it to an empty array
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

// Event listener for form submission
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    getWeatherData(city);
    cityInput.value = "";
  }
});

// Function to fetch weather data
async function getWeatherData(city) {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    if (response.ok) {
      displayCurrentWeather(data);
      addToSearchHistory(city);
      getForecastData(data.coord.lat, data.coord.lon);
    } else {
      // Handle error
      console.error("Failed to fetch weather data:", data.message);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

// Function to display current weather
function displayCurrentWeather(data) {
  // Display current weather information
  currentWeather.innerHTML = `
        <h2>${data.name} (${new Date().toLocaleDateString()})</h2>
        <p>Temperature: ${data.main.temp}&deg;C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
}

// Function to fetch forecast data
async function getForecastData(lat, lon) {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    if (response.ok) {
      displayForecast(data.list);
    } else {
      // Handle error
      console.error("Failed to fetch forecast data:", data.message);
    }
  } catch (error) {
    console.error("Error fetching forecast data:", error);
  }
}

// Function to display forecast
function displayForecast(forecastData) {
  // Display forecast for next 5 days
  forecast.innerHTML = ""; // Clear previous forecast
  for (let i = 0; i < forecastData.length; i += 8) {
    const forecastItem = forecastData[i];
    const date = new Date(forecastItem.dt * 1000);
    const icon = forecastItem.weather[0].icon;
    forecast.innerHTML += `
            <div class="forecast-item">
                <p>${date.toLocaleDateString()}</p>
                <img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon">
                <p>Temperature: ${forecastItem.main.temp}&deg;C</p>
                <p>Wind Speed: ${forecastItem.wind.speed} m/s</p>
                <p>Humidity: ${forecastItem.main.humidity}%</p>
            </div>
        `;
  }
}

// Function to add city to search history
function addToSearchHistory(city) {
  const existingItem = Array.from(searchHistoryContainer.children).find(
    (item) => item.textContent === city
  );
  if (!existingItem) {
    const searchItem = document.createElement("div");
    searchItem.textContent = city;
    searchItem.classList.add("search-item");
    searchItem.addEventListener("click", () => {
      getWeatherData(city);
    });
    searchHistoryContainer.appendChild(searchItem);

    // Update local storage with the updated search history array
    searchHistory.push(city);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }
}

// Render search history on page load
window.onload = () => {
  renderSearchHistory();
};

// Function to render search history
function renderSearchHistory() {
  searchHistoryContainer.innerHTML = ""; // Clear previous search history
  searchHistory.forEach((city) => {
    const searchItem = document.createElement("div");
    searchItem.textContent = city;
    searchItem.classList.add("search-item");
    searchItem.addEventListener("click", () => {
      getWeatherData(city);
    });
    searchHistoryContainer.appendChild(searchItem);
  });
}
