
document.addEventListener("DOMContentLoaded", () => {

  const colBeginner = document.getElementById("colBeginner");
  const colAdvanced = document.getElementById("colAdvanced");
  const colExpert = document.getElementById("colExpert");

  const progressFill = document.querySelector(".progress-fill");
  const progressText = document.querySelector(".progress-text");

  fetch("decks.json")
    .then(res => res.json())
    .then(decks => {

      if (!Array.isArray(decks)) {
        console.error("Deck JSON is not an array.");
        return;
      }

      const total = decks.length;
      const unlockedCount = decks.filter(d => d.unlocked === true).length;

      // Update progress UI
      if (progressFill && progressText) {
        const percent = total > 0 ? (unlockedCount / total) * 100 : 0;
        progressFill.style.width = percent + "%";
        progressText.textContent = `Progress: ${unlockedCount} / ${total} unlocked`;
      }

      // Clear columns
      if (colBeginner) colBeginner.innerHTML = "";
      if (colAdvanced) colAdvanced.innerHTML = "";
      if (colExpert) colExpert.innerHTML = "";

      decks.forEach(deck => {

        const card = document.createElement("div");
        card.className = "deck-card " + (deck.border || "silver");

        const img = document.createElement("img");
        img.className = "deck-image";
        img.src = deck.chibi;
        img.alt = deck.name;

        if (!deck.unlocked) {
          img.style.filter = "grayscale(100%) brightness(0.6)";
        }

        const title = document.createElement("div");
        title.className = "deck-title";
        title.textContent = deck.name;

        card.appendChild(img);
        card.appendChild(title);

        card.addEventListener("click", () => {
          if (deck.unlocked) {
            window.location.href = deck.deck_url;
          } else if (deck.buy_url) {
            window.location.href = deck.buy_url;
          }
        });

        if (deck.tier === "beginner" && colBeginner) {
          colBeginner.appendChild(card);
        } else if (deck.tier === "advanced" && colAdvanced) {
          colAdvanced.appendChild(card);
        } else if (deck.tier === "expert" && colExpert) {
          colExpert.appendChild(card);
        }

      });

    })
    .catch(err => {
      console.error("Failed to load decks.json", err);
    });

});
