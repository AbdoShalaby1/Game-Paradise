let cartItemsEl;
let totalEl;
// Remove items from cart
function updateTotal() {
    let total = 0;
    const prices = document.querySelectorAll(".cart-item .price");
    prices.forEach(price => {
        total += parseFloat(price.textContent.replace("$", ""));
    });
    document.querySelector(".total-price").textContent = `$${total.toFixed(2)}`;
}

function removeItem(event) {
    const button = event.target;
    const cartItem = button.closest(".cart-item");

    selected = {
        img_path: cartItem.querySelector('img').getAttribute('src').replace("/static/", "")
    };

    fetch("/removeFromCart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected })
    })
    cartItem.remove();
    updateTotal();
    console.log(cartItemsEl.children.length)
    if (cartItemsEl.children.length === 1) {
        cartItemsEl.innerHTML = `<h2 style="text-align:center; margin-top:20px;">Your cart is empty 🛒</h2>`;
        totalEl.textContent = "$0.00";
    }
}

function initPage() {
    cartItemsEl = document.querySelector(".cart-items"); // container for cart items
    totalEl = document.querySelector(".total-price"); // element that shows total price
    if (cartItemsEl.children.length === 1) {
        cartItemsEl.innerHTML = `<h2 style="text-align:center; margin-top:20px;">Your cart is empty 🛒</h2>`;
        totalEl.textContent = "$0.00";
    }
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", removeItem);
    });

    document.querySelector(".checkout-btn").addEventListener("click", () => {
        let balanceEl = document.querySelector(".balance-amount");

        let balance = parseFloat(balanceEl.textContent.replace("$", ""));
        let total = parseFloat(totalEl.textContent.replace("$", ""));

        if (total === 0) {
            alert("Your cart is empty!");
            return;
        }

        if (balance >= total) {
            balance -= total;
            balanceEl.textContent = `$${balance.toFixed(2)}`;
            totalEl.textContent = "$0.00";
            cartItemsEl.innerHTML = `<h2 style="text-align:center; margin-top:20px;">Your cart is empty 🛒</h2>`;
            alert("Purchase successful! Enjoy your games 🎮");
            checkout();
            selected = {
                img_path: "all",
            };

            fetch("/removeFromCart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({selected})
            })
        }
        else {
            alert("Not enough balance to complete the purchase.");
        }
    });

    // Coupon system

    document.querySelector(".apply-coupon-btn").addEventListener("click", () => {
        const couponInput = document.querySelector("#coupon").value.trim();

        if (couponInput === "SAVE10") {
            let total = parseFloat(document.querySelector(".total-price").textContent.replace("$", ""));
            total = total * 0.9; // 10% off
            document.querySelector(".total-price").textContent = `$${total.toFixed(2)}`;
            alert("Coupon applied! 10% off your order.");
        }
        else {
            alert("Invalid coupon code.");
        }
    });

    // Add funds

    document.querySelector(".add-funds-btn").addEventListener("click", () => {
        let balanceEl = document.querySelector(".balance-amount");
        let balance = parseFloat(balanceEl.textContent.replace("$", ""));
        let amountToAdd = parseFloat(document.querySelector(".funds-input").value);

        if (!isNaN(amountToAdd) && amountToAdd > 0) {
            balance += amountToAdd;
            balanceEl.textContent = `$${balance.toFixed(2)}`;
            document.querySelector(".funds-input").value = "";
            alert(`$${amountToAdd.toFixed(2)} added successfully!`);
        }
        else {
            alert("Please enter a valid amount greater than 0.");
        }
    });

    if (activeUser == "") {
        document.querySelector("nav").insertAdjacentHTML(
                  "beforeend",
                  "<input type='button' id='loginBtn' value='Log In/Sign Up' onclick=\"location.href='/login'\">"
                );
    }
    else {
        document.querySelector("nav").insertAdjacentHTML("beforeend", `<span id="welcome">Welcome! ${activeUser} </span> <input type="button" onclick="return false;" id = "logoutBtn" value="Log Out">`); // span is inline div
    }
}


// Recommended games (dynamic)

const recommendedGames = [
    {
        name: "Marvel Spider-Man",
        price: 39.99,
        image: "Images/Spider-Man_PS4_cover.jpg",
        link: "#"
    },
    {
        name: "Ghost of Tsushima",
        price: 49.99,
        image: "Images/Ghost_of_Tsushima.jpg",
        link: "#"
    }
];

function loadRecommendedGames() {
    const recommendedRow = document.querySelector(".recommended-row");
    recommendedRow.innerHTML = ""; // Clear existing

    recommendedGames.forEach(game => {
        const card = document.createElement("div");
        card.classList.add("recommend-card");
        card.innerHTML = `
            <img src="${game.image}" alt="${game.name}">
            <div class="recommend-info">
                <p>${game.name}</p>
                <span>$${game.price.toFixed(2)}</span>
                <a href="${game.link}" class="view-btn">View Game</a>
            </div>
        `;
        recommendedRow.appendChild(card);
    });
}


function checkout()
{
    fetch("/api/library/bulk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ items: cart })
            })
}

document.addEventListener("DOMContentLoaded", () => {
    initPage();
    updateTotal();
    loadRecommendedGames();
});
