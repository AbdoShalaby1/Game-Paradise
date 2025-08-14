// Function to send search input to Flask
function searchAPI() {
    const searchBox = document.getElementById("searchBox");
    const game = searchBox.value;
    fetch("/searchAPI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: game })
    })
        .then(response => response.text())
        .then(data => {
            console.log("Server response:", data);
            // Update page with results if needed
        });
}

function initSlider() {
    let currentIndex = 0;
    const slides = document.querySelectorAll(".slide");
    const slidesContainer = document.querySelector(".slides");

    function showSlide(index) {
        currentIndex = (index + slides.length) % slides.length;
        slidesContainer.style.transform = `translateX(${-currentIndex * 1200}px)`;
    }

    document.querySelector(".next").addEventListener("click", () => {
        showSlide(currentIndex + 1);
    });
    document.querySelector(".prev").addEventListener("click", () => {
        showSlide(currentIndex - 1);
    });

    setInterval(() => showSlide(currentIndex + 1), 5000);
    
    if (activeUser == "")
    {
        document.querySelector("nav").insertAdjacentHTML("beforeend",'<input type="button" onclick="return false;" id = "loginBtn" value="Log In/Sign Up">');
    }
    else
    {
        document.querySelector("nav").insertAdjacentHTML("beforeend",`<span id="welcome">Welcome! ${activeUser} </span> <input type="button" onclick="return false;" id = "logoutBtn" value="Log Out">`); // span is inline div
    }
}

window.addEventListener('DOMContentLoaded', initSlider);