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
                } else {
                    document.getElementById("password").setCustomValidity("❌ Wrong username or password");
                    document.getElementById("password").reportValidity();
                }
            });
    });
}

document.addEventListener("DOMContentLoaded", initPage);