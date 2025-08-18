document.addEventListener("DOMContentLoaded", () => {

    const gameCards = document.querySelectorAll(".main-content");

    gameCards.forEach(card => {

        const addBtn = card.querySelector(".add");
        addBtn.addEventListener("click", () => {
            const gameName = card.querySelector(".Game-info h2").textContent;
            alert(`${gameName} has been added successfully ✅`);
        });

        const removeBtn = card.querySelector(".remove");
        removeBtn.addEventListener("click", () => {
            card.remove();
        });
    });
});
