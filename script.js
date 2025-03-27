document.addEventListener('DOMContentLoaded', function() {
    // Fetch character data from the API when the page loads
    fetch("https://api.jsonbin.io/v3/b/67e4eb358960c979a5794056") 
        .then(response => response.json())
        .then(data => {
            console.log("Fetched Characters:", data.record);

            // Initialize characters with additional like/dislike properties
            let characters = data.record.characters.map(character => ({
                ...character,
                likes: 0,
                dislikes: 0
            }));

            // Populate the character list
            populateCharacters(characters);

            // Display details of the first character initially
            if (characters.length > 0) {
                populateCharacter(characters[0]);
            }

            // Add event listener for search functionality
            document.getElementById("searchBar").addEventListener("input", function(event) {
                const searchTerm = event.target.value.toLowerCase();
                const filteredCharacters = characters.filter(character => 
                    character.name.toLowerCase().includes(searchTerm)
                );
                populateCharacters(filteredCharacters);
            });
        })
        .catch(error => {
            console.error("Error fetching characters:", error);
        });
});

// Function to populate the character list in the UI
function populateCharacters(characters) {
    const charactersList = document.getElementById("characters");
    charactersList.innerHTML = ""; // Clear existing list before repopulating

    characters.forEach(character => {
        const characterElement = document.createElement("li"); // Create list item for each character
        
        // Create and style the character's thumbnail image
        const imgElement = document.createElement("img");
        imgElement.src = character.image;
        imgElement.alt = character.name;
        imgElement.style.width = "50px";
        imgElement.style.marginRight = "10px";
        
        // Create span element for the character name
        const nameElement = document.createElement("span");
        nameElement.textContent = character.name;
        
        // Append image and name to the list item
        characterElement.appendChild(imgElement);
        characterElement.appendChild(nameElement);
        
        // Add event listener to show character details when clicked
        characterElement.addEventListener("click", () => {
            populateCharacter(character);
        });

        // Append the list item to the character list
        charactersList.appendChild(characterElement);
    });
}

// Function to display detailed information about a selected character
function populateCharacter(character) {
    const characterElement = document.getElementById("character");
    characterElement.innerHTML = ""; // Clear previous details

    // Create and display character name
    const nameElement = document.createElement("h2");
    nameElement.textContent = character.name;
    
    // Create and display character's larger image
    const imageElement = document.createElement("img");
    imageElement.src = character.image;
    imageElement.alt = character.name;
    imageElement.style.maxWidth = "300px";
    
    // Create and display character description
    const descriptionElement = document.createElement("p");
    descriptionElement.textContent = character.description || "No description available.";
    
    // Create and display additional character details
    const cityElement = document.createElement("p");
    cityElement.textContent = `City: ${character.city}`;
    
    const occupationElement = document.createElement("p");
    occupationElement.textContent = `Occupation: ${character.occupation}`;
    
    const statusElement = document.createElement("p");
    statusElement.textContent = `Status: ${character.status}`;
    
    // Create like button with initial count
    const likeButton = document.createElement("button");
    likeButton.textContent = `👍 Like (${character.likes})`;
    likeButton.addEventListener("click", () => {
        character.likes++; // Increment like count
        likeButton.textContent = `👍 Like (${character.likes})`; // Update button text
    });
    
    // Create dislike button with initial count
    const dislikeButton = document.createElement("button");
    dislikeButton.textContent = `👎 Dislike (${character.dislikes})`;
    dislikeButton.addEventListener("click", () => {
        character.dislikes++; // Increment dislike count
        dislikeButton.textContent = `👎 Dislike (${character.dislikes})`; // Update button text
    });
    
    // Append all elements to the character details section
    characterElement.appendChild(nameElement);
    characterElement.appendChild(imageElement);
    characterElement.appendChild(descriptionElement);
    characterElement.appendChild(cityElement);
    characterElement.appendChild(occupationElement);
    characterElement.appendChild(statusElement);
    characterElement.appendChild(likeButton);
    characterElement.appendChild(dislikeButton);
}
