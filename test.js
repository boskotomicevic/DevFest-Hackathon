var calculatedArea;
var solarghi;

// Dodavanje novih polja za unos tačaka
document.getElementById("add-point").addEventListener("click", function () {
    const pointsContainer = document.getElementById("points-container");
    const newPointRow = document.createElement("div");
    newPointRow.classList.add("row", "point-row");
    newPointRow.innerHTML = `
        <div class="col-md-6">
            <label class="form-label">Latitude:</label>
            <input type="number" class="form-control latitude" placeholder="Enter Latitude" required>
        </div>
        <div class="col-md-6">
            <label class="form-label">Longitude:</label>
            <input type="number" class="form-control longitude" placeholder="Enter Longitude" required>
        </div>
    `;
    pointsContainer.appendChild(newPointRow);
});

// Prikupljanje svih unesenih tačaka i generisanje mape
document.getElementById("generate-map").addEventListener("click", function () {
    const latitudes = document.querySelectorAll(".latitude");
    const longitudes = document.querySelectorAll(".longitude");
    const coordinates = [];

    for (let i = 0; i < latitudes.length; i++) {
        const latitude = parseFloat(latitudes[i].value);
        const longitude = parseFloat(longitudes[i].value);
        if (!isNaN(latitude) && !isNaN(longitude)) {
            coordinates.push({ lat: latitude, lng: longitude });
        }
    }

    if (coordinates.length < 1) {
        alert("Please enter at least one valid coordinate.");
        return;
    }

    // Ako postoji samo jedna tačka, generišemo pravougaonik
    if (coordinates.length === 1) {
        const center = coordinates[0];
        const width = 50; // širina parcele u metrima
        const height = 30; // visina parcele u metrima

        const latOffset = height / 111320;
        const lngOffset = width / (40075000 * Math.cos((center.lat * Math.PI) / 180) / 360);

        coordinates.push(
            { lat: center.lat + latOffset, lng: center.lng - lngOffset }, // Gornji levi
            { lat: center.lat + latOffset, lng: center.lng + lngOffset }, // Gornji desni
            { lat: center.lat - latOffset, lng: center.lng + lngOffset }, // Donji desni
            { lat: center.lat - latOffset, lng: center.lng - lngOffset }  // Donji levi
        );
    }

    // Generisanje mape
    const map = new google.maps.Map(document.getElementById("map-frame"), {
        zoom: 15,
        center: coordinates[0],
        mapTypeId: "satellite",
    });

    // Dodavanje poligona
    const parcelPolygon = new google.maps.Polygon({
        paths: coordinates,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
    });
    parcelPolygon.setMap(map);

    // Izračunavanje površine
    const area = google.maps.geometry.spherical.computeArea(parcelPolygon.getPath());
    document.getElementById("parcel-area").innerText = `Parcel Area: ${area.toFixed(2)} m²`;

    // Pozivanje funkcije za vremensku prognozu za prvu koordinatu
    prognoza(coordinates[0].lat, coordinates[0].lng);
    calculatedArea = area.toFixed(2);
    console.log(calculatedArea);

});
console.log(calculatedArea);
// Funkcija za prikaz vremenske prognoze
function prognoza(latitude, longitude) {
    const apiKey = "R1cnFy2doVvt8MdgSBjcmAXu2vuw3OPD";

    fetch(`https://api.tomorrow.io/v4/timelines?location=${latitude},${longitude}&fields=temperature,cloudCover,solarGHI,uvIndex,sunriseTime,sunsetTime&units=metric&timesteps=1d&apikey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            // Prikaz prognoze u konzoli
            console.log("Danasnja prognoza:", data);

            // Prikaz osnovnih informacija o prognozi na stranici
            const forecast = data.data.timelines[0].intervals[0].values;
            const forecastContainer = document.createElement("div");
            forecastContainer.innerHTML = `
                <h4>Weather Forecast:</h4>
                <p><strong>Temperature:</strong> ${forecast.temperature} °C</p>
                <p><strong>Cloud Cover:</strong> ${forecast.cloudCover} %</p>
                <p><strong>Solar GHI:</strong> ${forecast.solarGHI} W/m²</p>
                <p><strong>UV Index:</strong> ${forecast.uvIndex}</p>
                <p><strong>Sunrise:</strong> ${new Date(forecast.sunriseTime).toLocaleTimeString()}</p>
                <p><strong>Sunset:</strong> ${new Date(forecast.sunsetTime).toLocaleTimeString()}</p>
            `;
            document.body.appendChild(forecastContainer);
        })
        .catch(error => console.error("Greska pri dobijanju prognoze: ", error));
        solarghi =  forecast.solarGHI;
        console.log(solarghi);
}

// 40.7128 lat
// -74.0060 long