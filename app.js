const ART_ENABLED = true;
document.querySelectorAll('.deck').forEach(deck=>{
 const unlocked = deck.dataset.unlocked === "true";
 const img = deck.querySelector('.card-img');
 const chibi = "assets/chibis/PlaceholderChibi.png";
 const commander = "https://cards.scryfall.io/small/front/8/3/83d5b85f-d9c8-4bb7-b5e5-6c1c0fdf7df5.jpg";
 let showing = false;
 deck.addEventListener('click',()=>{
  if(!unlocked){ alert("Deck locked. Buy to unlock."); return; }
  if(!showing){ img.src = commander; showing = true; }
  else{ img.src = chibi; showing = false; }
 });
});
