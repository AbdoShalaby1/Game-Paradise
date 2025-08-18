// Navigation
document.querySelectorAll(".sidebar nav ul li").forEach(item => {
    item.addEventListener("click", () => {
        document.querySelectorAll(".sidebar nav ul li").forEach(li => li.classList.remove("active"));
        item.classList.add("active");

        document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
        document.getElementById(item.dataset.section).classList.add("active");

        document.getElementById("sectionTitle").innerText = item.innerText;
    });
});


function addSearchGame()
{
    let game = document.getElementById("searchGameName").value;
    fetch("/searchAPI", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ game })
        })
}