let map;
const apiKey = "ed435aff8cd2bb0eb1ebb12e6a61d2f8"; // Replace with your OpenWeatherMap API key

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      document.getElementById("latitude-input").value = lat;
      document.getElementById("longitude-input").value = lon;

      updateAll({ lat, lon });
    }, showError);
  } else {
    alert("Geolocation not supported.");
  }
}

function updateAll(coords) {
  const lat = coords.lat;
  const lon = coords.lon;

  document.getElementById("latitude").innerHTML = `Latitude: ${lat}`;
  document.getElementById("longitude").innerHTML = `Longitude: ${lon}`;

  updateMap(lat, lon);
  getAddress(lat, lon);
  getWeather(lat, lon);
}

function updateMap(lat, lon) {
  if (!map) {
    map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  } else {
    map.setView([lat, lon], 13);
  }

  map.eachLayer(layer => {
    if (layer instanceof L.Marker) map.removeLayer(layer);
  });

  L.marker([lat, lon]).addTo(map).bindPopup("You are here!").openPopup();
}

function getAddress(lat, lon) {
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(data => {
      const address = data.address || {};
      document.getElementById("current-location").innerHTML = `Current Location: ${data.display_name || '-'}`;
      document.getElementById("taluka").innerHTML = `Taluka: ${address.county || '-'}`;
      document.getElementById("district").innerHTML = `District: ${address.state_district || address.state || '-'}`;
    })
    .catch(err => {
      console.error("Address fetch failed", err);
    });
}

function getWeather(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      const temp = data.main.temp;
      const condition = data.weather[0].description;
      const wind = data.wind.speed;
      const humidity = data.main.humidity;

      document.getElementById("weather").innerHTML = `
        Weather: ${condition}<br>
        Temperature: ${temp} °C<br>
        Wind: ${wind} m/s<br>
        Humidity: ${humidity}%
      `;

      const now = Date.now();
      const sunrise = data.sys.sunrise * 1000;
      const sunset = data.sys.sunset * 1000;

      if (now >= sunrise && now <= sunset) {
        document.body.classList.add("day-theme");
        document.body.classList.remove("night-theme");
      } else {
        document.body.classList.add("night-theme");
        document.body.classList.remove("day-theme");
      }
    })
    .catch(err => {
      console.error("Weather fetch failed", err);
    });
}

function showError(error) {
  alert("Error getting location: " + error.message);
}

document.getElementById("latitude-input").addEventListener("input", () => {
  const lat = parseFloat(document.getElementById("latitude-input").value);
  const lon = parseFloat(document.getElementById("longitude-input").value);
  if (!isNaN(lat) && !isNaN(lon)) updateAll({ lat, lon });
});

document.getElementById("longitude-input").addEventListener("input", () => {
  const lat = parseFloat(document.getElementById("latitude-input").value);
  const lon = parseFloat(document.getElementById("longitude-input").value);
  if (!isNaN(lat) && !isNaN(lon)) updateAll({ lat, lon });
});
