document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Fetch character data from the API when the page loads
        const characters = await fetchCharacters();

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

    } catch (error) {
        console.error("Error initializing characters:", error);
    }
});

// Function to fetch characters from API
async function fetchCharacters() {
    try {
        const response = await fetch("https://api.jsonbin.io/v3/b/67e4eb358960c979a5794056");
        const data = await response.json();
        console.log("Fetched Characters:", data.record);

        // Initialize characters with like/dislike properties (default to 0)
        return data.record.characters.map(character => ({
            ...character,
            likes: 0,
            dislikes: 0
        }));

    } catch (error) {
        console.error("Error fetching characters:", error);
        return [];
    }
}

// Function to load stored likes and last viewed character
function loadStoredData(characters) {
    const storedLikes = JSON.parse(localStorage.getItem("likedCharacters")) || {};
    characters.forEach(character => {
        if (storedLikes[character.name]) {
            character.likes = storedLikes[character.name];
        }
    });
}

// Function to populate the character list
function populateCharacters(characters) {
    const charactersList = document.getElementById("characters");
    charactersList.innerHTML = ""; // Clear existing list before repopulating

    characters.forEach(character => {
        const characterElement = document.createElement("li");

        // Character Thumbnail
        const imgElement = document.createElement("img");
        imgElement.src = character.image;
        imgElement.alt = character.name;
        imgElement.style.width = "50px";
        imgElement.style.marginRight = "10px";

        // Character Name
        const nameElement = document.createElement("span");
        nameElement.textContent = character.name;

        // Append image and name to list item
        characterElement.appendChild(imgElement);
        characterElement.appendChild(nameElement);

        // On click, display the character's details
        characterElement.addEventListener("click", () => {
            populateCharacter(character, characters);
        });

        charactersList.appendChild(characterElement);
    });
}

// Function to display the most liked characters
function updateMostLiked(characters) {
    const mostLikedList = document.getElementById("mostLikedList");
    mostLikedList.innerHTML = ""; // Clear previous list

    // Sort by likes (descending) and take top 5
    const sortedCharacters = [...characters].sort((a, b) => b.likes - a.likes).slice(0, 5);

    sortedCharacters.forEach(character => {
        const listItem = document.createElement("li");

        // Character Image
        const img = document.createElement("img");
        img.src = character.image;
        img.alt = character.name;
        img.style.width = "40px";
        img.style.marginRight = "10px";

        // Character Name & Like Count
        const text = document.createElement("span");
        text.textContent = `${character.name} (${character.likes} 👍)`;

        // Append elements
        listItem.appendChild(img);
        listItem.appendChild(text);
        mostLikedList.appendChild(listItem);
    });

    // Store the updated most liked list in local storage
    localStorage.setItem("mostLiked", JSON.stringify(sortedCharacters));
}

// Function to create a like button
function createLikeButton(character, characters) {
    const likeButton = document.createElement("button");
    likeButton.textContent = `👍 Like (${character.likes})`;
    likeButton.addEventListener("click", () => {
        character.likes++; // Increment like count
        likeButton.textContent = `👍 Like (${character.likes})`;

        // Save updated likes to local storage
        saveLikesToStorage(characters);

        // Refresh the most liked section
        updateMostLiked(characters);
    });
    return likeButton;
}

// Function to save likes to local storage
function saveLikesToStorage(characters) {
    const likedCharacters = {};
    characters.forEach(char => {
        if (char.likes > 0) likedCharacters[char.name] = char.likes;
    });
    localStorage.setItem("likedCharacters", JSON.stringify(likedCharacters));
}

// Function to display selected character details
function populateCharacter(character, characters) {
    const characterElement = document.getElementById("character");
    characterElement.innerHTML = ""; // Clear previous content

    // Character Name
    const nameElement = document.createElement("h2");
    nameElement.textContent = character.name;

    // Character Image
    const imageElement = document.createElement("img");
    imageElement.src = character.image;
    imageElement.alt = character.name;
    imageElement.style.maxWidth = "300px";

    // Character Description
    const descriptionElement = document.createElement("p");
    descriptionElement.textContent = character.description || "No description available.";

    // Additional Details
    const cityElement = document.createElement("p");
    cityElement.textContent = `City: ${character.city}`;

    const occupationElement = document.createElement("p");
    occupationElement.textContent = `Occupation: ${character.occupation}`;

    const statusElement = document.createElement("p");
    statusElement.textContent = `Status: ${character.status}`;

    // Like Button
    const likeButton = createLikeButton(character, characters);

    // Dislike Button
    const dislikeButton = document.createElement("button");
    dislikeButton.textContent = `👎 Dislike (${character.dislikes})`;
    dislikeButton.addEventListener("click", () => {
        character.dislikes++;
        dislikeButton.textContent = `👎 Dislike (${character.dislikes})`;
    });

    // Append all elements
    characterElement.appendChild(nameElement);
    characterElement.appendChild(imageElement);
    characterElement.appendChild(descriptionElement);
    characterElement.appendChild(cityElement);
    characterElement.appendChild(occupationElement);
    characterElement.appendChild(statusElement);
    characterElement.appendChild(likeButton);
    characterElement.appendChild(dislikeButton);

    // Store the last viewed character in local storage
    localStorage.setItem("lastViewedCharacter", character.name);
}
