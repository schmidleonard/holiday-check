const apiUrl = "http://localhost:3000/hotel";

window.addEventListener("DOMContentLoaded", async () => {
  const listContainer = document.getElementById("hotel-list");

  try {
    const response = await fetch(apiUrl);
    const hotels = await response.json();


    hotels.forEach(hotel => {
      const col = document.createElement("div");
      col.className = "col";
      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div id="carousel-${hotel._id}" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
              ${hotel.pictures.map((pic, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                  <img src="http://localhost:3000/${pic}" class="d-block w-100" alt="Hotelbild">
                </div>
              `).join('')}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${hotel._id}" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carousel-${hotel._id}" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
            </button>
          </div>
          <div class="card-body">
            <h5 class="card-title">${hotel.name}</h5>
            <p class="card-text">${hotel.city} – ${hotel.type}</p>
            <button class="btn btn-primary" onclick='showDetails(${JSON.stringify(hotel)})'>Details ansehen</button>
          </div>
        </div>`;
      listContainer.appendChild(col);
    });
  } catch (error) {
    listContainer.innerHTML = `<div class="alert alert-danger">Fehler beim Laden der Hotels.</div>`;
  }
});

function showDetails(hotel) {
  const content = document.getElementById("hotel-detail-content");
  const carouselInner = document.getElementById("detail-carousel-inner");

  carouselInner.innerHTML = hotel.pictures.map((pic, index) => `
    <div class="carousel-item ${index === 0 ? 'active' : ''}">
      <img src="http://localhost:3000/${pic}" class="d-block w-100" alt="Hotelbild">
    </div>
  `).join("");

  content.innerHTML = `
    <h5>${hotel.name}</h5>
    <p>${hotel.description}</p>
    <ul>
      <li><strong>Ort:</strong> ${hotel.city}, ${hotel.adress}</li>
      <li><strong>Preis/Nacht:</strong> ${hotel.pricePerNight} €</li>
      <li><strong>Gästeanzahl:</strong> max. ${hotel.maxGuests}</li>
      <li><strong>Verfügbar:</strong> ${hotel.isAvailable ? "Ja" : "Nein"}</li>
      <li><strong>Rauchen erlaubt:</strong> ${hotel.smokingAllowed ? "Ja" : "Nein"}</li>
      <li><strong>Haustiere erlaubt:</strong> ${hotel.petsAllowed ? "Ja" : "Nein"}</li>
      <li><strong>Ausstattung:</strong> ${hotel.amenities?.join(", ") || "keine"}</li>
    </ul>
  `;

  const modal = new bootstrap.Modal(document.getElementById('hotelDetailModal'));
  modal.show();
}
