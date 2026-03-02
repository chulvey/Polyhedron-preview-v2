
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("deck-grid");
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
      const unlockedCount = decks.filter(d => d.unlocked).length;

      // Update progress UI
      if (progressFill && progressText) {
        const percent = total > 0 ? (unlockedCount / total) * 100 : 0;
        progressFill.style.width = percent + "%";
        progressText.textContent = `Progress: ${unlockedCount} / ${total} unlocked`;
      }

      // Clear grid
      grid.innerHTML = "";

      // Create 3 columns
      const tiers = ["beginner", "advanced", "expert"];
      const columns = {};

      tiers.forEach(tier => {
        const col = document.createElement("div");
        col.className = "tier-column";
        col.dataset.tier = tier;

        const header = document.createElement("div");
        header.className = "tier-header";
        header.textContent = tier.charAt(0).toUpperCase() + tier.slice(1);

        col.appendChild(header);
        grid.appendChild(col);

        columns[tier] = col;
      });

      // Render decks
      decks.forEach(deck => {
        const card = document.createElement("div");
        card.className = "deck-card";
        card.classList.add(deck.border || "silver");

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
          } else {
            window.location.href = deck.buy_url;
          }
        });

        if (columns[deck.tier]) {
          columns[deck.tier].appendChild(card);
        }
      });

    })
    .catch(err => {
      console.error("Failed to load decks.json", err);
    });
});
