document.addEventListener('DOMContentLoaded', async function () {
    try {
        let characters = await fetchCharacters();

        // Load stored characters from local storage and merge with API data
        const storedCharacters = JSON.parse(localStorage.getItem("characters")) || [];
        characters = mergeCharacters(characters, storedCharacters);

        // Load stored likes and last viewed character from local storage
        loadStoredData(characters);

        // Populate the character list
        populateCharacters(characters);

        // Display last viewed character or default to the first character
        const lastViewedCharacter = localStorage.getItem("lastViewedCharacter");
        if (lastViewedCharacter) {
            const foundCharacter = characters.find(char => char.name === lastViewedCharacter);
            if (foundCharacter) populateCharacter(foundCharacter, characters);
        } else if (characters.length > 0) {
            populateCharacter(characters[0], characters);
        }

        // Populate the most liked section based on stored likes
        updateMostLiked(characters);

        // Add event listener for search functionality
        document.getElementById("searchBar").addEventListener("input", function (event) {
            const searchTerm = event.target.value.toLowerCase();
            const filteredCharacters = characters.filter(character =>
                character.name.toLowerCase().includes(searchTerm)
            );
            populateCharacters(filteredCharacters);
        });

        // Add event listener to show the add character form
        document.getElementById("addCharacterBtn").addEventListener("click", function () {
            document.getElementById("addCharacterForm").style.display = "block";
        });
    } catch (error) {
        console.error("Error initializing characters:", error);
    }
});

// Function to fetch characters from API
async function fetchCharacters() {
    try {
        const response = await fetch("https://api.jsonbin.io/v3/b/67e41f578a456b79667d236e");
        const data = await response.json();
        console.log("Fetched Characters:", data.record);

        return data.record.characters.map(character => ({
            ...character,
            likes: character.likes || 0,   // Preserve likes
            dislikes: character.dislikes || 0  // Preserve dislikes
        }));
    } catch (error) {
        console.error("Error fetching characters:", error);
        return [];
    }
}


// Function to merge API characters with locally stored ones
function mergeCharacters(apiCharacters, storedCharacters) {
    const merged = [...apiCharacters];
    storedCharacters.forEach(storedChar => {
        if (!apiCharacters.find(apiChar => apiChar.name === storedChar.name)) {
            merged.push(storedChar);
        }
    });
    return merged;
}

// Function to add a new character and sync with JSONBin
async function addCharacter() {
    const name = document.getElementById("name").value;
    const image = document.getElementById("image").value;
    const city = document.getElementById("city").value;
    const occupation = document.getElementById("occupation").value;
    const status = document.getElementById("status").value;
    const description = document.getElementById("description").value;

    if (!name || !image || !city || !occupation || !status || !description) {
        alert("All fields are required to add a character.");
        return;
    }

    const newCharacter = { name, image, city, occupation, status, description, likes: 0, dislikes: 0 };
    let characters = JSON.parse(localStorage.getItem("characters")) || [];
    characters.push(newCharacter);
    localStorage.setItem("characters", JSON.stringify(characters));

    populateCharacters(characters);
    updateMostLiked(characters);

    document.getElementById("addCharacterForm").reset();
    document.getElementById("addCharacterForm").style.display = "none";

    // Sync with JSONBin
    await syncWithJSONBin(characters);
}

// Function to sync updated characters with JSONBin
async function syncWithJSONBin(characters) {
    try {
        const API_KEY = "$2a$10$E8UBICtdASlXxgsveab1b.iH4NNr5XDL0kN/S9x67R6R4eEMnSP4a";  

        const response = await fetch("https://api.jsonbin.io/v3/b/67e41f578a456b79667d236e", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify({ characters: characters.map(c => ({
                ...c,
                likes: c.likes || 0,  
                dislikes: c.dislikes || 0
            })) })
        });

        if (!response.ok) throw new Error("Failed to sync data with JSONBin");

        console.log("Synced successfully with JSONBin");
    } catch (error) {
        console.error("Error syncing with JSONBin:", error);
    }
}



