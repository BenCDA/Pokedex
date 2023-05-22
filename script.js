// Déclaration des variables en manipulant le DOM.
const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');
const gridContainer = document.getElementById('grid-container');
const pokemonDetailsContainer = document.getElementById('pokemon-details-container');
const pokemonDetailsName = document.getElementById('pokemon-details-name');
const pokemonDetailsId = document.getElementById('pokemon-details-id');
const pokemonDetailsImage = document.getElementById('pokemon-details-image');
const pokemonDetailsTypes = document.getElementById('pokemon-details-types');
const pokemonDetailsHeight = document.getElementById('pokemon-details-height');
const pokemonDetailsWeight = document.getElementById('pokemon-details-weight');
const pokemonDetailsDescription = document.getElementById('pokemon-details-description');
const pokemonDetailsAbilities = document.getElementById('pokemon-details-abilities');
const pokemonDetailsClose = document.getElementById('pokemon-details-close');

let pokemonList = [];

// Fonction pour charger la liste de tous les Pokémon.
function loadPokemonList() {
  fetch('https://pokeapi.co/api/v2/pokemon?limit=1000')
    .then(response => response.json())
    .then(data => {
      pokemonList = data.results;
      displayPokemonList(pokemonList);
      populateTypeFilter(data);
    })
    .catch(error => console.log(error));
}

// Fonction d'affichage de la liste des Pokémon.
function displayPokemonList(pokemonList) {
  gridContainer.innerHTML = '';

  pokemonList.forEach((pokemon, index) => { 
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('pokemon-card');
    pokemonCard.innerHTML = `
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${getPokemonId(pokemon.url)}.png" alt="Image de ${pokemon.name}">
      <h3 class="pokemon-name">${pokemon.name}</h3>
      <p class="pokemon-number">#${getPokemonId(pokemon.url)}</p>
    `;
    pokemonCard.addEventListener('click', () => {
      displayPokemonDetails(pokemon);
    });
    
    // Ajout de la classe "hide" aux éléments qui ne font pas partie des 20 premiers.
    if (index >= elementsPerPage) {
      pokemonCard.classList.add('hide');
    }
    
    gridContainer.appendChild(pokemonCard);
  });
}


// Fonction pour afficher les détails d'un Pokémon.
function displayPokemonDetails(pokemon) {
  fetch(pokemon.url)
    .then(response => response.json())
    .then(data => {
      pokemonDetailsName.textContent = data.name;
      pokemonDetailsId.textContent = `#${data.id}`;
      pokemonDetailsImage.src = data.sprites.front_default;
      pokemonDetailsTypes.textContent = `Types: ${data.types.map(type => type.type.name).join(', ')}`;
      pokemonDetailsHeight.textContent = `Height: ${data.height}`;
      pokemonDetailsWeight.textContent = `Weight: ${data.weight}`;
      pokemonDetailsDescription.textContent = `Description: `;
      pokemonDetailsAbilities.textContent = `Abilities: ${data.abilities.map(ability => ability.ability.name).join(', ')}`;

      pokemonDetailsContainer.classList.remove('hide');
    })
    .catch(error => console.log(error));
}

// Fonction pour obtenir l'ID d'un Pokémon à partir de son URL.
function getPokemonId(pokemonUrl) {
  const urlParts = pokemonUrl.split('/');
  return urlParts[urlParts.length - 2];
}


// Fonction pour filtrer le type
function filterPokemonByType(type) {
  if (type === 'all') {
    displayPokemonList(pokemonList);
  } else {
    const filteredPokemonList = [];

    pokemonList.forEach(pokemon => {
      fetch(pokemon.url)
        .then(response => response.json())
        .then(data => {
          const pokemonTypes = data.types.map(type => type.type.name);
          if (pokemonTypes.includes(type)) {
            filteredPokemonList.push(pokemon);
          }
        })
        .catch(error => console.log(error))
        .finally(() => {
          if (pokemon === pokemonList[pokemonList.length - 1]) {
            displayPokemonList(filteredPokemonList);
          }
        });
    });
  }
}


// Fonction pour remplir le filtre de type.
function populateTypeFilter(data) {
  const types = new Set();

  data.results.forEach(pokemon => {
    fetch(pokemon.url)
      .then(response => response.json())
      .then(pokemonData => {
        pokemonData.types.forEach(type => {
          types.add(type.type.name);
        });
      })
      .catch(error => console.log(error))
      .finally(() => {
        if (pokemon === data.results[data.results.length - 1]) {
          types.forEach(type => {
            const option = document.createElement('option');
            option.value = type.toLowerCase();
            option.textContent = capitalizeFirstLetter(type);
            typeFilter.appendChild(option);
          });
        }
      });
  });
}

// Fonction pour mettre en majuscule la première lettre d'une chaîne de caractères.
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Gestionnaire d'événement pour la recherche de Pokémon.
searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredPokemonList = pokemonList.filter(pokemon => pokemon.name.includes(searchTerm));
  displayPokemonList(filteredPokemonList);
});

// Gestionnaire d'événement pour le filtre de type.
typeFilter.addEventListener('change', () => {
  const selectedType = typeFilter.value;
  filterPokemonByType(selectedType);
});

// Gestionnaire d'événement pour fermer les détails d'un Pokémon.
pokemonDetailsClose.addEventListener('click', () => {
  pokemonDetailsContainer.classList.add('hide');
});

// Chargement initial de la liste de Pokémon.
loadPokemonList();


// Mise en place d'un système de pagination (on affichera 20 pokémons par page.)
let currentPage = 1;
let elementsPerPage = 20;

function displayElements() {
  // Calculer l'index de début et de fin des éléments à afficher.
  let startIndex = (currentPage - 1) * elementsPerPage;
  let endIndex = startIndex + elementsPerPage;
  
  // Récupérer tous les éléments.
  let allElements = document.getElementsByClassName('pokemon-card');
  
  // Masquer tous les éléments.
  for (let i = 0; i < allElements.length; i++) {
    allElements[i].style.display = 'none';
  }
  
  // Afficher les éléments de la page actuelle.
  for (let i = startIndex; i < endIndex; i++) {
    if (allElements[i]) {
      allElements[i].style.display = 'block';
    }
  }
}


window.onload = function() {
  displayElements();
};

document.getElementById('previous-button').addEventListener('click', function() {
  if (currentPage > 1) {
    currentPage--;
    displayElements();
  }
});

document.getElementById('next-button').addEventListener('click', function() {
  let totalElements = document.getElementsByClassName('pokemon-card').length;
  let totalPages = Math.ceil(totalElements / elementsPerPage);
  
  if (currentPage < totalPages) {
    currentPage++;
    displayElements();
  }
});

