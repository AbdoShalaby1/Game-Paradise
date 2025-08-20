function initPage() {
    //preparing the variables
    const form = document.getElementById("loginForm");

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);

        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        return hashHex;
    }
    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        user = {
            name: email,
            password: await hashPassword(password)
        };
        fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        }).then(res => res.text()).then(
            txt => {
                if (txt === "True") {
                    window.location.href = link
                } else if (txt == "False") {
                    document.getElementById("password").setCustomValidity("❌ Wrong username or password");
                    document.getElementById("password").reportValidity();
                }
                else if (txt == "Admin") {
                    window.location.href = "/admin"
                }
                else if (txt == "banned") {
                    let timerInterval;
                    Swal.fire({
                        title: "You Have Been Banned!",
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
    });
}

document.addEventListener("DOMContentLoaded", initPage);