function initPage() {
    const screenshots = JSON.parse(document.getElementById('screenshot-data').textContent);
    let currentIndex = 0;

    const imgEl = document.getElementById('screenshot-img');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    img_path = (window.getComputedStyle(document.querySelector('.image-swap')).getPropertyValue('background-image'))
    img_path = img_path.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    img_path = img_path.replace("/static", "");
    console.log(img_path)
    function updateImage() {
        imgEl.src = `/static/${screenshots[currentIndex - 1]['img_path']}`;
    }

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + screenshots.length) % (screenshots.length + 1);
        if (currentIndex == 0) {
            document.querySelector("#screenshot-img").style.display = "none";
            document.querySelector("#screenshots iframe").style.display = "block";
        }
        else {
            document.querySelector("#screenshot-img").style.display = "block";
            document.querySelector("#screenshots iframe").style.display = "none";
        }
        updateImage();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % (screenshots.length + 1);
        if (currentIndex == 0) {
            document.querySelector("#screenshot-img").style.display = "none";
            document.querySelector("#screenshots iframe").style.display = "block";
        }
        else {
            document.querySelector("#screenshot-img").style.display = "block";
            document.querySelector("#screenshots iframe").style.display = "none";
        }
        updateImage();
    });

    if (!owned) {
        document.querySelector("#info-container").insertAdjacentHTML("beforeend",
            `<button id="B">Buy Now</button>
                    <button class="A" onclick="addToCart()">Add To Cart</button>
                    <button class="A" id="add-to-wishlist">Add To Wishlist</button>`
        )
        btn = document.querySelector('#B');
        let priceS = document.querySelector('p').textContent;
        priceS = priceS.replace("EGP ", "")
        img_path = (window.getComputedStyle(document.querySelector('.image-swap')).getPropertyValue('background-image'))
        img_path = img_path.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        img_path = img_path.replace("/static", "");
        let url = new URL(img_path);

        selected = {
            name: document.querySelector('h1').textContent,
            price: parseFloat(priceS),
            img_path: url.pathname
        };
        const list = [selected];

        btn.addEventListener('click', () => {
            if (activeUser != '' && balance >= parseFloat(priceS)) {
                Swal.fire({
                    title: 'Are you sure?',
                    text: "Do you want to buy this game?",
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, buy it!',
                    cancelButtonText: 'No, cancel',
                    reverseButtons: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        fetch("/checkout", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                items: list,
                                total: parseFloat(priceS)
                            })
                        })
                            .then(() => {
                                return fetch("/removeFromCart", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        selected: { img_path: url.pathname }
                                    })
                                });
                            })
                            .then(() => {
                                Swal.fire(
                                    'Purchased!',
                                    'The game has been added to your library.',
                                    'success'
                                ).then(() => {
                                    // reload after user sees the success popup
                                    window.location.reload();
                                });
                            })
                            .catch(err => {
                                Swal.fire("Error", "Something went wrong during checkout!", "error");
                                console.error(err);
                            });
                    }
                });
            }
            else if (balance < parseFloat(priceS)) {
                Swal.fire(
                    'Error!',
                    'Insufficient Balance.',
                    'error'
                )
            }
            else {
                window.location.href = '/login';
            }

        });

    }
    else {
        document.querySelector("#info-container").insertAdjacentHTML("beforeend",
            `<button id="B"></button>`
        )
        document.querySelector('#info-container').style.marginTop = '30px'
        btn = document.querySelector('#B');
        const params = new URLSearchParams(window.location.search);
        appid = params.get("appid");
        const installed = localStorage.getItem("installed_" + appid);
        btn.textContent = installed ? 'Play' : 'Install';
        btn.addEventListener('click', () => {
            const state = localStorage.getItem("installed_" + appid);
            if (state) {
                // simulate play
                fetch("/gameplay", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: gameName })
                })
                    .then(res => res.text())
                    .then(data => {
                        window.location.href = "https://www.youtube.com/watch?v=" + data + "?autoplay=1?fullscreen=1";
                    })
            } else {
                let timerInterval;
                Swal.fire({
                    title: 'Installing...',
                    html: '<b></b>',
                    timer: 5000, // total install time in ms
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
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.timer) {
                        Swal.fire(
                            'Installed!',
                            'The game has been successfully installed.',
                            'success'
                        );
                    }
                });

                btn.textContent = 'Play';
                localStorage.setItem("installed_" + appid, '1');
                btn.classList.add('installed');
                // optional visual effect
                btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 300 });
            }
        });
    }


    const infoWishlistBtn = document.getElementById('add-to-wishlist');
    if (infoWishlistBtn) {
        infoWishlistBtn.addEventListener('click', function () {
            let priceS = document.querySelector('p').textContent;
            priceS = priceS.replace("EGP ", "")
            let img_path = (window.getComputedStyle(document.querySelector('.image-swap')).getPropertyValue('background-image'))
            img_path = img_path.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
            img_path = img_path.replace("/static", "");
            let url = new URL(img_path);
            params = new URLSearchParams(window.location.search);
            let appid = params.get("appid");
            let name = document.querySelector('h1').textContent;
            price = parseFloat(priceS);
            img_path = url.pathname;

            addToWishlist({
                appid,
                name,
                img_path,
                price
            });
        });
    }

    function addToWishlist(item) {
        if (!activeUser) {
            let timerInterval;
            Swal.fire({
                title: "Log in first!",
                icon: "warning",
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

        fetch('/add_to_wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ item })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    let timerInterval;
                    Swal.fire({
                        title: "Added to wishlist!",
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
                } else if (data.error) {
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
            });
    }

}

function percentageToStars(percentage) {
    const totalStars = 5;
    const filledStars = (percentage / 100) * totalStars;
    let output = '';

    for (let i = 1; i <= totalStars; i++) {
        if (i <= filledStars) {
            output += '<i class="fa-solid fa-star"></i>'; // full star
        } else if (i - filledStars < 1) {
            output += '<i class="fa-solid fa-star-half-stroke"></i>';
        } else {
            output += '<i class="fa-regular fa-star"></i>'; // empty star
        }
    }

    document.getElementsByClassName('stars')[0].innerHTML = output;
    document.getElementsByClassName('stars')[1].innerHTML = output;
}

async function addToCart() {
    let priceS = document.querySelector('p').textContent;
    priceS = priceS.replace("EGP ", "")
    img_path = (window.getComputedStyle(document.querySelector('.image-swap')).getPropertyValue('background-image'))
    img_path = img_path.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    img_path = img_path.replace("/static", "");
    let url = new URL(img_path);


    selected = {
        name: document.querySelector('h1').textContent,
        price: parseFloat(priceS),
        img_path: url.pathname
    };

    let value = await (await fetch("/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected })
    })).text() // you have to await the response too

    if (value == "401") {
        window.location.href = '/login'
    }
    else if (value == "") {
        let timerInterval;
        Swal.fire({
            title: "Added to Cart!",
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
            title: "Item Added Previously!",
            icon: "warning",
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
window.addEventListener('DOMContentLoaded', initPage);
