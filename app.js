(function(){
  const cfg = window.POLYHEDRON || {};
  const ART_ENABLED = !!cfg.ART_ENABLED;
  const PLACEHOLDER = cfg.PLACEHOLDER_DATA_URI;
  const HOLD_MS = Number(cfg.HOLD_MS || 220);

  const colBeginner = document.getElementById('col-beginner');
  const colAdvanced = document.getElementById('col-advanced');
  const colExpert = document.getElementById('col-expert');

  const artCache = new Map(); // id -> small url

  async function getSmallArtUrl(deck){
    if(artCache.has(deck.id)) return artCache.get(deck.id);
    try{
      const res = await fetch(deck.commander_api, { headers:{'Accept':'application/json'} });
      if(!res.ok) throw new Error('Scryfall error');
      const data = await res.json();
      let url = null;
      if(data?.image_uris?.small) url = data.image_uris.small;
      else if(Array.isArray(data?.card_faces) && data.card_faces[0]?.image_uris?.small) url = data.card_faces[0].image_uris.small;
      if(!url) throw new Error('No small image');
      artCache.set(deck.id, url);
      return url;
    }catch(e){
      return null;
    }
  }

  function setToChibi(deckEl, deck){
    const img = deckEl.querySelector('img');
    const label = deckEl.querySelector('.compliance-label');
    img.src = deck.chibi;
    label.style.display = 'none';
  }

  async function setToArt(deckEl, deck){
    if(!ART_ENABLED) return;
    const img = deckEl.querySelector('img');
    const label = deckEl.querySelector('.compliance-label');
    const url = await getSmallArtUrl(deck);
    if(url){
      img.src = url;
      label.style.display = 'block';
    }
  }

  function openBuy(deck){
    if(confirm('Deck locked. Buy to unlock?')){
      window.location.href = deck.buy_url;
    }
  }

  function goDeck(deck){
    window.location.href = deck.deck_url;
  }

  function makeTile(deck){
    const wrap = document.createElement('div');
    wrap.className = 'tile-wrap';

    const deckEl = document.createElement('div');
    deckEl.className = `deck border-${deck.border} ${deck.unlocked ? 'unlocked' : 'locked'}`;

    const img = document.createElement('img');
    img.alt = deck.name;
    img.src = deck.chibi;
    img.onerror = () => { img.src = PLACEHOLDER; };

    const label = document.createElement('div');
    label.className = 'compliance-label';
    label.textContent = 'Commander Card – Gameplay Reference';

    deckEl.appendChild(img);
    deckEl.appendChild(label);

    const name = document.createElement('div');
    name.className = 'deck-name';
    name.textContent = deck.name;

    wrap.appendChild(deckEl);
    wrap.appendChild(name);

    // Interactions
    const unlocked = !!deck.unlocked;
    let holdTimer = null;
    let didHold = false;

    // Desktop hover
    deckEl.addEventListener('mouseenter', () => {
      if(unlocked) setToArt(deckEl, deck);
    });
    deckEl.addEventListener('mouseleave', () => {
      if(unlocked) setToChibi(deckEl, deck);
    });

    // Mobile press & hold
    deckEl.addEventListener('touchstart', () => {
      didHold = false;
      if(!unlocked) return;

      holdTimer = setTimeout(() => {
        didHold = true;
        setToArt(deckEl, deck);
      }, HOLD_MS);
    }, {passive:true});

    deckEl.addEventListener('touchend', () => {
      if(holdTimer){
        clearTimeout(holdTimer);
        holdTimer = null;
      }

      if(!unlocked){
        openBuy(deck);
        return;
      }

      if(didHold){
        setToChibi(deckEl, deck);
        return;
      }

      goDeck(deck);
    });

    // Desktop click
    deckEl.addEventListener('click', () => {
      if('ontouchstart' in window) return;
      if(!unlocked) openBuy(deck);
      else goDeck(deck);
    });

    return wrap;
  }

  async function init(){
    const res = await fetch('decks.json');
    const decks = await res.json();

    // Render into columns based on tier
    decks.forEach(deck => {
      const tile = makeTile(deck);
      if(deck.tier === 'beginner') colBeginner.appendChild(tile);
      else if(deck.tier === 'advanced') colAdvanced.appendChild(tile);
      else colExpert.appendChild(tile);
    });

    // Update progress bar
    const unlockedCount = decks.filter(d => d.unlocked).length;
    const denom = 64;
    const pct = Math.max(0, Math.min(100, (unlockedCount/denom)*100));
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressText').textContent = `Progress: ${unlockedCount} / ${denom} unlocked`;
  }

  init().catch(() => {
    // If decks.json can't be loaded (wrong path), do nothing.
  });
})();