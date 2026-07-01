// ==========================================
// CONFIGURATION & CORES
// ==========================================
const WEATHER_API_KEY = "22ade28a2863255c534c5f05f96691f0";
const LAT = 52.4633; // Localized coordinates
const LON = -1.7311;

// ==========================================
// MODULE 01 & 02: TIME & WORKDAY RATIO
// ==========================================
function updateChronometer() {
  const now = new Date();
  
  // Format terminal clock text
  document.getElementById('clock').innerText = now.toTimeString().split(' ')[0];
  
  // Calculate Shift Progress Ratio (07:30 - 16:00)
  const start = new Date();
  start.setHours(7, 30, 0, 0);
  
  const end = new Date();
  end.setHours(16, 0, 0, 0);
  
  let percentage = 0;
  
  if (now > end) {
    percentage = 100;
  } else if (now >= start) {
    const totalDuration = end - start;
    const elapsed = now - start;
    percentage = (elapsed / totalDuration) * 100;
  }
  
  const cleanPct = percentage.toFixed(2);
  document.getElementById('progress-bar').style.width = `${cleanPct}%`;
  document.getElementById('progress-text').innerText = `${cleanPct}%`;
}

// ==========================================
// MODULE 03: ATMOSPHERICS ENGINE (WEATHER)
// ==========================================
async function fetchWeather() {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${WEATHER_API_KEY}&units=metric`);
    if (!response.ok) throw new Error("STREAM_ERR");
    
    const data = await response.json();
    const temp = Math.round(data.main.temp);
    const condition = data.weather[0].description.toUpperCase();
    
    document.getElementById('weather').innerHTML = `
      <div style="font-size: 1.8rem; color: #00ffcc; font-weight: bold; text-shadow: 0 0 8px #00ffcc;">
        ${temp}°C // ${condition}
      </div>
      <div style="font-size: 0.8rem; color: rgba(0, 255, 204, 0.6); margin-top: 4px; letter-spacing: 1px;">
        BARO: ${data.main.pressure}HPA // HUMIDITY: ${data.main.humidity}% // WIND: ${Math.round(data.wind.speed * 2.237)}MPH
      </div>
    `;
  } catch (error) {
    document.getElementById('weather').innerHTML = `<span style="color: #ff0055;">ENV_STREAM_OFFLINE // RETRYING</span>`;
  }
}

// ==========================================
// MODULE 04: EXTRACTION VECTOR (TRANSIT)
// ==========================================
async function fetchTransit() {
  // Placeholder network array until your transit key is active
  // This ensures the visual grid stays rendering correctly
  document.getElementById('bus-board').innerHTML = `
    <div style="color: rgba(0, 255, 204, 0.4); font-size: 0.9rem; font-style: italic;">
      AWAITING API VECTOR AUTHENTICATION Token...
    </div>
  `;
}

// ==========================================
// INITIALIZATION MATRIX
// ==========================================
// Live core updates
setInterval(updateChronometer, 1000);
updateChronometer();

// Periodic API fetch frequencies
setInterval(fetchWeather, 900000); // 15 Minute cycle
fetchWeather();

setInterval(fetchTransit, 120000); // 2 Minute cycle
fetchTransit();
