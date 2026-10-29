
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const statusMessage = document.getElementById("statusMessage");

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        statusMessage.textContent = "Please enter a city name.";
        return;
    }

    statusMessage.textContent =
        `You searched for ${city}. Weather API will be added next.`;
});
