function initPage() {
    if (activeUser == "") {
        document.querySelector("nav").insertAdjacentHTML("beforeend", '<input type="button" onclick="return false;" id = "loginBtn" value="Log In/Sign Up">');
    }
    else {
        document.querySelector("nav").insertAdjacentHTML("beforeend", `<span id="welcome">Welcome! ${activeUser} </span> <input type="button" onclick="return false;" id = "logoutBtn" value="Log Out">`); // span is inline div
    }

    const screenshots = JSON.parse(document.getElementById('screenshot-data').textContent);
    let currentIndex = 0;

    const imgEl = document.getElementById('screenshot-img');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

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

function addToCart() {
    let priceS = document.querySelector('p').textContent;
    priceS = priceS.replace("$", "")
    img_path = (window.getComputedStyle(document.querySelector('.image-swap')).getPropertyValue('background-image'))
    img_path = img_path.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    img_path = img_path.replace("/static", "");
    let url = new URL(img_path);
    console.log(url.pathname)
    selected = {
        name: document.querySelector('h1').textContent,
        price: parseFloat(priceS),
        img_path: url.pathname
    };

    fetch("/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected })
    })

    window.alert("Added!");
}

function logout() {
    fetch("/logout")
        .then(() => {
            window.location.href = '/';
        });
}

window.addEventListener('DOMContentLoaded', initPage);
