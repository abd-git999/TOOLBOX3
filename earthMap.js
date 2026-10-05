const map = L.map("map").setView([9.145, 40.4897], 6);

const locationButton = document.getElementById("locationButton");
const clearMarkerButton = document.getElementById("clearMarkerButton");
const resetMapButton = document.getElementById("resetMapButton");

const mapSearchInput = document.getElementById("mapSearchInput");
const mapSearchButton = document.getElementById("mapSearchButton");
const mapSearchLoading = document.getElementById("mapSearchLoading");

let searchMarker = null;

// Satellite map
const satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution: "Tiles © Esri",
        maxZoom: 19
    }
);

// Place labels
const labelsLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    {
        attribution: "Labels © Esri",
        maxZoom: 19
    }
);

// Street map
const streetLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19
    }
);

// Show satellite by default
satelliteLayer.addTo(map);
labelsLayer.addTo(map);

// Map layers
const baseMaps = {
    "🛰️ Satellite": satelliteLayer,
    "🗺️ Street Map": streetLayer
};

const overlays = {
    "🏷️ Place Labels": labelsLayer
};

L.control.layers(baseMaps, overlays).addTo(map);

// Map scale
L.control.scale({
    imperial: false
}).addTo(map);


// ==============================
// MY LOCATION
// ==============================

locationButton.onclick = function () {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            map.setView([latitude, longitude], 16);

            L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup("📍 You are here")
                .openPopup();
        },

        function () {
            alert("Unable to get your location.");
        }
    );
};


// ==============================
// SEARCH PLACE
// ==============================

mapSearchButton.onclick = async function () {

    mapSearchLoading.style.display = "block";
    mapSearchButton.disabled = true;

    const place = mapSearchInput.value.trim();

    if (place === "") {

        mapSearchLoading.style.display = "none";
        mapSearchButton.disabled = false;

        alert("Please enter a place name.");
        return;
    }

    try {

        const url =
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.length === 0) {

            mapSearchLoading.style.display = "none";
            mapSearchButton.disabled = false;

            alert("Place not found.");
            return;
        }

        const latitude = parseFloat(data[0].lat);
        const longitude = parseFloat(data[0].lon);

        map.setView([latitude, longitude], 15);

        // Remove old search marker
        if (searchMarker) {
            map.removeLayer(searchMarker);
        }

        // Create new search marker
        searchMarker = L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(`
                <strong>📍 ${data[0].display_name}</strong>
                <br><br>
                Latitude: ${latitude.toFixed(5)}
                <br>
                Longitude: ${longitude.toFixed(5)}
            `)
            .openPopup();

        mapSearchLoading.style.display = "none";
        mapSearchButton.disabled = false;

    } catch (error) {

        mapSearchLoading.style.display = "none";
        mapSearchButton.disabled = false;

        alert("Unable to search for this place.");
        console.error(error);
    }
};


// ==============================
// ENTER TO SEARCH
// ==============================

mapSearchInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        mapSearchButton.click();
    }

});


// ==============================
// ESCAPE TO CLEAR SEARCH
// ==============================

mapSearchInput.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        mapSearchInput.value = "";
        map.closePopup();

    }

});


// ==============================
// CLICK MAP TO GET LOCATION NAME
// ==============================

map.on("click", async function (event) {

    const latitude = event.latlng.lat;
    const longitude = event.latlng.lng;

    L.popup()
        .setLatLng(event.latlng)
        .setContent("🔍 Finding location...")
        .openOn(map);

    try {

        const url =
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

        const response = await fetch(url);
        const data = await response.json();

        const placeName = data.display_name || "Unknown location";

        L.popup()
            .setLatLng(event.latlng)
            .setContent(`
                <strong>📍 ${placeName}</strong>
                <br><br>
                Latitude: ${latitude.toFixed(5)}
                <br>
                Longitude: ${longitude.toFixed(5)}
            `)
            .openOn(map);

    } catch (error) {

        console.error(error);

        L.popup()
            .setLatLng(event.latlng)
            .setContent(`
                <strong>📍 Location</strong>
                <br><br>
                Latitude: ${latitude.toFixed(5)}
                <br>
                Longitude: ${longitude.toFixed(5)}
            `)
            .openOn(map);
    }

});


// ==============================
// CLEAR MARKER
// ==============================

clearMarkerButton.onclick = function () {

    if (searchMarker) {

        map.removeLayer(searchMarker);
        searchMarker = null;

    }

    map.closePopup();
};


// ==============================
// RESET MAP
// ==============================

resetMapButton.onclick = function () {

    map.setView([9.145, 40.4897], 6);

    map.closePopup();

    mapSearchInput.value = "";

    if (searchMarker) {

        map.removeLayer(searchMarker);
        searchMarker = null;

    }

};
const compassButton = document.getElementById("compassButton");
const compassArrow = document.querySelector(".compass-arrow");
const compassDirection = document.querySelector(".compass-direction");

function updateCompass(event) {
    let heading = null;

    if (typeof event.webkitCompassHeading === "number") {
        heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
        heading = 360 - event.alpha;
    }

    if (heading === null) {
        return;
    }

    heading = (heading + 360) % 360;

    compassArrow.style.transform = `rotate(${heading}deg)`;

    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(heading / 45) % 8;

    compassDirection.textContent = directions[index];
}

async function startCompass() {
    try {
        if (!window.DeviceOrientationEvent) {
            alert("Your device does not support a compass.");
            return;
        }

        if (typeof DeviceOrientationEvent.requestPermission === "function") {
            const permission = await DeviceOrientationEvent.requestPermission();

            if (permission !== "granted") {
                alert("Compass permission was not granted.");
                return;
            }
        }

        window.addEventListener(
            "deviceorientationabsolute",
            updateCompass,
            true
        );

        window.addEventListener(
            "deviceorientation",
            updateCompass,
            true
        );

        compassButton.textContent = "🧭 Compass Active";
        compassButton.disabled = true;

    } catch (error) {
        console.error(error);
        alert("Unable to start the compass.");
    }
}

compassButton.addEventListener("click", startCompass);