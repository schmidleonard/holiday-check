
//API ABFRAGE FUNKTION
function searchProductApi() {
    console.log("Button geklickt");
    let resultDiv = document.getElementById('resultDiv');

    resultDiv.innerHTML = "";

    //2. Wir rufen die API mit dem eingebenen Suchbegriff auf 
    //www.thecocktaildb.com/api/json/v1/1/search.php?s=margarita
    fetch('http://localhost:3000/api/hotels').then(res => res.json()).then(hotelsJson => {
        //Aufruf der Methode/ Funktion um die Daten in HTML zu schreiben
        createResultCards(hotelsJson);
    })
}

function renderStars(rating) {
  // rating: Zahl zwischen 0 und 5, z.B. 3.5
  const maxStars = 5;
  let html = '<div class="star-rating">';
  for (let i = 1; i <= maxStars; i++) {
    if (rating >= i) {
      // Volle Sterne
      html += '<span class="fa fa-star text-warning"></span>';
    } else if (rating >= i - 0.5) {
      // Halbe Sterne
      html += '<span class="fa fa-star-half-o text-warning"></span>';
    } else {
      // Leere Sterne
      html += '<span class="fa fa-star-o text-warning"></span>';
    }
  }
  html += '</div>';
  return html;
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

        //Für jeden Cocktail im Ergebnis machen wir die Card wieder sichtbar
        let cardElement = document.createElement('div');
        cardElement.setAttribute('class', 'card');
        //Wir setzen den von Bootstrap erwarteten Style wieder ein
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

        const averageRating = 4;
        const ratingCount = hotel.ratingCount;

        


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
        tableClone.querySelector('.rating-cell').innerHTML = renderStars(hotel.averageRating);



        let detailButton = document.createElement('button');

        //der Link zur Detailseite muss die ID des Cocktails übermitteln, der gerade geklickt wurde
        detailButton.setAttribute("type", "button");
        detailButton.addEventListener("click", () => showDetails());
        detailButton.setAttribute("class", "btn btn-primary");
        detailButton.innerHTML = "Details anzeigen";

        //Kinder hinzufügen zum CardBoy
        cardBodyDiv.appendChild(cardTitle);
        cardBodyDiv.appendChild(tableClone);
        cardBodyDiv.appendChild(detailButton);


        //CardElement den Cardbody anfügen
        cardElement.appendChild(carousel);
        cardElement.appendChild(cardBodyDiv);

        //ColDiv das Carddiv hinzufügen
        colDiv.appendChild(cardElement);

        document.getElementById('resultDiv').appendChild(colDiv);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    searchProductApi();
});