// Function to load stored likes and last viewed character
function loadStoredData(characters) {
    const storedLikes = JSON.parse(localStorage.getItem("likedCharacters")) || {};
    characters.forEach(character => {
        if (storedLikes[character.name]) {
            character.likes = storedLikes[character.name].likes || 0;
            character.dislikes = storedLikes[character.name].dislikes || 0;
        }
    });
}


// Function to populate the character list
function populateCharacters(characters) {
    const charactersList = document.getElementById("characters");
    charactersList.innerHTML = "";

    characters.forEach(character => {
        const characterElement = document.createElement("li");

        const imgElement = document.createElement("img");
        imgElement.src = character.image;
        imgElement.alt = character.name;
        imgElement.style.width = "50px";
        imgElement.style.marginRight = "10px";

        const nameElement = document.createElement("span");
        nameElement.textContent = character.name;

        characterElement.appendChild(imgElement);
        characterElement.appendChild(nameElement);
        characterElement.addEventListener("click", () => {
            populateCharacter(character, characters);
        });

        charactersList.appendChild(characterElement);
    });
}

// Function to display the most liked characters
function updateMostLiked(characters) {
    const mostLikedList = document.getElementById("mostLikedList");
    mostLikedList.innerHTML = "";
    
    const sortedCharacters = [...characters].sort((a, b) => b.likes - a.likes).slice(0, 5);

    sortedCharacters.forEach(character => {
        const listItem = document.createElement("li");
        const text = document.createElement("span");
        text.textContent = `${character.name} (${character.likes} 👍)`;
        listItem.appendChild(text);
        mostLikedList.appendChild(listItem);
    });
}

// Function to display selected character details
function populateCharacter(character, characters) {
    const characterElement = document.getElementById("character");
    characterElement.innerHTML = "";

    const nameElement = document.createElement("h2");
    nameElement.textContent = character.name;

    const imageElement = document.createElement("img");
    imageElement.src = character.image;
    imageElement.alt = character.name;
    imageElement.style.maxWidth = "300px";

    const descriptionElement = document.createElement("p");
    descriptionElement.textContent = character.description || "No description available.";

    // Create like and dislike buttons
    const likeButton = createLikeButton(character, characters);
    const dislikeButton = createDislikeButton(character, characters);

    characterElement.append(nameElement, imageElement, descriptionElement, likeButton, dislikeButton);
    localStorage.setItem("lastViewedCharacter", character.name);
}

function createLikeButton(character, characters) {
    const likeButton = document.createElement("button");
    likeButton.textContent = `👍 Like (${character.likes})`;
    
    likeButton.addEventListener("click", async () => {
        character.likes++;
        likeButton.textContent = `👍 Like (${character.likes})`;

        saveLikesToStorage(characters);
        updateMostLiked(characters);

        // Sync updated characters with JSONBin
        await syncWithJSONBin(characters);
    });

    return likeButton;
}

function createDislikeButton(character, characters) {
    const dislikeButton = document.createElement("button");
    dislikeButton.textContent = `👎 Dislike (${character.dislikes})`;

    dislikeButton.addEventListener("click", async () => {
        character.dislikes++;
        dislikeButton.textContent = `👎 Dislike (${character.dislikes})`;

        saveLikesToStorage(characters);

        // Sync updated characters with JSONBin
        await syncWithJSONBin(characters);
    });

    return dislikeButton;
}


function saveLikesToStorage(characters) {
    const likedCharacters = {};
    characters.forEach(char => {
        likedCharacters[char.name] = { likes: char.likes, dislikes: char.dislikes };
    });
    localStorage.setItem("likedCharacters", JSON.stringify(likedCharacters));
}

const characterImage = document.createElement("img");
characterImage.src = character.image; // Will load "images/trevor.webp"
