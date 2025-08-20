let cartItemsEl;
let totalEl;
let total;
let usedCoupon = 0
function updateTotal() {
    total = 0;
    const prices = document.querySelectorAll(".cart-item .price");
    prices.forEach(price => {
        total += parseFloat(price.textContent.replace("EGP ", ""));
    });
    document.querySelector(".total-price").textContent = `EGP ${total.toFixed(2)}`;
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
        totalEl.textContent = "EGP 0.00";
    }
}

function initPage() {
    cartItemsEl = document.querySelector(".cart-items"); // container for cart items
    totalEl = document.querySelector(".total-price"); // element that shows total price
    if (cartItemsEl.children.length === 1) {
        cartItemsEl.innerHTML = `<h2 style="text-align:center; margin-top:20px;">Your cart is empty 🛒</h2>`;
        totalEl.textContent = "EGP 0.00";
    }
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", removeItem);
    });

    document.querySelectorAll(".cart-item").forEach(card => {
        const img = card.querySelector("img"); // get the image inside the card
        img.addEventListener("click", () => {
            let imgPath = img.getAttribute('src').replace("/static/", "");
            imgPath = imgPath.slice(8, -4)
            window.location.href = `/info?appid=${imgPath}`;
        });
    });

    document.querySelector(".checkout-btn").addEventListener("click", () => {
        let balanceEl = document.querySelector("#user-balance");

        let balance = parseFloat(balanceEl.textContent.replace("EGP ", ""));
        total = parseFloat(totalEl.textContent.replace("EGP ", ""));

        if (total === 0) {
            let timerInterval;
            Swal.fire({
                title: "Your cart is empty!",
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
            return;
        }

        if (balance >= total) {
            balance -= total;
            balanceEl.textContent = `EGP ${balance.toFixed(2)}`;
            totalEl.textContent = "EGP 0.00";
            cartItemsEl.innerHTML = `<h2 style="text-align:center; margin-top:20px;">Your cart is empty 🛒</h2>`;
            selected = {
                img_path: "all"
            };

            checkout().then(() => {
                return fetch("/removeFromCart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ selected })
                });
            });

            let timerInterval;
            Swal.fire({
                title: "Purchase Successful!",
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
        }
        else {
            let timerInterval;
            Swal.fire({
                title: "Not Enough Balance!",
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

    // Coupon system

    document.querySelector(".apply-coupon-btn").addEventListener("click", () => {
        const couponInput = document.querySelector("#coupon").value.trim();
        if (!usedCoupon) {
            if (couponInput === "SAVE10" || couponInput === "DISCOUNT") {
                let total = parseFloat(document.querySelector(".total-price").textContent.replace("EGP ", ""));
                total = total * 0.9; // 10% off
                usedCoupon = 1;
                document.querySelector(".total-price").textContent = `EGP ${total.toFixed(2)}`;
                let timerInterval;
                Swal.fire({
                    title: "Coupon Applied, Enjoy 10% off!",
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
            }
            else {
                let timerInterval;
                Swal.fire({
                    title: "Invalid Coupon!",
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
                title: "You can use at most 1 coupon with each purchase!",
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
}


function checkout() {
    return fetch("/checkout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            items: cart,
            total: total
        })
    })
}

document.addEventListener("DOMContentLoaded", () => {
    initPage();
    updateTotal();
    loadRecommendedGames();
});
