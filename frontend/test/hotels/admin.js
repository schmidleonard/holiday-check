const apiUrl = "http://localhost:3000/hotel";

const form = document.getElementById("hotelForm");
const list = document.getElementById("admin-hotel-list");

async function loadHotels() {
  list.innerHTML = "<p>Loading...</p>";
  const res = await fetch(apiUrl);
  const hotels = await res.json();

  list.innerHTML = "";
  hotels.forEach(hotel => {
    const div = document.createElement("div");
    div.className = "col";
    div.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${hotel.name}</h5>
          <p class="card-text">${hotel.city} – ${hotel.type}</p>
          <button class="btn btn-primary btn-sm" onclick='editHotel(${JSON.stringify(hotel)})'>Bearbeiten</button>
          <button class="btn btn-danger btn-sm ms-2" onclick='deleteHotel("${hotel._id}")'>Löschen</button>
        </div>
      </div>`;
    list.appendChild(div);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  const id = document.getElementById("hotelId").value;

  formData.append("name", document.getElementById("name").value);
  formData.append("type", document.getElementById("type").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("amenities", document.getElementById("amenities").value);
  formData.append("maxGuests", document.getElementById("maxGuests").value);
  formData.append("pricePerNight", document.getElementById("pricePerNight").value);
  formData.append("city", document.getElementById("city").value);
  formData.append("adress", document.getElementById("adress").value);
  formData.append("isAvailable", document.getElementById("isAvailable").checked);
  formData.append("smokingAllowed", document.getElementById("smokingAllowed").checked);
  formData.append("petsAllowed", document.getElementById("petsAllowed").checked);

  const files = document.getElementById("photos").files;
  for (let file of files) formData.append("photos", file);

  try {
    const method = id ? "PUT" : "POST";
    const url = id ? `${apiUrl}/${id}` : apiUrl;

    const res = await fetch(url, {
      method,
      body: formData
    });

    if (!res.ok) throw new Error("Fehler beim Speichern");

    form.reset();
    document.getElementById("hotelId").value = "";
    loadHotels();
  } catch (err) {
    alert("Fehler: " + err.message);
  }
});

function editHotel(hotel) {
  document.getElementById("hotelId").value = hotel._id;
  document.getElementById("name").value = hotel.name;
  document.getElementById("type").value = hotel.type;
  document.getElementById("description").value = hotel.description || "";
  document.getElementById("amenities").value = hotel.amenities?.join(", ") || "";
  document.getElementById("maxGuests").value = hotel.maxGuests;
  document.getElementById("pricePerNight").value = hotel.pricePerNight;
  document.getElementById("city").value = hotel.city;
  document.getElementById("adress").value = hotel.adress;
  document.getElementById("isAvailable").checked = hotel.isAvailable;
  document.getElementById("smokingAllowed").checked = hotel.smokingAllowed;
  document.getElementById("petsAllowed").checked = hotel.petsAllowed;
}

async function deleteHotel(id) {
  if (!confirm("Wirklich löschen?")) return;

  try {
    const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Fehler beim Löschen");
    loadHotels();
  } catch (err) {
    alert("Fehler: " + err.message);
  }
}

loadHotels();
