// ==========================================
// CONFIGURATION & CORES
// ==========================================
const LAT = 52.4555; 
const LON = -1.7289;
const BUS_STOP_ID = "43000170202"; // Morris Way

// ==========================================
// MODULE 01 & 02: TIME, SHIFT RATIO & T-MINUS
// ==========================================
function updateChronometer() {
  const now = new Date();
  
  // Update Terminal System Clock
  document.getElementById('clock').innerText = now.toTimeString().split(' ')[0];
  
  // Set boundaries for shift (07:30 - 16:00)
  const start = new Date();
  start.setHours(7, 30, 0, 0);
  
  const end = new Date();
  end.setHours(16, 0, 0, 0);
  
  let percentage = 0;
  let countdownText = "SHIFT_COMPLETED";
  
  if (now > end) {
    percentage = 100;
    countdownText = "SYS_CLEAR // 00:00:00";
  } else if (now >= start) {
    // Progress calculation
    const totalDuration = end - start;
    const elapsed = now - start;
    percentage = (elapsed / totalDuration) * 100;
    
    // Time Remaining Calculation
    const diffMs = end - now;
    const hrs = String(Math.floor(diffMs / 3600000)).padStart(2, '0');
    const mins = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, '0');
    const secs = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, '0');
    countdownText = `T-MINUS: ${hrs}:${mins}:${secs}`;
  } else {
    countdownText = "AWAITING_SHIFT_START";
  }
  
  // Update UI Elements
  document.getElementById('time-left').innerText = countdownText;
  const cleanPct = percentage.toFixed(2);
  document.getElementById('progress-bar').style.width = `${cleanPct}%`;
  document.getElementById('progress-text').innerText = `${cleanPct}%`;
}

// ==========================================
// MODULE 03: ATMOSPHERICS ENGINE (OPEN-METEO)
// ==========================================
async function fetchWeather() {
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,weather_code`);
    if (!response.ok) throw new Error();
    
    const data = await response.json();
    const temp = Math.round(data.current.temperature_2m);
    
    const codeMap = {
      0: "CLEAR SKY", 1: "MAINLY CLEAR", 2: "PARTLY CLOUDY", 3: "OVERCAST",
      45: "FOGGY", 51: "LIGHT DRIZZLE", 61: "SLIGHT RAIN", 63: "MODERATE RAIN"
    };
    const condition = codeMap[data.current.weather_code] || "MATRIX ACTIVE";
    
    document.getElementById('weather').innerHTML = `
      <div style="font-size: 1.8rem; color: #00ffcc; font-weight: bold; text-shadow: 0 0 8px #00ffcc;">${temp}°C // ${condition}</div>
      <div style="font-size: 0.8rem; color: rgba(0, 255, 204, 0.6); margin-top: 4px; letter-spacing: 1px;">HUMIDITY: ${data.current.relative_humidity_2m}%</div>
    `;
  } catch (error) {
    document.getElementById('weather').innerHTML = `<span style="color: #ff0055;">WEATHER_FAULT</span>`;
  }
}

// ==========================================
// MODULE 04: EXTRACTION VECTOR (JSONP METHOD)
// ==========================================
function fetchTransit() {
  // Clear any old instances of our JSONP injection hook
  const oldScript = document.getElementById('transit-jsonp');
  if (oldScript) oldScript.remove();

  // Dynamically inject a script element to execute bypassing standard CORS restrictions
  const script = document.createElement('script');
  script.id = 'transit-jsonp';
  script.src = `https://transportapi.com/v3/uk/bus/stop/${BUS_STOP_ID}/live.json?app_id=741002cf&app_key=2c9a92025eb270a43063548325a7a922&group=no&nextbuses=no&callback=processTransitData`;
  
  script.onerror = () => {
    document.getElementById('bus-board').innerHTML = `<span style="color: #ff0055;">TRANSIT_FAULT // LINK_LOSS</span>`;
  };
  
  document.body.appendChild(script);
}

// The global callback engine hit by the JSONP script response
window.processTransitData = function(data) {
  try {
    const allBuses = data.departures.all || [];
    let htmlOutput = "";
    
    if (allBuses.length === 0) {
      htmlOutput = `<div style="color: rgba(0, 255, 204, 0.4); font-size: 0.9rem;">NO VECTORS SCHEDULED</div>`;
    } else {
      allBuses.slice(0, 3).forEach(bus => {
        const line = bus.line;
        const dest = bus.direction.toUpperCase();
        let statusText = bus.aimed_departure_time || "SCHED";
        
        if (bus.best_departure_estimate) {
          const [hours, minutes] = bus.best_departure_estimate.split(':').map(Number);
          const now = new Date();
          const target = new Date();
          target.setHours(hours, minutes, 0, 0);
          let diffMins = Math.round((target - now) / 60000);
          statusText = diffMins <= 0 ? "DUE" : `${diffMins} MIN`;
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
  } catch (e) {
    document.getElementById('bus-board').innerHTML = `<span style="color: #ff0055;">PROCESSING_ERROR</span>`;
  }
};

// ==========================================
// INITIALIZATION MATRIX
// ==========================================
setInterval(updateChronometer, 1000);
updateChronometer();

setInterval(fetchWeather, 900000); 
fetchWeather();

setInterval(fetchTransit, 60000); 
fetchTransit();
