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