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


function addGame() {
    let game = {
        name: document.getElementById("gameName").value,
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

    games.push(game);

    renderGames();
    clearForm();
}

function renderGames() {
    let list = document.getElementById("gamesList");
    list.innerHTML = "";
    games.forEach((game, index) => {
        list.innerHTML += `
            <tr>
                <td><img src="static/${game.img_path}" alt="${game.name}" style="width:200px; height:auto; border-radius:6px;"></td>
                <td>${game.name}</td>
                <td>EGP ${(game.price / 300 * 48).toFixed(2)}</td>
                <td>
                    <button class="action-btn action-delete" onclick="deleteGame(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function deleteGame(index) {
    fetch("/fixData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            mode: 'remove',
            appid: games[index].appid
        })
    })
    let timerInterval;
    Swal.fire({
        title: "Success!",
        icon: "success",
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
                timer.textContent = `${Swal.getTimerLeft()}`;
            }, 100);
        },
        willClose: () => {
            clearInterval(timerInterval);
            window.location.reload();
        }
    })
    renderGames();
}



function renderOrders() {
    let list = document.getElementById("ordersList");
    list.innerHTML = "";
    orders.forEach((order, index) => {
        list.innerHTML += `
            <tr>
                <td>${order.user}</td>
                <td>${order.name}</td>
                <td>EGP ${order.price}</td>
              
            </tr>
        `;
    });
}

// Users Management (Mock Data)
let users;
let orders;
let games;

(async () => {
    const response = await fetch('/getUsers');
    users = await response.json();

    const response2 = await fetch('/transactions');
    orders = await response2.json();

    const response3 = await fetch('/allGames');
    games = await response3.json();

    renderUsers();
    renderOrders();
    renderGames();
})();





function renderUsers() {
    let list = document.getElementById("usersList");
    list.innerHTML = "";
    users.forEach((user, index) => {
        list.innerHTML += `
            <tr>
                <td>${user.email}</td>
                <td>${user.name}</td>
                <td>${user.banned
                ? `<button class="action-btn action-delete" onclick="deleteUser(${index},'0')" style="background-color:blue">Unban</button>`
                : `<button class="action-btn action-delete" onclick="deleteUser(${index})">Ban</button>`
            }</td>
            </tr>
        `;
    });
}

function deleteUser(index, banned = '1') {
    fetch("/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: users[index].name,
            action: banned
        })
    })
    let timerInterval;
    Swal.fire({
        title: "Success!",
        icon: "success",
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
                timer.textContent = `${Swal.getTimerLeft()}`;
            }, 100);
        },
        willClose: () => {
            clearInterval(timerInterval);
            window.location.reload();
        }
    })
    renderUsers();
}



function logout() {
    Swal.fire({
        title: 'Log out?',
        text: "Are you sure you want to log out?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, log out',
        cancelButtonText: 'Stay logged in'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch("/logout").then(() => {
                window.location.href = '/';
            });
        }
    });
}

let logoutBtn = document.querySelector("#logoutBtn");
logoutBtn.addEventListener("click", () => {
    logout();
});


const searchInput = document.getElementById("searchGameName");
const searchBtn = document.getElementById("searchBtn");
const searchResults = document.getElementById("searchResults");


searchBtn.addEventListener("click", doSearch);
searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        doSearch();
    }
});

function doSearch() {
    let game = document.getElementById("searchGameName").value;
    if (!game) return;

    fetch("/searchAPI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game })
    })
        .then(res => res.json())
        .then(data => {
            showResults(data);
        });
}

function showResults(games) {
    searchResults.innerHTML = "";
    if (games.length === 0) {
        searchResults.innerHTML = "<p>No results found</p>";
    } else {
        games.forEach(game => {
            const item = document.createElement("div");
            item.className = "gameItem";

            item.innerHTML = `
        <img src="${game.thumbnail}" alt="${game.name}">
        <div>
          <strong>${game.name}</strong><br>
          EGP ${(game.price / 300 * 48).toFixed(2)}
        </div>
        <button onclick="addGame('${game.appid}')">Add</button>
      `;

            searchResults.appendChild(item);
        });
    }
    searchResults.classList.remove("hidden");
}

function addGame(appid) {
    let timerInterval;
    Swal.fire({
        title: 'Adding...',
        html: '<b></b>',
        timer: 4000, // total install time in ms
        timerProgressBar: true,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
            const b = Swal.getHtmlContainer().querySelector('b');
            timerInterval = setInterval(() => {
                b.textContent = Math.round((5000 - Swal.getTimerLeft()) / 50) + '%';
            }, 100);
        },
        willClose: () => {
            clearInterval(timerInterval);
        }
    })
    fetch("/addToStore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appid })
    }).then(res => res.json())
        .then(missing => {
            Swal.close();
            if (missing.length === 0) {
                let timerInterval;
                Swal.fire({
                    title: "Added!",
                    icon: "success",
                    timer: 1500,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                        const timer = Swal.getPopup().querySelector("b");
                        timerInterval = setInterval(() => {
                            timer.textContent = `${Swal.getTimerLeft()}`;
                        }, 100);
                    },
                    willClose: () => {
                        clearInterval(timerInterval);
                        window.location.reload()
                    }
                })
            } else if (missing[0] == 'Exists already!') {
                let timerInterval;
                Swal.fire({
                    title: "Already In Store!",
                    icon: "error",
                    timer: 1500,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                        const timer = Swal.getPopup().querySelector("b");
                        timerInterval = setInterval(() => {
                            timer.textContent = `${Swal.getTimerLeft()}`;
                        }, 100);
                    },
                    willClose: () => {
                        clearInterval(timerInterval);
                        window.location.reload()
                    }
                })
            }
            else if (missing[0] == 'details_missing') {
                let timerInterval;
                Swal.fire({
                    title: "Game Data is missing (Add it manually instead)!",
                    icon: "error",
                    timer: 1500,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                        const timer = Swal.getPopup().querySelector("b");
                        timerInterval = setInterval(() => {
                            timer.textContent = `${Swal.getTimerLeft()}`;
                        }, 100);
                    },
                    willClose: () => {
                        clearInterval(timerInterval);
                        window.location.reload()
                    }
                })
            }
            else {
                function isNumberField(field) {
                    // Treat these as numeric
                    const numeric = ["appid", "price", "rating"];
                    return numeric.includes(field.toLowerCase());
                }

                function formatLabel(name) {
                    // Capitalize nicely, also handle underscores
                    return name.replace(/_/g, " ")
                        .replace(/\b\w/g, c => c.toUpperCase());
                }

                function openMissingForm(missingFields) {
                    Swal.fire({
                        title: 'Fill missing fields',
                        html: `<div id="swal-dynamic-fields"></div>`,
                        focusConfirm: false,
                        showCancelButton: true,
                        confirmButtonText: 'Save',
                        didOpen: () => {
                            const container = document.getElementById('swal-dynamic-fields');

                            missingFields.forEach((field, i) => {
                                const label = document.createElement("label");
                                label.setAttribute("for", `swal-input-${i}`);
                                label.textContent = formatLabel(field);
                                label.style = "display:block;text-align:left;margin:8px 0 4px;font-weight:600;";

                                const input = document.createElement("input");
                                input.id = `swal-input-${i}`;
                                input.className = "swal2-input";
                                input.placeholder = "Enter " + formatLabel(field);
                                input.type = isNumberField(field) ? "number" : "text";

                                container.appendChild(label);
                                container.appendChild(input);
                            });
                        },
                        preConfirm: () => {
                            const data = {};
                            missingFields.forEach((field, i) => {
                                if (!document.getElementById(`swal-input-${i}`).value.trim()) {
                                    Swal.showValidationMessage(`Please fill in "${formatLabel(field)}"`);
                                    return false; // stops closing until fixed
                                }
                                data[field] = document.getElementById(`swal-input-${i}`).value.trim();
                            });
                            return data;
                        }
                    }).then(res => {
                        if (res.isConfirmed) {
                            Swal.fire({
                                icon: "success",
                                title: "Added!",
                                text: "The missing data has been saved.",
                                timer: 1500,
                                showConfirmButton: false
                            });
                            fetch("/fixData", {
                                method: 'POST',
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    data: res.value,
                                    appid: appid,
                                    mode: 'fix'
                                })
                            })
                        }
                        else if (res.isDismissed) {
                            Swal.fire({
                                icon: "info",
                                title: "Cancelled",
                                text: "Game is not added",
                                timer: 1200,
                                showConfirmButton: false
                            });
                            fetch("/fixData", {
                                method: 'POST',
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    appid: appid,
                                    mode: 'remove'
                                })
                            })
                        }
                    });
                }

                openMissingForm(missing);

            }
        })
        .catch(err => console.error(err));
}



const steps = document.querySelectorAll("#gameWizard .step");
let currentStep = 0;

function showStep(index) {
    steps.forEach((step, i) => step.classList.toggle("active", i === index));
}
showStep(currentStep);

document.querySelectorAll(".nextBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            showStep(currentStep);
        }
    });
});

document.querySelectorAll(".backBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });
});

document.querySelector(".confirmBtn").addEventListener("click", async () => {
    // gather all form data here
    const gameData = {
        name: document.getElementById("gameName").value,
        appID: document.getElementById("appID").value,
        cover: document.getElementById("gameCover").files[0],
        price: document.getElementById("gamePrice").value,
        langs: document.getElementById("langs").value,
        rating: document.getElementById("gameRating").value,
        trademark: document.getElementById("trademarkText").value,
        min_requirements: document.getElementById("minReq").value,
        rec_requirements: document.getElementById("recReq").value,
        description: document.getElementById("gameDesc").value,
        genre1: document.getElementById("gameGenre1").value,
        genre2: document.getElementById("gameGenre2").value,
        screenshots: [
            document.getElementById("screenshot1").files[0],  // mandatory
            document.getElementById("screenshot2").files[0] || null,
            document.getElementById("screenshot3").files[0] || null,
            document.getElementById("screenshot4").files[0] || null
        ]
    };


    const exists = games.some(game => game.appid == document.getElementById("appID").value);
    if (!exists && gameData['appID'] > 0 && gameData['price'] >= 0 && gameData['rating'] >= 0) {
        const form = new FormData();

        // Files
        form.append("cover", gameData.cover);
        gameData.screenshots.forEach((screenshot, idx) => {
            if (screenshot) form.append(`screenshot${idx + 1}`, screenshot);
        });

        // Other fields
        for (const key in gameData) {
            if (key !== "cover" && key !== "screenshots") {
                form.append(key, gameData[key]);
            }
        }

        try {
            const res = await fetch("/upload_game", {
                method: "POST",
                body: form
            });

            const data = await res.json();
            if (data.success) {
                let timerInterval;
                Swal.fire({
                    title: "Added!",
                    icon: "success",
                    timer: 1500,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                        const timer = Swal.getPopup().querySelector("b");
                        timerInterval = setInterval(() => {
                            timer.textContent = `${Swal.getTimerLeft()}`;
                        }, 100);
                    },
                    willClose: () => {
                        clearInterval(timerInterval);
                    }
                })
            } else {
                console.error(data.error);
                let timerInterval;
                Swal.fire({
                    title: `Error: ${data.error}`,
                    icon: "error",
                    timer: 1500,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                        const timer = Swal.getPopup().querySelector("b");
                        timerInterval = setInterval(() => {
                            timer.textContent = `${Swal.getTimerLeft()}`;
                        }, 100);
                    },
                    willClose: () => {
                        clearInterval(timerInterval);
                    }
                })
            }
        } catch (err) {
            console.error(err);
            let timerInterval;
            Swal.fire({
                title: "Upload Error",
                icon: "error",
                timer: 1500,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                    const timer = Swal.getPopup().querySelector("b");
                    timerInterval = setInterval(() => {
                        timer.textContent = `${Swal.getTimerLeft()}`;
                    }, 100);
                },
                willClose: () => {
                    clearInterval(timerInterval);
                }
            })
        }
    }
    else {
        let timerInterval;
        Swal.fire({
            title: "Invalid Data! (Check that AppID is unique, and no negatives are allowed)",
            icon: "error",
            timer: 1500,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
                const timer = Swal.getPopup().querySelector("b");
                timerInterval = setInterval(() => {
                    timer.textContent = `${Swal.getTimerLeft()}`;
                }, 100);
            },
            willClose: () => {
                clearInterval(timerInterval);
            }
        })
    }
});