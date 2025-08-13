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
    const slides = document.querySelectorAll('.slide');
    let index = 0;

    function showSlide(i) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[i].classList.add('active');
    }

    document.querySelector('.next').addEventListener('click', () => {
        index = (index + 1) % slides.length;
        showSlide(index);
    });

    document.querySelector('.prev').addEventListener('click', () => {
        index = (index - 1 + slides.length) % slides.length;
        showSlide(index);
    });

    showSlide(index); // show first image initially
}
    
window.addEventListener('DOMContentLoaded', initSlider);

