
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
        case "Singapore":
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

async function getRatings(id) {
    try {
        const response = await fetch('http://localhost:3000/api/ratings/' + id);

        const contentType = response.headers.get("Content-Type");
        const isJson = contentType && contentType.includes("application/json");

        if (!response.ok || !isJson) {
            const text = await response.text();
            throw new Error(`Fehler ${response.status}: ${text}`);
        }

        const json = await response.json();
        return json;
    } catch (err) {
        console.error("Error while loading ratings", err.message);
        return [];
    }
}

// create Card Element for each flight
async function createResultCards(flightsJson) {
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

        const ratingDiv = document.createElement("div");
        ratingDiv.className = 'container'

        const scrollSpy = document.createElement("div")
        scrollSpy.setAttribute('data-bs-spy', 'scroll');
        scrollSpy.setAttribute('data-bs-root-margin', '0px 0px -40%');

        const ratingJson = await getRatings(flight._id);

        ratingJson.forEach((r) => {
            const row = document.createElement('div');
            row.className = 'row border-bottom py-2';

            const starsCol = document.createElement('div');
            starsCol.className = 'col-md-4';
            starsCol.innerHTML = `
        <div class="star-rating mb-1">
          ${renderStars(r.rating)} <strong>${r.userName}</strong>
        </div>`;

            const commentCol = document.createElement('div');
            commentCol.className = 'col-md-8';

            if (r.comment) {
                commentCol.innerHTML = `<p class="mb-1">${r.comment}</p>`;
            }

            const date = new Date(r.createdAt);
            const formattedDate = date.toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const dateDiv = document.createElement('div');
            dateDiv.className = 'text-start text-muted small';
            dateDiv.textContent = `Erstellt am: ${formattedDate}`;

            commentCol.appendChild(dateDiv);
            row.appendChild(starsCol);
            row.appendChild(commentCol);
            scrollSpy.appendChild(row);
        });

        cardBodyDiv.appendChild(cardTitle);
        cardBodyDiv.appendChild(list);
        cardBodyDiv.appendChild(scrollSpy);
        cardElement.appendChild(img);
        cardElement.appendChild(cardBodyDiv);

        colDiv.appendChild(cardElement);
        resultDiv.appendChild(colDiv);
    }
}



document.addEventListener("DOMContentLoaded", () => {
    searchFlightApi();
});
