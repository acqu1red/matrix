(function(){
  const tg = window.Telegram?.WebApp;
  if (tg) { try { tg.expand(); tg.ready(); } catch(e){} }

  // State
  const STATE = {
    total: 6, have: 0, sound:false,
    hotspots: [],
  };

  const $ = (q,root=document)=>root.querySelector(q);
  const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));

  // Elements
  const progressBar = $('#progress-bar');
  const progressCount = $('#progress-count');
  const progressTotal = $('#progress-total');
  const toast = $('#toast');
  const modal = $('#modal');
  const modalBackdrop = $('#modal-backdrop');

  progressTotal.textContent = STATE.total;

  // Parallax
  const scene = $('#scene');
  const layers = $$('.layer', scene);
  let px=0, py=0;
  function parallax(e){
    const rect = scene.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    px = (x/rect.width - 0.5); py = (y/rect.height - 0.5);
    layers.forEach((l,i)=>{
      const depth = i===0?3:i===1?8:i===2?16:6;
      l.style.transform = `translate3d(${(-px*depth)}px, ${(-py*depth)}px, 0)`;
    });
  }
  scene.addEventListener('mousemove', parallax, {passive:true});
  scene.addEventListener('touchmove', parallax, {passive:true});

  // Hotspots
  const hotspots = [
    {x:.22, y:.62, type:'tap'},
    {x:.36, y:.52, type:'hold'},
    {x:.52, y:.58, type:'minigame', game:'ripple'},
    {x:.68, y:.50, type:'tap'},
    {x:.75, y:.70, type:'minigame', game:'dial'},
    {x:.58, y:.76, type:'tap'},
    {x:.42, y:.72, type:'hold'},
    {x:.30, y:.78, type:'minigame', game:'const'},
    {x:.18, y:.50, type:'tap'},
    {x:.84, y:.40, type:'tap'},
    {x:.62, y:.40, type:'tap'},
    {x:.48, y:.34, type:'hold'}
  ];
  const hotspotsRoot = $('#hotspots');
  hotspots.forEach((h,i)=>{
    const el = document.createElement('button');
    el.className = 'hotspot';
    el.style.left = (h.x*100)+'%';
    el.style.top = (h.y*100)+'%';
    el.innerHTML = '<div class="core"></div>';
    hotspotsRoot.appendChild(el);

    if (h.type==='tap') el.addEventListener('click', ()=>reward(1));
    else if (h.type==='hold') {
      let t; el.addEventListener('touchstart',start); el.addEventListener('mousedown',start);
      el.addEventListener('touchend',cancel); el.addEventListener('mouseup',cancel); el.addEventListener('mouseleave',cancel);
      function start(){ cancel(); t = setTimeout(()=>{ reward(1); }, 800); }
      function cancel(){ if(t){ clearTimeout(t); t=null; } }
    } else if (h.type==='minigame'){
      el.addEventListener('click', ()=> launchMinigame(h.game));
    }
  });

  function reward(n){
    STATE.have = Math.min(STATE.total, STATE.have + n);
    updateProgress();
    showToast(`+${n} страница`);
    vibrate(12);
    if (STATE.have>=Math.floor(STATE.total*0.7)) {
      // suggest pay
      showToast('Почти готово! Открой полную книгу через оплату.');
    }
  }

  function updateProgress(){
    const p = (STATE.have/STATE.total*100)|0;
    progressBar.style.width = p + '%';
    progressCount.textContent = STATE.have;
  }

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'), 1600);
  }
  function vibrate(ms){ if (navigator.vibrate) try{ navigator.vibrate(ms) }catch(e){} }

  // Buttons
  $('#btn-pay').addEventListener('click', ()=>{
    const url = 'https://acqu1red.github.io/formulaprivate/payment.html';
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(url, { try_instant_view:false });
    } else {
      location.href = url;
    }
  });
  $('#btn-open-book').addEventListener('click', ()=>{
    openModal(`<h3>Книга недели</h3><p>Собери ${STATE.total} страниц, чтобы открыть полный пост в приватном канале. У тебя уже <b>${STATE.have}</b> страниц.</p>
      <div style="display:flex;gap:10px;margin-top:8px">
        <button class="btn primary" id="m-pay">Оплатить</button>
        <button class="btn ghost" id="m-close">Закрыть</button>
      </div>`);
    $('#m-pay').addEventListener('click', ()=>$('#btn-pay').click());
    $('#m-close').addEventListener('click', closeModal);
  });
  $('#btn-daily').addEventListener('click', ()=>{
    const k='island_daily'; const last=+localStorage.getItem(k)||0; const now=Date.now();
    if (now-last<24*3600*1000){ showToast('Сундук уже получен. Возвращайся завтра!'); return; }
    localStorage.setItem(k, now+''); reward(1);
  });
  $('#btn-album').addEventListener('click', ()=>{
    openModal(`<h3>Коллекция</h3><p>Страницы книги заполняются по мере сбора. Полный доступ — после оплаты.</p><button class="btn ghost" id="m-close">Закрыть</button>`);
    $('#m-close').addEventListener('click', closeModal);
  });
  $('#btn-music').addEventListener('click', ()=>{
    STATE.sound = !STATE.sound;
    showToast(STATE.sound ? 'Звук: вкл' : 'Звук: выкл');
  });

  // Modal helpers
  function openModal(html){ modal.innerHTML = html; modalBackdrop.classList.remove('hidden'); }
  function closeModal(){ modalBackdrop.classList.add('hidden'); }

  // Minigames
  function launchMinigame(kind){
    if (kind==='ripple') miniRipple();
    else if (kind==='dial') miniDial();
    else miniConstellation();
  }

  function miniRipple(){
    openModal(`<div class="minigame"><h3>Holo‑Ripple</h3>
      <div class="ripple-canvas" id="rc"></div>
      <p>Тапни по моменту сопадения колец <span id="hits" class="success">0/3</span></p>
      <div style="display:flex;gap:10px"><button class="btn ghost" id="m-close">Закрыть</button></div>
    </div>`);
    $('#m-close').addEventListener('click', closeModal);
    const rc = $('#rc'); let hits=0, running=true;
    rc.addEventListener('click', ()=>{
      // naive: random success window
      if (!running) return;
      if (Math.random() < 0.45) { hits++; $('#hits').textContent = hits+'/3'; vibrate(8); }
      if (hits>=3){ running=false; setTimeout(()=>{ closeModal(); reward(2); }, 250); }
    });
    let i=0; const spawn=()=>{
      if (!running) return;
      const r = document.createElement('div'); r.className='ring';
      rc.appendChild(r); setTimeout(()=>r.remove(), 1900);
      i++; if(i<9) setTimeout(spawn, 600);
    }; spawn();
  }

  function miniDial(){
    openModal(`<div class="minigame"><h3>Glyph Dial</h3>
      <div class="dial"><div class="wheel" id="wh"><div class="target" id="tgt"></div><div class="needle" id="ndl"></div></div></div>
      <p>Совмести стрелку с подсвеченной меткой</p>
      <div style="display:flex;gap:10px"><button class="btn ghost" id="m-close">Закрыть</button></div>
    </div>`);
    $('#m-close').addEventListener('click', closeModal);
    const targetAngle = (Math.random()*360)|0;
    const tgt = $('#tgt'); tgt.style.setProperty('--rot', targetAngle+'deg');
    const ndl = $('#ndl'); let angle=0, dragging=false, last=0;
    const wh = $('#wh');
    const center = wh.getBoundingClientRect();
    function onMove(e){
      if (!dragging) return;
      const p = ('touches' in e? e.touches[0]: e);
      const r = wh.getBoundingClientRect(); const cx = r.left + r.width/2; const cy = r.top + r.height/2;
      const dx = p.clientX - cx; const dy = p.clientY - cy;
      angle = (Math.atan2(dy, dx)*180/Math.PI);
      ndl.style.transform = `translate(-50%,-50%) rotate(${angle}deg)`;
      const delta = Math.abs(((angle-targetAngle+540)%360)-180);
      if (delta<10){ setTimeout(()=>{ closeModal(); reward(2); }, 150); dragging=false; }
    }
    wh.addEventListener('mousedown', ()=>dragging=true); document.addEventListener('mouseup', ()=>dragging=false);
    wh.addEventListener('touchstart', ()=>dragging=true); document.addEventListener('touchend', ()=>dragging=false,{passive:true});
    document.addEventListener('mousemove', onMove); document.addEventListener('touchmove', onMove,{passive:false});
  }

  function miniConstellation(){
    openModal(`<div class="minigame"><h3>Constellation</h3>
      <div class="constel"><svg viewBox="0 0 400 220" id="sv">
        <polyline class="path" points="60,180 130,120 220,150 320,80"></polyline>
        <circle class="star" cx="60" cy="180" r="6"></circle>
        <circle class="star" cx="130" cy="120" r="6"></circle>
        <circle class="star" cx="220" cy="150" r="6"></circle>
        <circle class="star" cx="320" cy="80" r="6"></circle>
      </svg></div>
      <p>Проведи пальцем через звёзды по порядку</p>
      <div style="display:flex;gap:10px"><button class="btn ghost" id="m-close">Закрыть</button></div>
    </div>`);
    $('#m-close').addEventListener('click', closeModal);
    const sv = $('#sv'); const stars=[{x:60,y:180},{x:130,y:120},{x:220,y:150},{x:320,y:80}];
    let idx=0, tracking=false;
    function near(p, s){ const dx=p.x-s.x, dy=p.y-s.y; return dx*dx+dy*dy < 22*22; }
    function pos(e){ const r=sv.getBoundingClientRect(); const t=('touches'in e?e.touches[0]:e); return {x:t.clientX-r.left, y:t.clientY-r.top}; }
    function move(e){ if(!tracking) return; const p=pos(e); if (near(p, stars[idx])){ idx++; vibrate(8); if(idx>=stars.length){ closeModal(); reward(2); } } }
    sv.addEventListener('mousedown', ()=>tracking=true); document.addEventListener('mouseup', ()=>tracking=false);
    sv.addEventListener('touchstart', ()=>tracking=true,{passive:true}); document.addEventListener('touchend', ()=>tracking=false);
    document.addEventListener('mousemove', move); document.addEventListener('touchmove', move,{passive:false});
  }

})();