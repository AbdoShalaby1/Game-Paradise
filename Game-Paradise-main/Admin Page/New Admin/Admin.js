
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


let games = [];
let editIndex = null;

function clearForm() {
    document.getElementById("gameName").value = "";
    document.getElementById("gameImg").value = "";
    document.getElementById("gameCover").value = "";
    document.getElementById("gameVid").value = "";
    document.getElementById("gamePrice").value = "";
    document.getElementById("gameRating").value = "";
    document.getElementById("gameGenre").value = "";
    document.getElementById("gameDesc").value = "";
    document.getElementById("gameTrademark").value = "";
    document.getElementById("gameRequirements").value = "";
    document.getElementById("gameLangs").value = "";
    document.getElementById("saveBtn").innerText = "Save Game";
    editIndex = null;
}

function addGame() {
    let game = {
        name: document.getElementById("gameName").value,
        img: document.getElementById("gameImg").files[0] ? URL.createObjectURL(document.getElementById("gameImg").files[0]) : "",
        cover: document.getElementById("gameCover").files[0] ? URL.createObjectURL(document.getElementById("gameCover").files[0]) : "",
        video: document.getElementById("gameVid").value,
        price: document.getElementById("gamePrice").value,
        rating: document.getElementById("gameRating").value,
        genre: document.getElementById("gameGenre").value,
        desc: document.getElementById("gameDesc").value,
        trademark: document.getElementById("gameTrademark").value,
        requirements: document.getElementById("gameRequirements").value,
        langs: document.getElementById("gameLangs").value
    };

    if (editIndex !== null) {
        games[editIndex] = game;
    } else {
        games.push(game);
    }

    renderGames();
    clearForm();
}

function modifyGame(index) {
    let game = games[index];
    document.getElementById("gameName").value = game.name || "";
    document.getElementById("gameVid").value = game.video || "";
    document.getElementById("gamePrice").value = game.price || "";
    document.getElementById("gameRating").value = game.rating || "";
    document.getElementById("gameGenre").value = game.genre || "";
    document.getElementById("gameDesc").value = game.desc || "";
    document.getElementById("gameTrademark").value = game.trademark || "";
    document.getElementById("gameRequirements").value = game.requirements || "";
    document.getElementById("gameLangs").value = game.langs || "";
    editIndex = index;
    document.getElementById("saveBtn").innerText = "Update Game";
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
                 <td>${game.genre}</td>
             
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
    { id: 101, game: "Halo Infinite", Price: "500$" },
    { id: 102, game: "Forza Horizon 5", Price: "500$" }
];

function renderOrders() {
    let list = document.getElementById("ordersList");
    list.innerHTML = "";
    orders.forEach((order, index) => {
        list.innerHTML += `
            <tr>
                <td>${order.id}</td>
                <td>${order.game}</td>
                <td>${order.Price}</td>
              
            </tr>
        `;
    });
}
/*
function updateOrder(index, status) {
    orders[index].status = status;
    renderOrders();
}*/

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


/*

let games = [];

function addGame() {
    let name = document.getElementById("gameName").value;
    let imgFile = document.getElementById("gameImg").files[0];
    let coverFile = document.getElementById("gameCover").files[0];
    let vid = document.getElementById("gameVid").value;
    let price = document.getElementById("gamePrice").value;
    let rating = document.getElementById("gameRating").value;
    let genre = document.getElementById("gameGenre").value;
    let desc = document.getElementById("gameDesc").value;
    let trademark = document.getElementById("gameTrademark").value;
    let requirements = document.getElementById("gameRequirements").value;
    let langs = document.getElementById("gameLangs").value;

    if (!name || !imgFile || !coverFile || !vid || !price || !rating || !genre || !desc || !trademark || !requirements || !langs) {
        alert("Please fill in all fields!");
        return;
    }

    // Convert images to previewable paths
    let imgPath = URL.createObjectURL(imgFile);
    let coverPath = URL.createObjectURL(coverFile);

    let game = {
        name,
        img: imgPath,
        cover: coverPath,
        vid,
        price,
        rating,
        genre,
        desc,
        trademark,
        requirements,
        langs
    };

    games.push(game);
    console.log("Game added:", game);
    alert("Game saved successfully!");
}
*/