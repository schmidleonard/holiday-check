
// fetch API
function searchFlightApi() {
    let resultDiv = document.getElementById('resultDiv');

    resultDiv.innerHTML = "";

    fetch('http://localhost:3000/api/flights').then(res => res.json()).then(flightsJson => {
        console.log(flightsJson);
        createResultCards(flightsJson);
    })
}

function getAirlineImg(airlineName) {
    const airline = airlineName;
    let src;
    switch (airline) {
        case "Easyjet":
            src = "../src/airlines/easyjet.png";
            break;
        case "Eurowings":
            src = "../src/airlines/eurowings.png";
            break;
        case "Lufthansa":
            src = "../src/airlines/lufthansa.webp";
            break;
        case "Ryanair":
            src = "../src/airlines/ryanair.jpg";
            break;
        case "Singapore Airline":
            src = "../src/airlines/singapore.png"
            break;
        default:
            src = "../src/placeholder.jpg";
            break;
    }
    return src;
}


// Renders Stars for average Rating

function renderStars(averageRating, ratingCount) {

    const maxStars = 5;
    let html = '<div class="star-rating">';
    for (let i = 1; i <= maxStars; i++) {
        if (averageRating >= i) {
            // full stars
            html += '<span class="fa fa-star text-warning"></span>';
        } else if (averageRating >= i - 0.5) {
            // half stars
            html += '<span class="fa fa-star-half-o text-warning"></span>';
        } else {
            // empty stars
            html += '<span class="fa fa-star-o text-warning"></span>';
        }
    }
    html += '</div>';
    if (ratingCount) {
        html += `<span class="text-muted">(${ratingCount})</span>`;
    }
    return html;
}



async function showDetails(id) {
    const flightRes = await fetch('http://localhost:3000/api/flights/' + id);

    const flightJson = await flightRes.json();
    console.log(flightJson);

    renderDetails(flightJson);
}

function renderDetails(flightJson, ratingJson) {
    const flight = flightJson;
    const rating = ratingJson;

    const modalTemplate = document.getElementById('flight-modal-template');
    const modalClone = modalTemplate.content.cloneNode(true);
    const modalElement = modalClone.querySelector('#flightModal');

    modalClone.querySelector('#flightTitelModal').textContent = `Flug: ${flight.flightNumber || 'k.A.'}`;

    /*modalClone.querySelector('.departure-cell').textContent = `${flight.departure.city} ', ' ${flight.departure.country}` || 'k.A.';
    modalClone.querySelector('.destination-cell').textContent = `${flight.destination.city} ', ' ${flight.destination.country}` || 'k.A.';*/
    modalClone.querySelector('.airline-cell').textContent = flight.airline ?? 'k.A.';
    modalClone.querySelector('.departure-time-cell').textContent = flight.departure_time ?? 'k.A.';
    modalClone.querySelector('.sheduled-time-cell').textContent = flight.destination_time ?? 'k.A.';
    modalClone.querySelector('.aircraft-cell').textContent = flight.aircraft ?? 'k.A.';
    modalClone.querySelector('.price-cell').textContent = `${flight.price || 'k.A.'} €`;

    // Picture
    // Picture
const img = modalClone.querySelector("#airline-picture-modal");
      img.src = getAirlineImg(flight.airline);




    const modalContainer = document.getElementById('modalContainer');
    modalContainer.innerHTML = '';
    modalContainer.appendChild(modalClone);

    const bsModal = new bootstrap.Modal(modalElement);
    bsModal.show();

    modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
    });
}

// create Card Element for each flight
function createResultCards(flightsJson) {
    console.log(flightsJson);
    const resultDiv = document.getElementById('resultDiv');
    resultDiv.innerHTML = '';

    for (let i = 0; i < flightsJson.length; i++) {
        const flight = flightsJson[i];

        let colDiv = document.createElement('div');
        colDiv.setAttribute('class', 'col-md-4');

        let cardElement = document.createElement('div');
        cardElement.setAttribute('class', 'card mb-3');
        //cardElement.setAttribute('style', 'width: 22rem');

        // Image
        const img = document.createElement('img');
        img.src = getAirlineImg(flight.airline);

        img.className = 'd-block w-100';
        img.alt = flight.flightNumber;

        // Card Body
        let cardBodyDiv = document.createElement('div');
        cardBodyDiv.setAttribute('class', 'card-body');

        let cardTitle = document.createElement('h5');
        cardTitle.setAttribute('class', 'card-title');
        cardTitle.innerHTML = `Flug: ${flight.flightNumber}`;

        let detailButton = document.createElement('button');
        detailButton.setAttribute("type", "button");
        detailButton.setAttribute("class", "btn btn-primary");
        detailButton.innerHTML = "Details anzeigen";
        detailButton.dataset.flightId = flight._id;
        detailButton.addEventListener("click", (e) => {
            const id = e.currentTarget.dataset.flightId;
            console.log(id);
            showDetails(id);
        });
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

        cardBodyDiv.appendChild(cardTitle);
        cardBodyDiv.appendChild(list);
        cardBodyDiv.appendChild(detailButton);

        cardElement.appendChild(img);
        cardElement.appendChild(cardBodyDiv);

        colDiv.appendChild(cardElement);
        resultDiv.appendChild(colDiv);
    }
}



document.addEventListener("DOMContentLoaded", () => {
    searchFlightApi();
});
