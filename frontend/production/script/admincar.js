// Fetch car from API and render cards
function searchCarApi() {
    const resultDiv = document.getElementById('resultDiv');
    resultDiv.innerHTML = "";

    fetch('http://localhost:3000/api/cars')
        .then(res => res.json())
        .then(carsJson => {
            createResultCards(carsJson);
        });
}

// Render rating stars (if nessesary)
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

// Render car cards
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




        cardBodyDiv.appendChild(cardTitle);
        cardBodyDiv.appendChild(table);

        cardDiv.appendChild(img);
        cardDiv.appendChild(cardBodyDiv);
        colDiv.appendChild(cardDiv);
        // Edit button
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'btn btn-warning me-2';
        editButton.innerText = 'Mietwagen bearbeiten';

        editButton.addEventListener('click', () => {
            document.getElementById('name').value = car.name;
            document.getElementById('brand').value = car.brand;
            document.getElementById('model').value = car.model;
            document.getElementById('manufactureYear').value = car.manufacture_year;
            document.getElementById('hp').value = car.hp;
            document.getElementById('seats').value = car.seats;
            document.getElementById('price').value = car.price;
            document.getElementById('available').value = car.available;
            document.getElementById('features').value = car.features ? car.features.join(", ") : "";
            document.getElementById('fuel').value = car.fuel;
            document.getElementById('transmission').value = car.transmission;
            document.getElementById('doors').value = car.doors;
            document.getElementById('location').value = car.location;

            const photoInput = document.querySelector('input[name="photos"]');
            if (photoInput) {
                photoInput.required = true;
            }

            document.getElementById('createCarForm').scrollIntoView({ behavior: 'smooth', block: 'start' });

            editMode = true;
            currentEditId = car._id;

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
            const confirmed = confirm(`Mietwagen "${car.name}" wirklich löschen?`);
            if (!confirmed) return;

            try {
                const res = await fetch(`http://localhost:3000/api/cars/admin/${car._id}`, {
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

                alert("Mietwagen erfolgreich gelöscht");
                searchCarApi();
            } catch (err) {
                alert("Fehler: " + err.message);
            }
        });

        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'd-flex justify-content-between mt-3';
        buttonGroup.appendChild(editButton);
        buttonGroup.appendChild(deleteButton);

        cardBodyDiv.appendChild(cardTitle);
        cardBodyDiv.appendChild(table);

        cardDiv.appendChild(img);
        cardDiv.appendChild(cardBodyDiv);
        colDiv.appendChild(cardDiv);
        cardBodyDiv.appendChild(buttonGroup);

        document.getElementById('resultDiv').appendChild(colDiv);
    }
}

// Form submit handler
document.getElementById("createCarForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const url = editMode
        ? `http://localhost:3000/api/cars/admin/${currentEditId}`
        : "http://localhost:3000/api/cars/admin";
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

        alert(editMode ? "Mietwagen aktualisiert" : "Mietwagen erstellt");
        form.reset();

        // Reset to create mode after editing
        editMode = false;
        currentEditId = null;
        const submitBtn = document.getElementById('submitFormButton');
        submitBtn.textContent = "Mietwagen erstellen";
        submitBtn.classList.remove("btn-warning");
        submitBtn.classList.add("btn-success");

        // Ensure photo input is required again
        const photoInput = document.querySelector('input[name="photos"]');
        if (photoInput) {
            photoInput.required = true;
        }

        searchCarApi();
    } catch (err) {
        alert("Error: " + err.message);
    }
});

// Load cars on page load
document.addEventListener("DOMContentLoaded", () => {
    searchCarApi();
});
