
// fetch API
function searchProductApi() {
  let resultDiv = document.getElementById('resultDiv');

  resultDiv.innerHTML = "";

  fetch('http://localhost:3000/api/hotels').then(res => res.json()).then(hotelsJson => {
    createResultCards(hotelsJson);
  })
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
  const hotelRes = await fetch('http://localhost:3000/api/hotels/' + id);

  const hotelJson = await hotelRes.json();
  const ratingJson = await getRatings(id);

  renderDetails(hotelJson, ratingJson);
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


function renderDetails(hotelJson, ratingJson) {
  const hotel = hotelJson;
  const rating = ratingJson;
  let petsAllowed = hotel.petsAllowed ? "✅" : "❌";
  let smokingAllowed = hotel.smokingAllowed ? "✅" : "❌";

  const modalTemplate = document.getElementById('hotel-modal-template');
  const modalClone = modalTemplate.content.cloneNode(true);
  const modalElement = modalClone.querySelector('#hotelModal');

  modalClone.querySelector('#hotelTitelModal').textContent = hotel.name;
  modalClone.querySelector('#hoteldescriptionModal').textContent = hotel.description;

  modalClone.querySelector('.city-cell').textContent = hotel.city || 'k.A.';
  modalClone.querySelector('.type-cell').textContent = hotel.type || 'k.A.';
  modalClone.querySelector('.price-cell').textContent = `${hotel.pricePerNight || 'k.A.'} €`;
  modalClone.querySelector('.guests-cell').textContent = hotel.maxGuests ?? 'k.A.';
  modalClone.querySelector('.pets-cell').textContent = petsAllowed;
  modalClone.querySelector('.smoking-cell').textContent = smokingAllowed;

  // Bilder
  const carouselInner = modalClone.querySelector('.carousel-inner');
  carouselInner.innerHTML = '';
  if (hotel.pictures && hotel.pictures.length > 0) {
    hotel.pictures.forEach((src, i) => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('carousel-item');
      if (i === 0) itemDiv.classList.add('active');

      const img = document.createElement('img');
      img.src = `http://localhost:3000/api/hotels/${src.replace(/\\/g, "/")}`;
      img.classList.add('d-block', 'w-100');
      img.alt = `Bild ${i + 1}`;

      itemDiv.appendChild(img);
      carouselInner.appendChild(itemDiv);
    });
  } else {
    const fallback = document.createElement('div');
    fallback.className = 'carousel-item active';
    fallback.innerHTML = `<img src="../src/placeholder.jpg" class="d-block w-100" alt="Platzhalterbild">`;
    carouselInner.appendChild(fallback);
  }

  const modalContainer = document.getElementById('modalContainer');
  modalContainer.innerHTML = '';
  modalContainer.appendChild(modalClone);

  const ratingResultDiv = document.getElementById("ratingResultDiv");


  const ratingTemplate = document.getElementById('hotel-rating-template');
  const ratingClone = ratingTemplate.content.cloneNode(true);
  const ratingRoot = ratingClone.querySelector('#hotelRating');
  const averageContainer = ratingRoot.querySelector('#averageRating');

  if (!rating || rating.length === 0) {
    // No ratings
    averageContainer.innerHTML = renderStars(0, 0);
  } else {
    // show average
    averageContainer.innerHTML = renderStars(hotel.averageRating, hotel.ratingCount);

    // single ratings
    const spyContainer = ratingRoot.querySelector('#spyContainer');

    rating.forEach((r) => {
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
      spyContainer.appendChild(row);
    });
  }


  ratingResultDiv.appendChild(ratingClone);


  const bsModal = new bootstrap.Modal(modalElement);
  bsModal.show();

  modalElement.addEventListener('hidden.bs.modal', () => {
    modalElement.remove();
  });
}


