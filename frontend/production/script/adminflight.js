// Fetch flights from API and render cards
function searchFlightApi() {
  const resultDiv = document.getElementById('resultDiv');
  resultDiv.innerHTML = "";

  fetch('http://localhost:3000/api/flights')
    .then(res => res.json())
    .then(flightsJson => {
      createFlightCards(flightsJson);
    });
}

let editFlightMode = false;
let currentFlightEditId = null;

// Render flight cards
function createFlightCards(flightsJson) {
  for (let i = 0; i < flightsJson.length; i++) {
    const flight = flightsJson[i];
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-4';

    const cardElement = document.createElement('div');
    cardElement.className = 'card mb-4';
    cardElement.style.width = '18rem';

    const cardBodyDiv = document.createElement('div');
    cardBodyDiv.className = 'card-body';

    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textContent = `Flug: ${flight.flightNumber}`;

    const list = document.createElement('ul');
    list.className = 'list-group list-group-flush';
    list.innerHTML = `
      <li class="list-group-item">Von: ${flight.departure?.city ?? 'k.A.'} (${flight.departure?.airportCode})</li>
      <li class="list-group-item">Nach: ${flight.destination?.city ?? 'k.A.'} (${flight.destination?.airportCode})</li>
      <li class="list-group-item">Airline: ${flight.airline}</li>
      <li class="list-group-item">Abflug: ${new Date(flight.departure_time).toLocaleString()}</li>
      <li class="list-group-item">Ankunft: ${new Date(flight.scheduled_time).toLocaleString()}</li>
      <li class="list-group-item">Preis: ${flight.price} €</li>
      <li class="list-group-item">Freie Plätze: ${flight.available_seats ?? 'k.A.'}</li>
    `;

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-warning me-2";
    editBtn.textContent = "Bearbeiten";
    editBtn.addEventListener("click", () => {
      document.getElementById('flightNumber').value = flight.flightNumber;
      document.getElementById('departureCode').value = flight.departure.airportCode;
      document.getElementById('departureCity').value = flight.departure.city;
      document.getElementById('departureCountry').value = flight.departure.country;
      document.getElementById('destinationCode').value = flight.destination.airportCode;
      document.getElementById('destinationCity').value = flight.destination.city;
      document.getElementById('destinationCountry').value = flight.destination.country;
      document.getElementById('aircraft').value = flight.aircraft;
      document.getElementById('airline').value = flight.airline;
      document.getElementById('departureTime').value = flight.departure_time.slice(0, 16);
      document.getElementById('scheduledTime').value = flight.scheduled_time.slice(0, 16);
      document.getElementById('price').value = flight.price;
      document.getElementById('availableSeats').value = flight.available_seats;

      editFlightMode = true;
      currentFlightEditId = flight._id;

      const btn = document.getElementById('submitFlightFormButton');
      btn.textContent = "Änderungen speichern";
      btn.classList.remove("btn-success");
      btn.classList.add("btn-warning");

      document.getElementById('createFlightForm').scrollIntoView({ behavior: 'smooth' });
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger";
    deleteBtn.textContent = "Löschen";
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Flug "${flight.flightNumber}" wirklich löschen?`)) return;

      const res = await fetch(`http://localhost:3000/api/flights/admin/${flight._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
        }
      });

      const result = await res.json();
      if (!res.ok) return alert("Fehler: " + (result.message || "Löschen fehlgeschlagen"));
      alert("Flug gelöscht");
      searchFlightApi();
    });

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'd-flex justify-content-between mt-3';
    buttonGroup.appendChild(editBtn);
    buttonGroup.appendChild(deleteBtn);

    cardBodyDiv.appendChild(cardTitle);
    cardBodyDiv.appendChild(list);
    cardBodyDiv.appendChild(buttonGroup);

    cardElement.appendChild(cardBodyDiv);
    colDiv.appendChild(cardElement);
    document.getElementById('resultDiv').appendChild(colDiv);
  }
}

// Submit handler für Flights
document.getElementById("createFlightForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;

  const formData = {
    flightNumber: form.flightNumber.value,
    departure: {
      airportCode: form.departureCode.value,
      city: form.departureCity.value,
      country: form.departureCountry.value
    },
    destination: {
      airportCode: form.destinationCode.value,
      city: form.destinationCity.value,
      country: form.destinationCountry.value
    },
    aircraft: form.aircraft.value,
    airline: form.airline.value,
    departure_time: form.departureTime.value,
    scheduled_time: form.scheduledTime.value,
    price: Number(form.price.value),
    available_seats: Number(form.availableSeats.value)
  };

  const url = editFlightMode
    ? `http://localhost:3000/api/flights/admin/${currentFlightEditId}`
    : `http://localhost:3000/api/flights/admin`;

  const method = editFlightMode ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
      },
      body: JSON.stringify(formData)
    });

    const result = await res.json();
    if (!res.ok) return alert("Fehler: " + (result.message || "Vorgang fehlgeschlagen"));

    alert(editFlightMode ? "Flug aktualisiert" : "Flug erstellt");
    form.reset();
    editFlightMode = false;
    currentFlightEditId = null;

    const btn = document.getElementById('submitFlightFormButton');
    btn.textContent = "Flug erstellen";
    btn.classList.remove("btn-warning");
    btn.classList.add("btn-success");

    searchFlightApi();
  } catch (err) {
    alert("Fehler: " + err.message);
  }
});

// On page load
document.addEventListener("DOMContentLoaded", () => {
  searchFlightApi();
});
