(function(){
  const cfg = window.POLYHEDRON || {};
  const ART_ENABLED = !!cfg.ART_ENABLED;
  const PLACEHOLDER = cfg.PLACEHOLDER_DATA_URI;
  const decks = Array.isArray(cfg.DECKS) ? cfg.DECKS : [];

  const cols = {
    beginner: document.getElementById('col-beginner'),
    advanced: document.getElementById('col-advanced'),
    expert: document.getElementById('col-expert'),
  };

  // Build DOM
  for(const d of decks){
    const tile = document.createElement('div');
    tile.className = `deck border-${d.border} ${d.unlocked ? 'unlocked' : 'locked'}`;
    tile.dataset.deckId = d.id;
    tile.dataset.unlocked = d.unlocked ? 'true' : 'false';
    tile.dataset.chibi = d.chibi;
    tile.dataset.commanderApi = d.commander_api;
    tile.dataset.deckUrl = d.deck_url;
    tile.dataset.buyUrl = d.buy_url;

    const img = document.createElement('img');
    img.alt = d.id;
    img.src = d.chibi;
    img.onerror = () => { img.src = PLACEHOLDER; };

    const label = document.createElement('div');
    label.className = 'compliance-label';
    label.textContent = 'Commander Card – Gameplay Reference';

    tile.appendChild(img);
    tile.appendChild(label);

    (cols[d.tier] || cols.beginner).appendChild(tile);
  }

  // Fetch Scryfall small image URI from a Scryfall API endpoint (named search)
  const artCache = new Map(); // deckId -> smallUrl

  async function getSmallArtUrl(deckEl){
    const deckId = deckEl.dataset.deckId;
    if(artCache.has(deckId)) return artCache.get(deckId);

    const api = deckEl.dataset.commanderApi;
    try{
      const res = await fetch(api, { headers: { 'Accept':'application/json' }});
      if(!res.ok) throw new Error('Scryfall error');
      const data = await res.json();

      // Support normal cards + double-faced layout
      let url = null;
      if(data && data.image_uris && data.image_uris.small){
        url = data.image_uris.small;
      } else if(data && Array.isArray(data.card_faces) && data.card_faces[0]?.image_uris?.small){
        url = data.card_faces[0].image_uris.small;
      }

      if(!url) throw new Error('No small image');
      artCache.set(deckId, url);
      return url;
    }catch(e){
      // If something fails, just keep chibi/placeholder.
      return null;
    }
  }

  function setToChibi(deckEl){
    const img = deckEl.querySelector('img');
    const label = deckEl.querySelector('.compliance-label');
    if(!img) return;
    img.src = deckEl.dataset.chibi || PLACEHOLDER;
    label && (label.style.display = 'none');
  }

  async function setToArt(deckEl){
    if(!ART_ENABLED) return;
    const img = deckEl.querySelector('img');
    const label = deckEl.querySelector('.compliance-label');
    if(!img) return;

    const url = await getSmallArtUrl(deckEl);
    if(url){
      img.src = url; // dynamically loaded, not hosted
      label && (label.style.display = 'block');
    }
  }

  function openBuy(deckEl){
    const url = deckEl.dataset.buyUrl;
    // Simple, iOS-safe confirmation. Replace later with modal.
    if(confirm('Deck locked. Buy to unlock?')){
      if(url) window.location.href = url;
    }
  }

  function goDeck(deckEl){
    const url = deckEl.dataset.deckUrl || '#';
    window.location.href = url;
  }

  // Interaction model:
  // Mobile: press+hold reveals art, release reverts; quick tap navigates (unlocked) or buy (locked).
  // Desktop: hover reveals, mouseleave reverts; click navigates (unlocked) or buy (locked).
  const HOLD_MS = 220;

  document.querySelectorAll('.deck').forEach(deckEl => {
    const unlocked = deckEl.dataset.unlocked === 'true';
    let holdTimer = null;
    let didHold = false;

    // Desktop hover
    deckEl.addEventListener('mouseenter', () => {
      if(unlocked) setToArt(deckEl);
    });
    deckEl.addEventListener('mouseleave', () => {
      if(unlocked) setToChibi(deckEl);
    });

    // Touch handling
    deckEl.addEventListener('touchstart', (e) => {
      didHold = false;
      if(!unlocked){
        // allow tap to trigger buy; no hold behavior
        return;
      }
      // Start hold timer
      holdTimer = setTimeout(() => {
        didHold = true;
        setToArt(deckEl);
      }, HOLD_MS);
    }, {passive:true});

    deckEl.addEventListener('touchend', (e) => {
      if(holdTimer){
        clearTimeout(holdTimer);
        holdTimer = null;
      }

      if(!unlocked){
        // Locked: tap opens buy confirm
        openBuy(deckEl);
        return;
      }

      if(didHold){
        // Release after hold: revert; DO NOT navigate
        setToChibi(deckEl);
        return;
      }

      // Quick tap: navigate
      goDeck(deckEl);
    });

    // Mouse click (desktop)
    deckEl.addEventListener('click', (e) => {
      // On mobile, click can fire after touch; avoid double action by ignoring if touch recently held.
      // We'll rely on touchend for mobile navigation.
      if('ontouchstart' in window) return;

      if(!unlocked){
        openBuy(deckEl);
      } else {
        goDeck(deckEl);
      }
    });
  });

})();