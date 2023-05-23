// Declaration of variables by manipulating the DOM.

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

// Function to load the list of all Pokémon.

function loadPokemonList() {
  fetch('https://pokeapi.co/api/v2/pokemon?limit=1000')
    .then(response => response.json()) //On récupère le JSON
    .then(data => {
      pokemonList = data.results;
      displayPokemonList(pokemonList);
      populateTypeFilter(data);
    })
    .catch(error => console.log(error));
}


// Pokémon list display function.

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


    // Adding the "hide" class to elements that are not part of the first 24 to "hide" them.

    if (index >= elementsPerPage) {
      pokemonCard.classList.add('hide');
    }

    gridContainer.appendChild(pokemonCard);
  });
}


// Function to display the details of a Pokémon.

function displayPokemonDetails(pokemon) {
  fetch(pokemon.url)
    .then(response => response.json())
    .then(data => {

      // Perform a new query to obtain the details of the species.

      fetch(data.species.url)
        .then(response => response.json())
        .then(speciesData => {

          // We create the variables below to have the description of each pokemon in English.

          const englishDescriptions = speciesData.flavor_text_entries.filter(entry => entry.language.name === 'en');
          const englishDescription = englishDescriptions[0].flavor_text;

          pokemonDetailsName.textContent = data.name;
          pokemonDetailsId.textContent = `#${data.id}`;
          pokemonDetailsImage.src = data.sprites.front_default;
          pokemonDetailsTypes.textContent = `Types: ${data.types.map(type => type.type.name).join(', ')}`;
          pokemonDetailsHeight.textContent = `Height: ${data.height}`;
          pokemonDetailsWeight.textContent = `Weight: ${data.weight}`;
          pokemonDetailsDescription.textContent = `Description: ${englishDescription}`;
          pokemonDetailsAbilities.textContent = `Abilities: ${data.abilities.map(ability => ability.ability.name).join(', ')}`;

          pokemonDetailsContainer.classList.remove('hide');
        })

        .catch(error => console.log(error));
    })

    .catch(error => console.log(error));
}

// Function to get the ID of a Pokémon from its URL.

function getPokemonId(pokemonUrl) {
  const urlParts = pokemonUrl.split('/');
  return urlParts[urlParts.length - 2];
}




// Function to filter the type of a Pokémon.

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


// Function to fill the type filter.

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

// Function to capitalize the first letter of a string.

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Event manager for Pokémon search.

searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredPokemonList = pokemonList.filter(pokemon => pokemon.name.includes(searchTerm));
  displayPokemonList(filteredPokemonList);
});

// Event manager for the type filter.

typeFilter.addEventListener('change', () => {
  const selectedType = typeFilter.value;
  filterPokemonByType(selectedType);
});


// Function to search for a Pokémon by its number in the Pokédex.

function searchPokemonByNumber(number) {
  const filteredPokemon = pokemonList.filter(pokemon => getPokemonId(pokemon.url) === number);
  displayPokemonList(filteredPokemon);
}


// Event manager for searching Pokémon by ID.

searchInput.addEventListener('keypress', event => {
  if (event.key === 'Enter') {
    const searchId = searchInput.value;
    searchPokemonByNumber(searchId);
  }
});



// Event Manager to close the details of a Pokémon.

pokemonDetailsClose.addEventListener('click', () => {
  pokemonDetailsContainer.classList.add('hide');
});

// Initial loading of the Pokémon list.

loadPokemonList();



// Implementation of a pagination system (24 pokemons will be displayed per page.)

let currentPage = 1;
let elementsPerPage = 24;

function displayElements() {

  // Calculate the start and end index of the elements to be displayed.

  let startIndex = (currentPage - 1) * elementsPerPage;
  let endIndex = startIndex + elementsPerPage;

  // Recover all the elements.

  let allElements = document.getElementsByClassName('pokemon-card');

  // Hide all elements.

  for (let i = 0; i < allElements.length; i++) {
    allElements[i].style.display = 'none';
  }

  // Display the elements of the current page.

  for (let i = startIndex; i < endIndex; i++) {
    if (allElements[i]) {
      allElements[i].style.display = 'block';
    }
  }
}


window.onload = function () {
  displayElements();
};


document.getElementById('previous-button').addEventListener('click', function () {
  if (currentPage > 1) {
    currentPage--;
    displayElements();
  }
});

document.getElementById('next-button').addEventListener('click', function () {
  let totalElements = document.getElementsByClassName('pokemon-card').length;
  let totalPages = Math.ceil(totalElements / elementsPerPage);

  if (currentPage < totalPages) {
    currentPage++;
    displayElements();
  }
});
