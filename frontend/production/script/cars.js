// fetch API
function searchCarApi() {
  let resultDiv = document.getElementById('resultDiv');
  resultDiv.innerHTML = "";

  fetch('http://localhost:3000/api/cars')
    .then(res => res.json())
    .then(carsJson => {
      createResultCards(carsJson);
    });
}

// Render Stars (optional, if needed for rating)
function renderStars(averageRating, ratingCount) {
  const maxStars = 5;
  let html = '<div class="star-rating">';
  for (let i = 1; i <= maxStars; i++) {
    if (averageRating >= i) {
      html += '<span class="fa fa-star text-warning"></span>';
    } else if (averageRating >= i - 0.5) {
      html += '<span class="fa fa-star-half-o text-warning"></span>';
    } else {
      html += '<span class="fa fa-star-o text-warning"></span>';
    }
  }
  html += '</div>';
  if (ratingCount) {
    html += `<span class="text-muted">(${ratingCount})</span>`;
  }
  return html;
}

async function getRatings(id){
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

// Create cards for each car
async function createResultCards(carsJson) {
  for (let i = 0; i < carsJson.length; i++) {
    const car = carsJson[i];

    let colDiv = document.createElement('div');
    colDiv.className = 'col-md-4';

    let cardDiv = document.createElement('div');
    cardDiv.className = 'card mb-4';
    cardDiv.style.width = '18rem';

    const img = document.createElement('img');
    if (car.picture === "" || car.picture == null) {
      img.src = "../src/placeholder.jpg"
    } else {
      img.src = `http://localhost:3000/api/cars/${car.picture.replace(/\\/g, "/")}`;
    }
    img.className = 'card-img-top';
    img.alt = car.name;


    const cardBodyDiv = document.createElement('div');
    cardBodyDiv.className = 'card-body';

    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.innerHTML = `${car.brand} ${car.model} (${car.manufacture_year})`;

    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
      <tbody>
        <tr><th scope="row">Leistung</th><td>${car.hp ?? 'k.A.'} PS</td></tr>
        <tr><th scope="row">Sitze</th><td>${car.seats}</td></tr>
        <tr><th scope="row">Preis</th><td>${car.price} €</td></tr>
        <tr><th scope="row">Verfügbar</th><td>${car.available ? '✅' : '❌'}</td></tr>
        <tr><th scope="row">Kraftstoff</th><td>${car.fuel}</td></tr>
        <tr><th scope="row">Getriebe</th><td>${car.transmission}</td></tr>
        <tr><th scope="row">Türen</th><td>${car.doors}</td></tr>
        <tr><th scope="row">Ort</th><td>${car.location}</td></tr>
        <tr><th scope="row">Extras</th><td>${car.features.join(", ")}</td></tr>
      </tbody>
    `;

    const ratingDiv = document.createElement("div");
    ratingDiv.className = 'container'

    const scrollSpy = document.createElement("div")
    scrollSpy.setAttribute('data-bs-spy',  'scroll');
    scrollSpy.setAttribute('data-bs-root-margin', '0px 0px -40%');

    const ratingJson = await getRatings(car._id);

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
    cardBodyDiv.appendChild(table);

    cardDiv.appendChild(img);
    cardDiv.appendChild(cardBodyDiv);
    cardDiv.appendChild(scrollSpy);
    colDiv.appendChild(cardDiv);
    document.getElementById('resultDiv').appendChild(colDiv);
  }
}

// DOM Ready

document.addEventListener("DOMContentLoaded", () => {
  searchCarApi();
});
