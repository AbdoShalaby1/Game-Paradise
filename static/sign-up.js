function initPage() {
    const form = document.getElementById("signupForm");

    form.addEventListener("submit", async function (e) {
        const firstName = document.getElementById("firstName");
        const email = document.getElementById("email");
        const password = document.getElementById("password");

        const firstNameError = document.getElementById("firstNameError");
        const emailError = document.getElementById("emailError");
        const passwordError = document.getElementById("passwordError");
        let valid = true;

        // First name validation -> not null
        if (firstName.value.trim() === "") {
            firstNameError.style.display = "block";
            valid = false;
        } else {
            firstNameError.style.display = "none";
        }

        // Email validation by regex
        const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
        if (!email.value.match(emailPattern) || email.value == "admin@game-paradise.com") {
            emailError.style.display = "block";
            valid = false;
        } else {
            emailError.style.display = "none";
        }

        // Password validation by regex
        const passwordPattern = /^(?=.*[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~`])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
        if (!password.value.match(passwordPattern)) {
            passwordError.style.display = "block";
            valid = false;
        } else {
            passwordError.style.display = "none";
        }
        e.preventDefault();

        if (valid)
        {
            async function hashPassword(password) {
                const encoder = new TextEncoder();
                const data = encoder.encode(password);
        
                const hashBuffer = await crypto.subtle.digest("SHA-256", data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        
                return hashHex;
            }

            user =
            {
                name : firstName.value.trim(),
                email : email.value,
                password : await hashPassword(password.value)
            }
            const response = await (await fetch("/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(user)
                    })).text();
            
            if (response == 'True')
            {
                window.location.href = '/login';
            }
            else
            {
                window.alert('Duplicate Data!');
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", initPage);