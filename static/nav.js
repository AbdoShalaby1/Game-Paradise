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
                document.querySelector("nav").insertAdjacentHTML("beforeend", `<input type="button" onclick="logout()" id = "logoutBtn" value="Log Out">`);
            }
        }
        else {
            document.querySelector("#cartM").style.marginRight = '70px'
        }
    }
}
