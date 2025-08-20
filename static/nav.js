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
                if (window.location.pathname == '/library' || window.location.pathname == '/cart')
                    window.location.href = '/';
                else
                    location.reload();

            });
        }
    });
}


function addBalance() {
    Swal.fire({
        title: 'Add Balance',
        text: 'Choose a payment method:',
        icon: 'info',
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: 'Close',
        html: `
          <div style="display:flex; flex-direction:column; gap:10px;">
            <button id="visaBtn" class="swal2-confirm swal2-styled" style="background:#0d6efd;">💳 Visa</button>
            <button id="cashBtn" class="swal2-confirm swal2-styled" style="background:#28a745;">📱 Vodafone / Etisalat / Orange Cash</button>
            <button id="instapayBtn" class="swal2-confirm swal2-styled" style="background:#ff9800;">🏦 Instapay</button>
          </div>
        `,
        didOpen: () => {
            document.getElementById('visaBtn').addEventListener('click', () => {
                Swal.fire({
                    title: 'Enter your Visa Number and Required amount to withdraw.',
                    icon: 'info',
                    html: `<input type="text" id="visaInput" class="swal2-input" placeholder="Enter Visa Card Number" style="margin-top:10px; border-radius:15px">
                            <input type="number" id="amountInput" class="swal2-input" placeholder="Withdraw (EGP)" style="margin-top:10px; border-radius:15px">`,
                    preConfirm: () => {
                        const visa = Swal.getPopup().querySelector('#visaInput').value;
                        const amount = Swal.getPopup().querySelector('#amountInput').value;
                        if (!visa || !amount) {
                            Swal.showValidationMessage(`Please enter both Visa number and amount`);
                        }
                        const visaPattern = /^4\d{12,18}$/;
                        if (visaPattern.test(visa)) {
                            if (amount > 0 && amount <= 10000) {
                                fetch('/addBalance', {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(amount)
                                }).then(response => {
                                    return response.text();
                                })
                                    .then(() => {
                                        let timerInterval;
                                        Swal.fire({
                                            title: "Success!",
                                            text: "Please note that the max amount your account can hold is EGP 999,999, If you added more than the rest will return to your account!",
                                            icon: "success",
                                            timer: 2000,
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
                                    })
                            }
                            else {
                                Swal.showValidationMessage(`Invalid amount: (Max per transaction is EGP 10,000)`);
                            }
                        }
                        else {
                            Swal.showValidationMessage(`Invalid Visa number!`);
                        }
                    }
                });
            });
            document.getElementById('cashBtn').addEventListener('click', () => {
                Swal.fire({
                    title: 'Enter your Phone Number and Required amount to withdraw.',
                    icon: 'info',
                    html: `<input type="text" id="visaInput" class="swal2-input" placeholder="Enter Phone Number" style="margin-top:10px; border-radius:15px">
                                            <input type="number" id="amountInput" class="swal2-input" placeholder="Withdraw (EGP)" style="margin-top:10px; border-radius:15px">`,
                    preConfirm: () => {
                        const visa = Swal.getPopup().querySelector('#visaInput').value;
                        const amount = Swal.getPopup().querySelector('#amountInput').value;
                        if (!visa || !amount) {
                            Swal.showValidationMessage(`Please enter both Phone number and amount`);
                        }
                        const visaPattern = /^01[0125]\d{8}$/;
                        if (visaPattern.test(visa)) {
                            if (amount > 0 && amount <= 10000) {
                                fetch('/addBalance', {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(amount)
                                }).then(response => {
                                    return response.text();
                                })
                                    .then(() => {
                                        let timerInterval;
                                        Swal.fire({
                                            title: "Success!",
                                            text: "Please note that the max amount your account can hold is EGP 999,999, If you added more than the rest will return to your account!",
                                            icon: "success",
                                            timer: 2000,
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
                                    })
                            }
                            else {
                                Swal.showValidationMessage(`Invalid amount: (Max per transaction is EGP 10,000)`);
                            }
                        }
                        else {
                            Swal.showValidationMessage(`Invalid Phone Number!`);
                        }
                    }
                });
            });
            document.getElementById('instapayBtn').addEventListener('click', () => {
                Swal.fire({
                    title: 'Enter your Phone Number Linked to instapay and Required amount to withdraw.',
                    icon: 'info',
                    html: `<input type="text" id="visaInput" class="swal2-input" placeholder="Enter Phone Number" style="margin-top:10px; border-radius:15px">
                                                            <input type="number" id="amountInput" class="swal2-input" placeholder="Withdraw (EGP)" style="margin-top:10px; border-radius:15px">`,
                    preConfirm: () => {
                        const visa = Swal.getPopup().querySelector('#visaInput').value;
                        const amount = Swal.getPopup().querySelector('#amountInput').value;
                        if (!visa || !amount) {
                            Swal.showValidationMessage(`Please enter both Phone number and amount`);
                        }
                        const visaPattern = /^01[0125]\d{8}$/;
                        if (visaPattern.test(visa)) {
                            if (amount > 0 && amount <= 10000) {
                                fetch('/addBalance', {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(amount)
                                }).then(response => {
                                    return response.text();
                                })
                                    .then(() => {
                                        let timerInterval;
                                        Swal.fire({
                                            title: "Success!",
                                            text: "Please note that the max amount your account can hold is EGP 999,999, If you added more than the rest will return to your account!",
                                            icon: "success",
                                            timer: 2000,
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
                                    })
                            }
                            else {
                                Swal.showValidationMessage(`Invalid amount: (Max per transaction is EGP 10,000)`);
                            }
                        }
                        else {
                            Swal.showValidationMessage(`Invalid Phone Number!`);
                        }
                    }
                });
            });
        }
    });
}

function initNav(searchBar = 'active', username = 'active') {
    if (searchBar == 'active') {
        document.querySelector("body").insertAdjacentHTML("afterbegin", `<header>
                    <a href="/">
                        <div id="brandName"><img src="static/images/brand.png" id="logo">Game Paradise
                        </div>
                    </a>
                    <div id="searchDiv">
                        <form id="searchForm" action="/search" method="get">
                            <input type="text" id="searchBox" placeholder="Search..." name="q" value="${q}">
            
                            <button type="submit" id="searchBtn" aria-label="Search">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                    viewBox="0 0 16 16">
                                    <path
                                        d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                </svg>
                            </button>
                        </form>
                    </div>
                    <nav>
                        <a href="/">Store</a>
                        <a href="/library">Library</a>
                        <a href="/wishlist">Wishlist</a>
                        <a id='cartM' href="/cart" >Cart</a>
                    </nav>
                </header>`)

        if (username == 'active') {
            if (activeUser == "") {
                document.querySelector("nav").insertAdjacentHTML("beforeend", `<input type="button" onclick="document.location.href = '/login'" id = "loginBtn" value="Log In/Sign Up">`);
            }
            else {
                document.querySelector("nav").insertAdjacentHTML("beforeend", `<span id="welcome">Welcome! ${activeUser} </span>`); // span is inline div
                document.querySelector("nav").insertAdjacentHTML("beforeend", `<span id="user-balance">EGP ${balance}</span>`);
                document.querySelector("nav").insertAdjacentHTML("beforeend", `<input type="button" onclick="addBalance()" id="add-balance" value = "+">`);
                document.querySelector("nav").insertAdjacentHTML("beforeend", `<input type="button" onclick="logout()" id = "logoutBtn" value="Log Out">`);
            }
        }
        else {
            document.querySelector("#cartM").style.marginRight = '30px'
        }

    }
    else {
        document.querySelector("body").insertAdjacentHTML("afterbegin", `<header>
                            <a href="/">
                                <div id="brandName"><img src="static/images/brand.png" id="logo">Game Paradise
                                </div>
                            </a>
                            <nav>
                                <a href="/">Store</a>
                                <a href="/library">Library</a>
                                <a href="/wishlist">Wishlist</a>
                                <a id='cartM' href="/cart" >Cart</a>
                            </nav>
                        </header>`)
        if (username == 'active') {
            if (activeUser == "") {
                document.querySelector("nav").insertAdjacentHTML("beforeend", `<input type="button" onclick="document.location.href = '/login'" id = "loginBtn" value="Log In/Sign Up">`);
            }
            else {
                document.querySelector("nav").insertAdjacentHTML("beforeend", `<span id="welcome">Welcome! ${activeUser} </span>`); // span is inline div
                document.querySelector("nav").insertAdjacentHTML("beforeend", `<span id="user-balance">EGP ${balance}</span>`);
                document.querySelector("nav").insertAdjacentHTML("beforeend", `<input type="button" onclick="addBalance()" id="add-balance" value = "+">`);
                document.querySelector("nav").insertAdjacentHTML("beforeend", `<input type="button" onclick="logout()" id = "logoutBtn" value="Log Out">`);
            }
        }
        else {
            document.querySelector("#cartM").style.marginRight = '70px'
        }
    }
}
