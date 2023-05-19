// Déclaration des variables en manipulant le DOM
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

// Fonction pour charger la liste de tous les Pokémon
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

// Fonction d'affichage de la liste des Pokémon
function displayPokemonList(pokemonList) {
  gridContainer.innerHTML = '';

  pokemonList.forEach(pokemon => {
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
    gridContainer.appendChild(pokemonCard);
  });
}

// Fonction pour afficher les détails d'un Pokémon
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

// Fonction pour obtenir l'ID d'un Pokémon à partir de son URL
function getPokemonId(pokemonUrl) {
  const urlParts = pokemonUrl.split('/');
  return urlParts[urlParts.length - 2];
}

// Fonction pour peupler le filtre de type
function populateTypeFilter(data) {
  const types = ['Tous'];

  data.results.forEach(pokemon => {
    fetch(pokemon.url)
      .then(response => response.json())
      .then(pokemonData => {
        pokemonData.types.forEach(type => {
          if (!types.includes(type.type.name)) {
            types.push(type.type.name);
          }
        });
      })
      .catch(error => console.log(error));
  });

  types.forEach(type => {
    const option = document.createElement('option');
    option.value = type.toLowerCase();
    option.textContent = capitalizeFirstLetter(type);
    typeFilter.appendChild(option);
  });
}

// Fonction pour rechercher un Pokémon par nom ou numéro
function searchPokemon(searchTerm) {
  const filteredPokemonList = pokemonList.filter(pokemon => {
    const pokemonName = pokemon.name.toLowerCase();
    const pokemonNumber = getPokemonId(pokemon.url);
    return pokemonName.includes(searchTerm.toLowerCase()) || pokemonNumber === searchTerm;
  });
  displayPokemonList(filteredPokemonList);
}

// Fonction pour filtrer les Pokémon par type
function filterPokemonByType(type) {
  if (type === '') {
    displayPokemonList(pokemonList);
  } else {
    const filteredPokemonList = pokemonList.filter(pokemon => {
      return fetch(pokemon.url)
        .then(response => response.json())
        .then(data => {
          const pokemonTypes = data.types.map(type => type.type.name);
          return pokemonTypes.includes(type);
        })
        .catch(error => console.log(error));
    });
    Promise.all(filteredPokemonList)
      .then(results => displayPokemonList(results))
      .catch(error => console.log(error));
  }
}

// Fonction pour mettre la première lettre en majuscule
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Gestionnaire d'événement pour la recherche de Pokémon
searchInput.addEventListener('keypress', event => {
  if (event.key === 'Enter') {
    const searchTerm = searchInput.value.trim();
    searchPokemon(searchTerm);
  }
});

// Gestionnaire d'événement pour le filtre de type
typeFilter.addEventListener('change', event => {
  const selectedType = event.target.value;
  filterPokemonByType(selectedType);
});

// Gestionnaire d'événement pour fermer les détails d'un Pokémon
pokemonDetailsClose.addEventListener('click', () => {
  pokemonDetailsContainer.classList.add('hide');
});

// Chargement initial de la liste des Pokémon
loadPokemonList();