//create a Card Element for each Hotel 
function createResultCards(hotelsJson) {


  console.log(hotelsJson);


  for (i = 0; i < hotelsJson.length; i++) {
    const hotel = hotelsJson[i];

    let colDiv = document.createElement('div');
    colDiv.setAttribute('class', 'col-md-4');

    let cardDiv = document.createElement('div');
    cardDiv.setAttribute('class', 'card');
    cardDiv.setAttribute('style', 'width: 18rem;');


    let cardElement = document.createElement('div');
    cardElement.setAttribute('class', 'card');

    cardElement.setAttribute('style', 'width: 18rem');


    if (i > 2) {
      cardElement.setAttribute('class', 'card mt-3');
    }

    // add carousel to card
    const carousel = document.createElement('div');
    carousel.id = `carouselHotel${i}`;
    carousel.className = 'carousel slide';
    carousel.setAttribute('data-bs-ride', 'carousel');

    const inner = document.createElement('div');
    inner.className = 'carousel-inner';

    // add pictures
    if (!hotel.pictures || hotel.pictures.length === 0) {
      const item = document.createElement('div');
      item.className = 'carousel-item active';

      const img = document.createElement('img');
      img.src = '../src/placeholder.jpg';
      img.className = 'd-block w-100';
      img.alt = 'Platzhalterbild';

      item.appendChild(img);
      inner.appendChild(item);
    } else {
      hotel.pictures.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'carousel-item';
        if (index === 0) item.classList.add('active');

        const img = document.createElement('img');
        const cleanedPath = src.replace(/\\/g, "/");
        const imageUrl = `http://localhost:3000/api/hotels/${cleanedPath}`;
        img.src = imageUrl;
        img.className = 'd-block w-100';
        img.alt = `Bild ${index + 1}`;

        item.appendChild(img);
        inner.appendChild(item);
      });
      // Navigation
      const prevButton = document.createElement('button');
      prevButton.className = 'carousel-control-prev';
      prevButton.type = 'button';
      prevButton.setAttribute('data-bs-target', `#carouselHotel${i}`);
      prevButton.setAttribute('data-bs-slide', 'prev');
      prevButton.innerHTML = `
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  `;

      const nextButton = document.createElement('button');
      nextButton.className = 'carousel-control-next';
      nextButton.type = 'button';
      nextButton.setAttribute('data-bs-target', `#carouselHotel${i}`);
      nextButton.setAttribute('data-bs-slide', 'next');
      nextButton.innerHTML = `
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  `;
      carousel.appendChild(prevButton);
      carousel.appendChild(nextButton);
    }
    carousel.appendChild(inner);


    let cardBodyDiv = document.createElement('div');
    cardBodyDiv.setAttribute('class', 'card-body');

    let cardTitle = document.createElement('h5');
    cardTitle.setAttribute('class', 'card-title');
    cardTitle.innerHTML = hotel.name;

    const template = document.getElementById('info-table-template');
    const tableClone = template.content.cloneNode(true);

    tableClone.querySelector('.city-cell').textContent = hotel.city || 'k.A.';
    tableClone.querySelector('.type-cell').textContent = hotel.type || 'k.A.';
    tableClone.querySelector('.price-cell').textContent = `${hotel.pricePerNight || 'k.A.'} €`;
    tableClone.querySelector('.guests-cell').textContent = hotel.maxGuests ?? 'k.A.';
    tableClone.querySelector('.rating-cell').innerHTML = renderStars(hotel.averageRating, hotel.ratingCount);



    let detailButton = document.createElement('button');
    detailButton.setAttribute("type", "button");
    detailButton.setAttribute("class", "btn btn-primary");
    detailButton.innerHTML = "Details anzeigen";

    detailButton.dataset.hotelId = hotel._id;

    detailButton.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.hotelId;
      showDetails(id);
    });

    cardBodyDiv.appendChild(cardTitle);
    cardBodyDiv.appendChild(tableClone);
    cardBodyDiv.appendChild(detailButton);



    cardElement.appendChild(carousel);
    cardElement.appendChild(cardBodyDiv);


    colDiv.appendChild(cardElement);

    document.getElementById('resultDiv').appendChild(colDiv);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  searchProductApi();
});
