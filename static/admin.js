// Navigation
document.querySelectorAll(".sidebar nav ul li").forEach(item => {
    item.addEventListener("click", () => {
        document.querySelectorAll(".sidebar nav ul li").forEach(li => li.classList.remove("active"));
        item.classList.add("active");

        document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
        document.getElementById(item.dataset.section).classList.add("active");

        document.getElementById("sectionTitle").innerText = item.innerText;
    });
});

// Games Management
let games = [];
/*
function addGame() {
    let name = document.getElementById("gameName").value;
    let desc = document.getElementById("gameDesc").value;
    let price = document.getElementById("gamePrice").value;
    let qty = document.getElementById("gameQuantity").value;

    if (name && desc && price && qty) {
        if (editIndex !== null) {
            // UPDATE EXISTING
            games[editIndex-1] = { name, desc, price, qty };
            editIndex = null;
            document.getElementById("saveBtn").innerText = "Save Game";
        } else {
            // ADD NEW
            games.push({ name, desc, price, qty });
        }

        renderGames();

        // Clear form
        document.getElementById("gameName").value = "";
        document.getElementById("gameDesc").value = "";
        document.getElementById("gamePrice").value = "";
        document.getElementById("gameQuantity").value = "";
    }
}*/
async function searchGames(query) {
    const apiKey = "YOUR_API_KEY"; // Replace with your RAWG API key
    const url = `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        let resultsContainer = document.getElementById("searchResults");
        resultsContainer.innerHTML = "";

        if (data.results.length === 0) {
            resultsContainer.innerHTML = "<p>No games found.</p>";
            return;
        }

        data.results.forEach(game => {
            let gameBox = document.createElement("div");
            gameBox.classList.add("search-result");

            gameBox.innerHTML = `
                <img src="${game.background_image || ''}" alt="${game.name}" style="width:80px; height:80px; object-fit:cover; border-radius:5px; margin-right:10px;">
                <div>
                    <strong>${game.name}</strong><br>
                    Released: ${game.released || "N/A"}
                </div>
                <button onclick="fillGameForm('${game.name.replace(/'/g, "\\'")}', '${(game.released || "").replace(/'/g, "\\'")}')">Select</button>
            `;

            gameBox.style.display = "flex";
            gameBox.style.alignItems = "center";
            gameBox.style.justifyContent = "space-between";
            gameBox.style.background = "#1e1e1e";
            gameBox.style.padding = "8px";
            gameBox.style.borderRadius = "5px";
            gameBox.style.marginBottom = "5px";

            resultsContainer.appendChild(gameBox);
        });

    } catch (error) {
        console.error("Error fetching games:", error);
    }
}

function fillGameForm(name, released) {
    document.getElementById("gameName").value = name;
    document.getElementById("gameDesc").value = `Release Date: ${released}`;
    document.getElementById("gamePrice").value = "";
    document.getElementById("gameQuantity").value = "";
}



/*
function addGame() {
    let name = document.getElementById("gameName").value;
    let desc = document.getElementById("gameDesc").value;
    let price = document.getElementById("gamePrice").value;
    let qty = document.getElementById("gameQuantity").value;

    if (name && desc && price && qty) {
        games.push({ name, desc ,price, qty });
        renderGames();
        document.getElementById("gameName").value = "";
        document.getElementById("gameDesc").value = "";
        document.getElementById("gamePrice").value = "";
        document.getElementById("gameQuantity").value = "";
    }
}*/
function addGame() {
    let name = document.getElementById("gameName").value.trim();
    let desc = document.getElementById("gameDesc").value.trim();
    let price = document.getElementById("gamePrice").value.trim();
    let qty = document.getElementById("gameQuantity").value.trim();

    if (!name || !desc || !price || !qty) return; // stop if empty

    if (editIndex !== null) {
        games[editIndex] = { name, desc, price, qty }; // update
        editIndex = null;
        document.getElementById("saveBtn").innerText = "Add Game";
    } else {
        games.push({ name, desc, price, qty }); // add new
    }

    renderGames();
    clearForm();
}

function clearForm() {
    document.getElementById("gameName").value = "";
    document.getElementById("gameDesc").value = "";
    document.getElementById("gamePrice").value = "";
    document.getElementById("gameQuantity").value = "";
}


let editIndex = null;

function modifyGame(index) {
    let game = games[index];
    document.getElementById("gameName").value = game.name || "";
    document.getElementById("gameDesc").value = game.desc || "";
    document.getElementById("gamePrice").value = game.price || "";
    document.getElementById("gameQuantity").value = game.qty || "";
    editIndex = index;
    document.getElementById("saveBtn").innerText = "Update Game"; // Change button text
}


function renderGames() {
    let list = document.getElementById("gamesList");
    list.innerHTML = "";
    games.forEach((game, index) => {
        list.innerHTML += `
            <tr>
                <td>${game.name}</td>
                <td>${game.desc}</td>
                <td>$${game.price}</td>
                <td>${game.qty}</td>
                <td>
                    <button class="action-btn action-delete" onclick="deleteGame(${index})">Delete</button>
                    <button class="action-btn action-modify" onclick="modifyGame(${index})">Modify</button>

                </td>
            </tr>
        `;
    });
}

function deleteGame(index) {
    games.splice(index, 1);
    renderGames();
}

// Orders Management (Mock Data)
let orders = [
    { id: 101, game: "Halo Infinite", status: "Pending" },
    { id: 102, game: "Forza Horizon 5", status: "Pending" }
];

function renderOrders() {
    let list = document.getElementById("ordersList");
    list.innerHTML = "";
    orders.forEach((order, index) => {
        list.innerHTML += `
            <tr>
                <td>${order.id}</td>
                <td>${order.game}</td>
                <td>${order.status}</td>
                <td>
                    <button class="action-btn action-accept" onclick="updateOrder(${index}, 'Accepted')">Accept</button>
                    <button class="action-btn action-suspend" onclick="updateOrder(${index}, 'Suspended')">Suspend</button>
                    <button class="action-btn action-decline" onclick="updateOrder(${index}, 'Declined')">Decline</button>
                </td>
            </tr>
        `;
    });
}

function updateOrder(index, status) {
    orders[index].status = status;
    renderOrders();
}

// Users Management (Mock Data)
let users = [
    { id: 1, username: "Gamer123" },
    { id: 2, username: "ProPlayer" }
];

function renderUsers() {
    let list = document.getElementById("usersList");
    list.innerHTML = "";
    users.forEach((user, index) => {
        list.innerHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>
                    <button class="action-btn action-delete" onclick="deleteUser(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function deleteUser(index) {
    users.splice(index, 1);
    renderUsers();
}

// Initial Rendering
renderOrders();
renderUsers();
