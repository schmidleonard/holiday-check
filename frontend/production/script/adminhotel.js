// Fetch hotels from API and render cards
function searchProductApi() {
  const resultDiv = document.getElementById('resultDiv');
  resultDiv.innerHTML = "";

  fetch('http://localhost:3000/api/hotels')
    .then(res => res.json())
    .then(hotelsJson => {
      createResultCards(hotelsJson);
    });
}

// Render rating stars
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

let editMode = false;
let currentEditId = null;

// Render hotel cards
function createResultCards(hotelsJson) {
  for (let i = 0; i < hotelsJson.length; i++) {
    const hotel = hotelsJson[i];
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-4';

    const cardElement = document.createElement('div');
    cardElement.className = 'card mb-4';
    cardElement.style.width = '18rem';

    const carousel = document.createElement('div');
    carousel.id = `carouselHotel${i}`;
    carousel.className = 'carousel slide';
    carousel.setAttribute('data-bs-ride', 'carousel');

    const inner = document.createElement('div');
    inner.className = 'carousel-inner';

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

      const prevButton = document.createElement('button');
      prevButton.className = 'carousel-control-prev';
      prevButton.type = 'button';
      prevButton.setAttribute('data-bs-target', `#carouselHotel${i}`);
      prevButton.setAttribute('data-bs-slide', 'prev');
      prevButton.innerHTML = `
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>`;

      const nextButton = document.createElement('button');
      nextButton.className = 'carousel-control-next';
      nextButton.type = 'button';
      nextButton.setAttribute('data-bs-target', `#carouselHotel${i}`);
      nextButton.setAttribute('data-bs-slide', 'next');
      nextButton.innerHTML = `
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>`;

      carousel.appendChild(prevButton);
      carousel.appendChild(nextButton);
    }
    carousel.appendChild(inner);

    const cardBodyDiv = document.createElement('div');
    cardBodyDiv.className = 'card-body';

    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.innerHTML = hotel.name;

    const template = document.getElementById('info-table-template');
    const tableClone = template.content.cloneNode(true);

    tableClone.querySelector('.city-cell').textContent = hotel.city || 'k.A.';
    tableClone.querySelector('.type-cell').textContent = hotel.type || 'k.A.';
    tableClone.querySelector('.price-cell').textContent = `${hotel.pricePerNight || 'k.A.'} €`;
    tableClone.querySelector('.guests-cell').textContent = hotel.maxGuests ?? 'k.A.';
    tableClone.querySelector('.rating-cell').innerHTML = renderStars(hotel.averageRating, hotel.ratingCount);

    // Edit button
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'btn btn-warning me-2';
    editButton.innerText = 'Hotel bearbeiten';

    editButton.addEventListener('click', () => {
      document.getElementById('Hotelname').value = hotel.name;
      document.getElementById('hotelCity').value = hotel.city;
      document.getElementById('hotelAdress').value = hotel.adress;
      document.getElementById('hotelType').value = hotel.type;
      document.getElementById('pricePerNight').value = hotel.pricePerNight;
      document.getElementById('maxGuests').value = hotel.maxGuests;
      document.getElementById('smokingAllowed').value = hotel.smokingAllowed ? 'true' : 'false';
      document.getElementById('petsAllowed').value = hotel.petsAllowed ? 'true' : 'false';
      document.getElementById('description').value = hotel.description ?? "";
      document.getElementById('amenities').value = hotel.amenities ? hotel.amenities.join(", ") : "";

      const photoInput = document.querySelector('input[name="photos"]');
      if (photoInput) {
        photoInput.required = true;
      }

      document.getElementById('createHotelForm').scrollIntoView({ behavior: 'smooth', block: 'start' });

      editMode = true;
      currentEditId = hotel._id;

      const submitBtn = document.getElementById('submitFormButton');
      submitBtn.textContent = "Änderungen speichern";
      submitBtn.classList.remove("btn-success");
      submitBtn.classList.add("btn-warning");
    });

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-danger';
    deleteButton.innerText = 'Löschen';

    deleteButton.addEventListener('click', async () => {
      const confirmed = confirm(`Hotel "${hotel.name}" wirklich löschen?`);
      if (!confirmed) return;

      try {
        const res = await fetch(`http://localhost:3000/api/hotels/admin/${hotel._id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
          }
        });

        const data = await res.json();
        if (!res.ok) {
          alert("Fehler: " + (data.message || "Löschen fehlgeschlagen"));
          return;
        }

        alert("Hotel erfolgreich gelöscht");
        searchProductApi();
      } catch (err) {
        alert("Fehler: " + err.message);
      }
    });

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'd-flex justify-content-between mt-3';
    buttonGroup.appendChild(editButton);
    buttonGroup.appendChild(deleteButton);

    cardBodyDiv.appendChild(cardTitle);
    cardBodyDiv.appendChild(tableClone);
    cardBodyDiv.appendChild(buttonGroup);

    cardElement.appendChild(carousel);
    cardElement.appendChild(cardBodyDiv);
    colDiv.appendChild(cardElement);
    document.getElementById('resultDiv').appendChild(colDiv);
  }
}

// Form submit handler
document.getElementById("createHotelForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const url = editMode
    ? `http://localhost:3000/api/hotels/admin/${currentEditId}`
    : "http://localhost:3000/api/hotels/admin";
  const method = editMode ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
      },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error: " + (data.message || "Vorgang fehlgeschlagen"));
      return;
    }

    alert(editMode ? "Hotel aktualisiert" : "Hotel erstellt");
    form.reset();

    // Reset to create mode after editing
    editMode = false;
    currentEditId = null;
    const submitBtn = document.getElementById('submitFormButton');
    submitBtn.textContent = "Hotel erstellen";
    submitBtn.classList.remove("btn-warning");
    submitBtn.classList.add("btn-success");

    // Ensure photo input is required again
    const photoInput = document.querySelector('input[name="photos"]');
    if (photoInput) {
      photoInput.required = true;
    }

    searchProductApi();
  } catch (err) {
    alert("Error: " + err.message);
  }
});

// Load hotels on page load
document.addEventListener("DOMContentLoaded", () => {
  searchProductApi();
});
