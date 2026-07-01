// ==========================================
// CONFIGURATION & CORES
// ==========================================
const WEATHER_API_KEY = "22ade28a2863255c534c5f05f96691f0";
const LAT = 52.4555; 
const LON = -1.7289;
const BUS_STOP_ID = "43000170202"; // NEC, after Morris Way (Northbound)

// ==========================================
// MODULE 01 & 02: TIME & WORKDAY RATIO
// ==========================================
function updateChronometer() {
  const now = new Date();
  
  // Terminal Clock
  document.getElementById('clock').innerText = now.toTimeString().split(' ')[0];
  
  // Shift Progress Ratio (07:30 - 16:00)
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
// MODULE 04: EXTRACTION VECTOR (LIVE BUSES)
// ==========================================
async function fetchTransit() {
  try {
    // Open TransportAPI stream setup
    const response = await fetch(`https://transportapi.com/v3/uk/bus/stop/${BUS_STOP_ID}/live.json?app_id=03bf8009&app_key=d7574317130c2d3c2fa53cc9bb4e731d&group=no&nextbuses=no`);
    if (!response.ok) throw new Error("TRANSIT_ERR");
    
    const data = await response.json();
    const allBuses = data.departures.all || [];
    
    let htmlOutput = "";
    
    if (allBuses.length === 0) {
      htmlOutput = `<div style="color: rgba(0, 255, 204, 0.4); font-size: 0.9rem;">NO ACTIVE EXTRACTION VECTORS SCHEDULED</div>`;
    } else {
      // Pull top 3 closest arrivals
      allBuses.slice(0, 3).forEach(bus => {
        const line = bus.line;
        const dest = bus.direction.toUpperCase();
        
        let statusText = "";
        if (bus.best_departure_estimate) {
          const [hours, minutes] = bus.best_departure_estimate.split(':').map(Number);
          const now = new Date();
          const target = new Date();
          target.setHours(hours, minutes, 0, 0);
          
          let diffMins = Math.round((target - now) / 60000);
          if (diffMins <= 0) statusText = "DUE";
          else statusText = `${diffMins} MIN`;
        } else {
          statusText = bus.aimed_departure_time || "SCHED";
        }
        
        htmlOutput += `
          <div style="display: flex; justify-content: space-between; font-size: 1.1rem; margin-bottom: 8px; border-bottom: 1px dashed rgba(0, 255, 204, 0.15); padding-bottom: 4px;">
            <span style="color: #ff0055; font-weight: bold; min-width: 70px;">[${line}]</span>
            <span style="color: #00ffcc; flex-grow: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; margin-right: 10px;">${dest}</span>
            <span style="color: #fff; text-shadow: 0 0 5px #fff; font-weight: bold;">${statusText}</span>
          </div>
        `;
      });
    }
    
    document.getElementById('bus-board').innerHTML = htmlOutput;
  } catch (error) {
    document.getElementById('bus-board').innerHTML = `<span style="color: #ff0055;">TRANSIT_STREAM_DISRUPTED // LINK_LOSS</span>`;
  }
}

// ==========================================
// INITIALIZATION MATRIX
// ==========================================
setInterval(updateChronometer, 1000);
updateChronometer();

setInterval(fetchWeather, 900000); 
fetchWeather();

setInterval(fetchTransit, 60000); 
fetchTransit();
