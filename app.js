// WORKDAY ENGINE
function updateWorkdayProgress() {
  const now = new Date();
  
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

// STANDARD TERMINAL CLOCK
function updateClock() {
  const now = new Date();
  document.getElementById('clock').innerText = now.toTimeString().split(' ')[0];
  updateWorkdayProgress();
}

// API DATA INJECTIONS (Stubs)
async function fetchWeather() {
  // Use OpenWeatherMap or similar free endpoints
  // document.getElementById('weather').innerText = `${temp}°C // CLOUDY`;
}

async function fetchTransit() {
  // Use TfWM API or national busesandtrains.co.uk endpoint
  // Query by AtcoCode for the physical stop outside work
}

// Initialise core loop
setInterval(updateClock, 1000);
updateClock();