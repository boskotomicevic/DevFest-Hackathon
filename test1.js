let calculatedArea;
let solarGhi;

// Generisanje mape i izračunavanje površine na osnovu dve koordinate
document.getElementById("generate-map").addEventListener("click", function () {
    const latitude1 = parseFloat(document.getElementById("latitude1").value);
    const longitude1 = parseFloat(document.getElementById("longitude1").value);
    const latitude2 = parseFloat(document.getElementById("latitude2").value);
    const longitude2 = parseFloat(document.getElementById("longitude2").value);

    if (isNaN(latitude1) || isNaN(longitude1) || isNaN(latitude2) || isNaN(longitude2)) {
        alert("Please enter valid coordinates.");
        return;
    }

    // Izračunavanje dodatnih koordinata za pravougaonik
    const coordinates = [
        { lat: latitude1, lng: longitude1 },
        { lat: latitude1, lng: longitude2 },
        { lat: latitude2, lng: longitude2 },
        { lat: latitude2, lng: longitude1 },
        { lat: latitude1, lng: longitude1 }, // Zatvaranje pravougaonika
    ];

    // Generisanje mape
    const mapFrame = document.getElementById("map-frame");
    const map = new google.maps.Map(mapFrame, {
        zoom: 15,
        center: coordinates[0],
        mapTypeId: "satellite",
    });

    // Dodavanje poligona na mapu
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
    calculatedArea = area.toFixed(2);
    document.getElementById("parcel-area").innerText = `Parcel Area: ${calculatedArea} m²`;

    // Pozivanje funkcije za vremensku prognozu
    getWeatherData(latitude1, longitude1);
});

// Dobavljanje vremenske prognoze
function getWeatherData(latitude, longitude) {
    const apiKey = "R1cnFy2doVvt8MdgSBjcmAXu2vuw3OPD";

    fetch(`https://api.tomorrow.io/v4/timelines?location=${latitude},${longitude}&fields=solarGHI&units=metric&timesteps=1d&apikey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const forecast = data.data.timelines[0].intervals[0].values;
            solarGhi = forecast.solarGHI;
            console.log(`Solar GHI: ${solarGhi} W/m²`);

            // Kada imamo `calculatedArea` i `solarGhi`, šaljemo Gemini API-ju
            if (calculatedArea && solarGhi) {
                sendToGeminiAPI(calculatedArea, solarGhi);
            }
        })
        .catch(error => console.error("Greška pri dobijanju prognoze:", error));
}

// Slanje podataka Gemini AI API-ju
function sendToGeminiAPI(area, ghi) {
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    const apiKey = "AIzaSyDSh2PEpw0lwE0OIKKpbYhPE6MUsVzAT3Y";

    fetch(`${apiUrl}?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: `Calculate solar panel recommendations for a parcel area of ${area} m² and a solar GHI of ${ghi} W/m².`,
                        },
                    ],
                },
            ],
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log("Gemini AI Response:", data);

            const resultsContainer = document.getElementById("results-container");
            resultsContainer.innerHTML = `
                <h4>Solar Recommendations:</h4>
                <p><strong>Recommended Solar Panels:</strong> ${data.recommendedPanels}</p>
                <p><strong>Cost Effectiveness:</strong> ${data.costEffectiveness}</p>
                <p><strong>Estimated Savings:</strong> ${data.estimatedSavings} €</p>
            `;
        })
        .catch(error => console.error("Greška pri slanju podataka Gemini AI API-ju:", error));
}
