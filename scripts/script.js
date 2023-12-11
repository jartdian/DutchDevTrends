document.addEventListener("DOMContentLoaded", function () {
  let map = L.map("map").setView([52.0907, 5.1214], 8);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  fetch("https://dutch-dev-trends-backend.vercel.app/languages")
    .then((response) => response.json())
    .then((citiesData) => {
      // Loop through the cities and add markers
      Object.keys(citiesData).forEach((cityName) => {
        let city = citiesData[cityName];
        let marker = L.marker(city.coordinates).addTo(map);
        marker.on("click", function () {
          const currentLatLng = marker.getLatLng();

          const adjustedLatLng = L.latLng(
            currentLatLng.lat + 0.15,
            currentLatLng.lng
          );
          // Set the map view to the marker's coordinates when the popup is opened
          marker.on("popupopen", function () {
            map.setView(adjustedLatLng, map.getZoom(), {
              animate: true,
              duration: 1,
            });
          });
        });

        marker.bindPopup(createChartPopup(cityName, city.data));
      });
    })
    .catch((error) => console.error("Error fetching data:", error));

  // Create a Chartjs popup
  function createChartPopup(cityName, data) {
    let popupContent = document.createElement("div");
    popupContent.innerHTML =
      '<canvas id="chart" width="100%" height="100%"></canvas>';
    let ctx = popupContent.querySelector("#chart").getContext("2d");
    let languages = Object.keys(data);
    let values = Object.values(data); 
    let decodedLanguages = languages.map((label) =>
      decodeURIComponent(label.toLowerCase())
    );

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: decodedLanguages,
        datasets: [
          {
            data: values,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            label: cityName,
          },
        ],
      },
      options: {
        indexAxis: "y",
        scales: {
          y: {
            beginAtZero: false,
          },
        },
      },
    });

    return popupContent;
  }
});
