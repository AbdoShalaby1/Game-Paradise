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

function initPage() {
    let currentIndex = 0;
    const slides = document.querySelectorAll(".slide");
    const slidesContainer = document.querySelector(".slides");

    function showSlide(index) {
        currentIndex = (index + slides.length) % slides.length;
        slidesContainer.style.transform = `translateX(${-currentIndex * 1210}px)`;
    }

    document.querySelector(".next").addEventListener("click", () => {
        showSlide(currentIndex + 1);
        clearInterval(intervalId);
        setTimeout(() => {
            intervalId = setInterval(() => showSlide(currentIndex + 1), 5000);
        }, 10000);
    });
    document.querySelector(".prev").addEventListener("click", () => {
        showSlide(currentIndex - 1);
        clearInterval(intervalId);
        setTimeout(() => {
            intervalId = setInterval(() => showSlide(currentIndex + 1), 5000);
        }, 10000);
    });

    let cards = document.getElementsByClassName("game-card");

    for (let i = 0; i < cards.length; i++) {
        cards[i].addEventListener("click", () => {
            info(cards[i]);
        });
    }


    let intervalId = setInterval(() => showSlide(currentIndex + 1), 5000);
    
}



function info(card) { // img_path is the unique id
    imgPath = card.querySelector('img').getAttribute('src').replace("/static/", "");
    window.location.href = `/info?appid=${encodeURIComponent(imgPath.slice(7,-4))}`;
}


window.gameMap = {};

window.loadLibrary = async function() {
  const res = await fetch("/api/library");
  const library = await res.json();

  window.gameMap = {};
  for (const g of library) {
    window.gameMap[g.appid] = g;
  }
};



window.addEventListener('DOMContentLoaded', initPage);

