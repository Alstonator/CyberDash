// ==========================================
// CONFIGURATION & CORES
// ==========================================
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
// MODULE 03: ATMOSPHERICS ENGINE (DIAGNOSTIC)
// ==========================================
async function fetchWeather() {
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,weather_code`);
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    
    const data = await response.json();
    const current = data.current;
    const temp = Math.round(current.temperature_2m);
    
    const codeMap = {
      0: "CLEAR SKY", 1: "MAINLY CLEAR", 2: "PARTLY CLOUDY", 3: "OVERCAST",
      45: "FOGGY", 48: "RIME FOG", 51: "LIGHT DRIZZLE", 53: "MODERATE DRIZZLE",
      55: "DENSE DRIZZLE", 61: "SLIGHT RAIN", 63: "MODERATE RAIN", 65: "HEAVY RAIN"
    };
    const condition = codeMap[current.weather_code] || "MATRIX ACTIVE";
    
    document.getElementById('weather').innerHTML = `
      <div style="font-size: 1.8rem; color: #00ffcc; font-weight: bold; text-shadow: 0 0 8px #00ffcc;">
        ${temp}°C // ${condition}
      </div>
      <div style="font-size: 0.8rem; color: rgba(0, 255, 204, 0.6); margin-top: 4px; letter-spacing: 1px;">
        BARO: ${Math.round(current.surface_pressure)}HPA // HUMIDITY: ${current.relative_humidity_2m}% // WIND: ${Math.round(current.wind_speed_10m * 0.621371)}MPH
      </div>
    `;
  } catch (error) {
    // Outputs precise diagnostic fault
    document.getElementById('weather').innerHTML = `
      <span style="color: #ff0055; font-weight: bold;">WEATHER_FAULT // ${error.message.toUpperCase()}</span>
    `;
  }
}

// ==========================================
// MODULE 04: EXTRACTION VECTOR (DIAGNOSTIC)
// ==========================================
async function fetchTransit() {
  try {
    const response = await fetch(`https://transportapi.com/v3/uk/bus/stop/${BUS_STOP_ID}/live.json?app_id=741002cf&app_key=2c9a92025eb270a43063548325a7a922&group=no&nextbuses=no`);
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    
    const data = await response.json();
    const allBuses = data.departures.all || [];
    
    let htmlOutput = "";
    
    if (allBuses.length === 0) {
      htmlOutput = `<div style="color: rgba(0, 255, 204, 0.4); font-size: 0.9rem;">NO ACTIVE EXTRACTION VECTORS SCHEDULED</div>`;
    } else {
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
    // Outputs precise diagnostic fault
    document.getElementById('bus-board').innerHTML = `
      <span style="color: #ff0055; font-weight: bold;">TRANSIT_FAULT // ${error.message.toUpperCase()}</span>
    `;
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
