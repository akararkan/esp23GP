// Elements
const seatsContainer = document.getElementById("bus-seats");
const occupiedCount = document.getElementById("occupied-count");
const availableCount = document.getElementById("available-count");

// Create seat layout
function createSeatLayout() {
  // Add regular seats
  for (let i = 1; i <= 20; i++) {
    const seatDiv = document.createElement("div");
    seatDiv.className = "seat available"; // Initially all available
    seatDiv.id = `seat-${i}`;
    seatDiv.innerText = `S${i}`;
    seatsContainer.appendChild(seatDiv);
  }
}

// Function to update passenger count
function updatePassengerCount() {
  const seats = document.querySelectorAll('.seat');
  const occupied = document.querySelectorAll('.seat.occupied').length;
  const total = seats.length;
  const available = total - occupied;
  
  occupiedCount.textContent = occupied;
  availableCount.textContent = available;
}

// Function to fetch data from ESP32
async function fetchBusData() {
  try {
    const response = await fetch('http://192.168.33.8/data');
    const data = await response.json();
    
    // Update only seats S1, S2, S3 based on sensor data
    updateSeatStatus(data);
    
    // Update map with GPS coordinates
    updateBusLocation(data.lat, data.lng);
    
    // Log successful data fetch
    console.log('Updated bus data:', data);
  } catch (error) {
    console.error('Error fetching bus data:', error);
  }
}
// Function to update ONLY seats S1, S2, S3 based on real sensor data
function updateSeatStatus(data) {
  // Get the first 3 seat elements
  const seat1 = document.getElementById('seat-1');
  const seat2 = document.getElementById('seat-2');
  const seat3 = document.getElementById('seat-3');
  
  // Update seat1 status
  if (seat1) {
    if (data.seat1 === 1 || data.seat1 === true) {
      seat1.className = "seat occupied";
    } else {
      seat1.className = "seat available";
    }
  }
  
  // Update seat2 status
  if (seat2) {
    if (data.seat2 === 1 || data.seat2 === true) {
      seat2.className = "seat occupied";
    } else {
      seat2.className = "seat available";
    }
  }
  
  // Update seat3 status
  if (seat3) {
    if (data.seat3 === 1 || data.seat3 === true) {
      seat3.className = "seat occupied";
    } else {
      seat3.className = "seat available";
    }
  }
  
  // Update the passenger count
  updatePassengerCount();
}

// Map setup
let map, busMarker;

function initMap() {
  // Default location (Sulaymaniyah)
  const defaultLocation = [35.5613, 45.4306];
  
  map = L.map("map").setView(defaultLocation, 13);
  
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  
  // Add bus marker
  busMarker = L.marker(defaultLocation).addTo(map);
  busMarker.bindPopup("Bus is here");
  
  // Add station markers
  const stations = [
    {
      id: 1,
      name: "Sulaymaniyah Main Station",
      location: [35.5625, 45.4331],
    },
    { id: 2, name: "City Center Station", location: [35.565, 45.438] },
    { id: 3, name: "University Station", location: [35.5678, 45.4253] },
  ];
  
  stations.forEach((station) => {
    L.marker(station.location).addTo(map).bindPopup(station.name);
  });
}

// Function to update bus location on map
function updateBusLocation(lat, lng) {
  if (!map || !busMarker) return;
  
  // Parse coordinates to ensure they are numbers
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  // Check if we have valid coordinates
  if (isNaN(latitude) || isNaN(longitude)) {
    console.error('Invalid GPS coordinates:', lat, lng);
    return;
  }
  
  const newPosition = [latitude, longitude];
  
  // Update marker position
  busMarker.setLatLng(newPosition);
  
  // Center map on the new position
  map.panTo(newPosition);
  
  // Update popup
  busMarker.bindPopup(`Bus at: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
}

// Initialize the application
function initApp() {
  // Create seat layout
  createSeatLayout();
  
  // Initialize map
  initMap();
  
  // Fetch initial data
  fetchBusData();
  
  // Set up periodic data fetching (every 1 second for real-time updates)
  setInterval(fetchBusData, 1000);
}
// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);