// Fetch ratings from API and render cards
function searchRatingApi() {
  const resultDiv = document.getElementById('resultDiv');
  resultDiv.innerHTML = "";

  fetch('http://localhost:3000/api/ratings/admin')
    .then(res => res.json())
    .then(ratingsJson => {
      createRatingCards(ratingsJson);
    });
}

let editRatingMode = false;
let currentRatingEditId = null;

// Render rating cards
function createRatingCards(ratingsJson) {
  for (let i = 0; i < ratingsJson.length; i++) {
    const rating = ratingsJson[i];
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-4';

    const cardElement = document.createElement('div');
    cardElement.className = 'card mb-4';
    cardElement.style.width = '18rem';

    const cardBodyDiv = document.createElement('div');
    cardBodyDiv.className = 'card-body';

    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textContent = `Rating: ${rating._id}`;

    const list = document.createElement('ul');
    list.className = 'list-group list-group-flush';
    list.innerHTML = `
      <li class="list-group-item">Rating ID: ${rating._id ?? 'k.A.'} </li>
      <li class="list-group-item">Object ID: ${rating.objectId ?? 'k.A.'}</li>
      <li class="list-group-item">Object Typ: ${rating.objectType}</li>
      <li class="list-group-item">User ID: ${rating.userId ?? 'k.A.'}</li>
      <li class="list-group-item">User Name: ${rating.userName ?? 'k.A.'}</li>
      <li class="list-group-item">Kommentar: ${rating.comment ?? 'k.A.'}</li>
      <li class="list-group-item">bewertung: ${rating.rating ?? 'k.A.'}</li>
      <li class="list-group-item">Erstellt am: ${new Date(rating.createdAt).toLocaleString("de-DE") ?? 'k.A.'}</li>
    `;

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-warning me-2";
    editBtn.textContent = "Bearbeiten";
    editBtn.addEventListener("click", () => {
      document.getElementById('objectId').value = rating.objectId;
      document.getElementById('objectType').value = rating.objectType;
      document.getElementById('userId').value = rating.userId;
      document.getElementById('userName').value = rating.userName;
      document.getElementById('comment').value = rating.comment;
      document.getElementById('starsDropdown').value = rating.rating;

      editRatingMode = true;
      currentRatingEditId = rating._id;

      const btn = document.getElementById('submitRatingFormButton');
      btn.textContent = "Änderungen speichern";
      btn.classList.remove("btn-success");
      btn.classList.add("btn-warning");

      document.getElementById('createRatingForm').scrollIntoView({ behavior: 'smooth' });
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger";
    deleteBtn.textContent = "Löschen";
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Rating "${rating._id}" wirklich löschen?`)) return;

      const res = await fetch(`http://localhost:3000/api/ratings/admin/${rating._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
        }
      });

      const result = await res.json();
      if (!res.ok) return alert("Fehler: " + (result.message || "Löschen fehlgeschlagen"));
      alert("Bewertung gelöscht");
      searchRatingApi();
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

// Submit handler für Ratings
document.getElementById("createRatingForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;

  const formData = {
    objectId: form.objectId.value,
    objectType: form.objectType.value,
    userId: form.userId.value,
    userName: form.userName.value,
    comment: form.comment.value,
    rating: form.stars.value,
  };

  const url = editRatingMode
    ? `http://localhost:3000/api/ratings/admin/${currentRatingEditId}`
    : `http://localhost:3000/api/ratings`;

  const method = editRatingMode ? "PUT" : "POST";

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

    alert(editRatingMode ? "Bewertung aktualisiert" : "Bewertung erstellt");
    form.reset();
    editRatingMode = false;
    currentRatingEditId = null;

    const btn = document.getElementById('submitRatingFormButton');
    btn.textContent = "Bewertung erstellen";
    btn.classList.remove("btn-warning");
    btn.classList.add("btn-success");

    searchRatingApi();
  } catch (err) {
    alert("Fehler: " + err.message);
  }
});

// On page load
document.addEventListener("DOMContentLoaded", () => {
  searchRatingApi();
});
