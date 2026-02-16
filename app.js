
const CARD_REFERENCE_ENABLED = true;

const decks = [];

// Generate 64 decks
for (let i = 1; i <= 64; i++) {
  let difficulty = "beginner";
  if (i > 4 && i <= 20) difficulty = "advanced";
  if (i > 20) difficulty = "expert";

  decks.push({
    id: i,
    name: "Deck " + i,
    difficulty: difficulty,
    unlocked: i <= 4,
    commanderImage: "https://api.scryfall.com/cards/named?exact=Plains"
  });
}

function renderDecks(filter = "all") {
  const grid = document.getElementById("deckGrid");
  grid.innerHTML = "";

  decks.forEach(deck => {
    if (filter !== "all" && deck.difficulty !== filter) return;

    const tile = document.createElement("div");
    tile.className = "tile";
    if (!deck.unlocked) tile.classList.add("locked");

    tile.innerHTML = `
      <div class="badge ${deck.difficulty}">${deck.difficulty}</div>
      <div>${deck.name}</div>
      ${deck.unlocked && CARD_REFERENCE_ENABLED ?
        '<div class="card-reference">Commander Card – Gameplay Reference</div>'
        : ''}
    `;

    grid.appendChild(tile);
  });
}

function filterDecks(type) {
  renderDecks(type);
}

renderDecks();
