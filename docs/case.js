
/* ====================================================
   CASE — рулетка (горизонтальная, вправо, 15с + 5с замедление)
   Ч/Б тема. Фокус: заработок × психология.
   ==================================================== */

// ---------- Fallback: если supabaseClient.js не загрузился ----------
(function ensureCaseApi(){
  if (window.__CASE_API__) return;
  console.warn('⚠️ __CASE_API__ не найден — включён локальный оффлайн-режим.');
  function ensureLocalId(){
    const k='case_local_id'; let v=localStorage.getItem(k);
    if(!v){ v='anon_'+Math.random().toString(36).slice(2,10); localStorage.setItem(k,v); }
    return v;
  }
  window.__CASE_API__ = {
    async computeWallet(user){
      const cache = JSON.parse(localStorage.getItem('case_user')||'{}');
      return { spins: cache.spins ?? 1, mulacoin: cache.mulacoin ?? 0 };
    },
    async listPromocodes(){ return []; },
    async addPromocode(){ /* no-op offline */ },
    async markPromocodeUsed(){ /* no-op offline */ },
    async addRouletteHistory(){ /* no-op offline */ },
    async getOrCreateUser(){
      const tg = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) ? window.Telegram.WebApp.initDataUnsafe : null;
      const identifier = tg?.user ? 'tg_'+tg.user.id : ensureLocalId();
      const nickname = tg?.user?.username || (tg?.user?.first_name ? (tg.user.first_name + (tg.user.last_name?(' '+tg.user.last_name):'')) : 'guest');
      const local = { id:null, telegram_id: identifier, nickname, spins: 1, mulacoin: 0 };
      localStorage.setItem('case_user', JSON.stringify(local));
      return local;
    },
    async initSupabase(){ return null; }
  };
})();


// ---------- Цены по умолчанию (можно менять) ----------
const BASE_PRICES = {
  monthly: 1000,
  six_months: 5400,
  twelve_months: 9600,
  consultation: 3000,
  training_frod: 25000
};

// ---------- Призы и веса выпадения ----------
const PRIZES = [
  { id:'disc10_any',  name:'Скидка 10% на любую подписку',   type:'discount',    action:'use',       weight:40, meta:{ percent:10, target:'any' } },
  { id:'disc20_6m',   name:'Скидка 20% на подписку 6 мес.',  type:'discount',    action:'use',       weight:25, meta:{ percent:20, target:'6m' } },
  { id:'disc50_12m',  name:'Скидка 50% на подписку 12 мес.', type:'discount',    action:'use',       weight:15, meta:{ percent:50, target:'12m' } },
  { id:'sub_1m',      name:'Полная подписка 1 мес.',         type:'subscription',action:'activate',  weight:5,  meta:{ months:1 } },
  { id:'m50',         name:'50 MULACOIN',                    type:'currency',    action:'activate',  weight:40, meta:{ amount:50 } },
  { id:'spin1',       name:'+1 SPIN',                        type:'spin',        action:'activate',  weight:80, meta:{ amount:1 } },
  { id:'m10',         name:'10 MULACOIN',                    type:'currency',    action:'activate',  weight:60, meta:{ amount:10 } },
  { id:'consult',     name:'Личная консультация',            type:'service',     action:'use',       weight:3,  meta:{} },
  { id:'training_frod', name:'Полное обучение ФРОДУ',        type:'service',     action:'use',       weight:1,  meta:{} }
];

const BUY_SPIN_COST = 50; // MULACOIN

// ---------- Утилиты UI ----------
const $ = (s)=>document.querySelector(s);
const toast = (msg, type='info')=>{
  const el = $('#toast'); if(!el) return;
  el.textContent = msg; el.className = 'toast show ' + type;
  setTimeout(()=>{ el.className='toast'; }, 2500);
};

// Wallet helpers (используем серверные вычисления через __CASE_API__)
async function refreshWalletUI(){
  const w = await window.__CASE_API__.computeWallet(user);
  user.spins = w.spins; user.mulacoin = w.mulacoin;
  await syncUserUI();
}

async function playKazikSafe(){
  const a = $('#kazik'); if (!a) return;
  try { a.currentTime = 0; await a.play(); } catch(e){ /* ignore */ }
}
function stopKazikSafe(){ try{ $('#kazik')?.pause(); }catch(e){} }

// ---------- Весовой выбор ----------
function pickWeighted(list){
  const total = list.reduce((sum,p)=>sum+p.weight,0);
  let roll = Math.random()*total;
  for (const p of list){
    if((roll -= p.weight) <= 0) return p;
  }
  return list[list.length-1];
}

// ---------- Рендер карточек в трек ----------
function renderCard(prize){
  const div = document.createElement('div');
  div.className = 'card';
  div.dataset.pid = prize.id;
  div.innerHTML = `<div class="title">${prize.name}</div>
                   <div class="note">${prize.type === 'discount' ? 'Скидка' : prize.type === 'currency' ? 'Баланс' : prize.type === 'spin' ? 'Спины' : 'Особый приз'}</div>`;
  return div;
}

// Генерация сегмента
function randomSegment(length=18){
  const fragment = document.createDocumentFragment();
  for(let i=0;i<length;i++){
    const p = PRIZES[Math.floor(Math.random()*PRIZES.length)];
    fragment.appendChild(renderCard(p));
  }
  return fragment;
}

// ---------- Состояние ----------
let user = { id:null, telegram_id:null, mulacoin:0, spins:0, nickname:'anon' };

async function syncUserUI(){
  $('#mulacoinAmount').textContent = user.mulacoin|0;
  $('#spinsCount').textContent = user.spins|0;
}

async function bootstrap(){
  if (window.Telegram && window.Telegram.WebApp) {
    try { Telegram.WebApp.expand(); Telegram.WebApp.enableClosingConfirmation(); } catch(e){}
  }
  user = await window.__CASE_API__.getOrCreateUser();
  await refreshWalletUI();
  await refreshPromos();
  // Подготовить трек
  prepareTrack();
}

// ---------- Рулетка ----------
let spinning = false;
let currentAnim = null;

function prepareTrack(winningPrize=null){
  const track = $('#track');
  track.style.transform = 'translateX(0px)';
  track.innerHTML = '';

  // Левый буфер + основной массив
  track.appendChild(randomSegment(30));
  for(let i=0;i<6;i++){ track.appendChild(randomSegment(18)); }

  // Целевой победитель в конце
  const winner = winningPrize || pickWeighted(PRIZES);
  const winnerCard = renderCard(winner);
  track.appendChild(randomSegment(8));
  track.appendChild(winnerCard);
  track.appendChild(randomSegment(12));

  // Начальное левое смещение (движение будет вправо)
  const cards = Array.from(track.children).slice(0, 24);
  const base = cards.reduce((w, c)=> w + c.getBoundingClientRect().width + 12, 0);
  const initX = -Math.max(0, base);
  track.style.transform = `translateX(${initX}px)`;
  window.__trackInitialX = initX;

  return winner;
}

function getCardCenterX(card, container){
  const cardRect = card.getBoundingClientRect();
  const contRect = container.getBoundingClientRect();
  return (cardRect.left + cardRect.right)/2 - contRect.left;
}

async function spin(){
  if (spinning) return;
  await refreshWalletUI();
  if ((user.spins|0) <= 0){ toast('Нет спинов. Купите за 50 🪙', 'error'); return; }

  spinning = true;
  $('#btnSpin').disabled = true;
  $('#btnBuy').disabled = true;
  $('#btnPrizes').disabled = true;

  // выбрать победителя заранее (по шансам)
  const winner = prepareTrack();

  // аудио
  await playKazikSafe();

  // рассчитать целевое смещение
  const track = $('#track');
  const stage = $('.stage');
  await new Promise(requestAnimationFrame);

  const cards = Array.from(track.children);
  const targetCard = cards.reverse().find(c => c.dataset.pid === winner.id);
  if (!targetCard){ spinning=false; toast('Ошибка карточки приза', 'error'); return; }

  const pointerCenter = stage.clientWidth / 2;
  const itemCenter = getCardCenterX(targetCard, stage);
  const initialX = window.__trackInitialX || 0;
  const delta = (pointerCenter - itemCenter);
  const targetTranslate = initialX + delta; // идём вправо

  // 15с (10 быстрых + 5 замедление)
  const start = performance.now();
  const D1 = 10000;
  const D2 = 5000;
  const D = D1 + D2;
  const easeOut = (t)=>1 - (1-t)*(1-t);

  cancelAnimationFrame(currentAnim);
  let ended = false;
  function frame(now){
    const t = now - start;
    let progress;
    if (t <= D1){
      const p = Math.min(1, t / D1);
      progress = p * 0.7;
    } else {
      const p2 = Math.min(1, (t - D1) / D2);
      progress = 0.7 + easeOut(p2) * 0.3;
    }
    const x = initialX + (targetTranslate - initialX) * progress;
    track.style.transform = `translateX(${x}px)`;

    if (t < D){
      currentAnim = requestAnimationFrame(frame);
    } else if (!ended){
      ended = true;
      track.style.transform = `translateX(${targetTranslate}px)`;
      finishSpin(winner).catch(console.error);
    }
  }
  currentAnim = requestAnimationFrame(frame);
}

async function finishSpin(winner){
  stopKazikSafe();

  // генерим промокод
  const code = `${winner.id}`.toUpperCase() + '-' + Math.random().toString(36).slice(2,8).toUpperCase();

  // пишем промокод и историю
  await window.__CASE_API__.addPromocode({
    code,
    type: winner.type,
    value: (winner.type==='currency'||winner.type==='spin') ? (winner.meta.amount||0) : JSON.stringify(winner.meta),
    issued_to: user.telegram_id,
    status: 'issued'
  });
  await window.__CASE_API__.addRouletteHistory({
    user_id: user.id,
    prize_type: winner.id,
    prize_name: winner.name,
    is_free: false,
    mulacoin_spent: 0,
    won_at: new Date().toISOString(),
    promo_code_id: null
  });

  // обновить кошелёк и ленту
  await refreshWalletUI();
  await refreshPromos();

  // показать модал
  openResultModal(winner, code);

  spinning = false;
  $('#btnSpin').disabled = false;
  $('#btnBuy').disabled = false;
  $('#btnPrizes').disabled = false;
}

// ---------- Промокоды ----------
function priceLineFor(prize){
  switch(prize.id){
    case 'disc10_any':  return { before: BASE_PRICES.monthly,       after: Math.round(BASE_PRICES.monthly * 0.9) };
    case 'disc20_6m':   return { before: BASE_PRICES.six_months,    after: Math.round(BASE_PRICES.six_months * 0.8) };
    case 'disc50_12m':  return { before: BASE_PRICES.twelve_months, after: Math.round(BASE_PRICES.twelve_months * 0.5) };
    case 'consult':     return { before: BASE_PRICES.consultation,  after: BASE_PRICES.consultation };
    case 'training_frod': return { before: BASE_PRICES.training_frod, after: BASE_PRICES.training_frod };
    default: return null;
  }
}

function safeJSON(x){ try{return JSON.parse(x);}catch(e){return {}} }

function renderPromoRow(row){
  const wrap = document.createElement('div');
  wrap.className = 'promo';

  const pid = (row.code || '').split('-')[0].toLowerCase();
  const prize = PRIZES.find(p=>p.id === pid) || null;
  const displayName = prize ? prize.name : (row.type || 'промокод');
  const action = prize ? prize.action : (row.type === 'discount' || row.type === 'service' ? 'use' : 'activate');

  const value = typeof row.value === 'string' ? safeJSON(row.value) : (row.value || {});

  wrap.innerHTML = `
    <div class="left">
      <span class="badge">${row.type}</span>
      <div>
        <div class="code">${displayName}</div>
        <div class="tiny">${row.code || ''}</div>
      </div>
    </div>
    <div class="actions"></div>
  `;

  const btn = document.createElement('button');
  btn.className = 'btn';
  if (row.status === 'used' || row.status === 'activated'){
    btn.disabled = true;
    btn.textContent = row.status === 'used' ? 'Использовано' : 'Активировано';
  } else {
    if (action === 'activate'){
      btn.classList.add('primary');
      btn.textContent = 'Активировать';
      btn.onclick = ()=>activatePromo(row, value, prize);
    } else {
      btn.textContent = 'Использовать';
      btn.onclick = ()=>usePromo(row, value, prize);
    }
  }
  wrap.querySelector('.actions').appendChild(btn);
  return wrap;
}

async function refreshPromos(){
  const list = $('#promoList');
  list.innerHTML = '';
  const rows = await window.__CASE_API__.listPromocodes(user.telegram_id);
  rows.forEach(r=> list.appendChild(renderPromoRow(r)));
}

async function activatePromo(row, value, prize){
  if (row.type === 'currency'){
    await window.__CASE_API__.markPromocodeUsed(row.id, { status:'activated', used_at: new Date().toISOString(), used_by: user.telegram_id });
    await refreshPromos();
    await refreshWalletUI();
    toast(`+${parseInt(value,10)||0} 🪙 добавлено`, 'success');
  } else if (row.type === 'spin'){
    await window.__CASE_API__.markPromocodeUsed(row.id, { status:'activated', used_at: new Date().toISOString(), used_by: user.telegram_id });
    await refreshPromos();
    await refreshWalletUI();
    toast(`+${parseInt(value,10)||0} SPIN`, 'success');
  } else if (row.type === 'subscription'){
    try {
      if (window.Telegram && window.Telegram.WebApp){
        Telegram.WebApp.sendData(JSON.stringify({ op:'activate_subscription', months:1, code:row.code }));
      }
    } catch(e){}
    await window.__CASE_API__.markPromocodeUsed(row.id, { status:'activated', used_at: new Date().toISOString(), used_by: user.telegram_id });
    await refreshPromos();
    toast('Подписка будет выдана ботом', 'success');
  }
}

function openAdminDM(text){
  const u = encodeURIComponent(text);
  window.open(`https://t.me/acqu1red?text=${u}`, '_blank');
}

async function usePromo(row, value, prize){
  const name = prize ? prize.name : (row.type || 'приз');
  const price = prize ? priceLineFor(prize) : null;

  let message = `Здравствуйте! Хочу использовать приз «${name}».\nМой промокод: ${row.code}.`;
  if (price){
    message += `\nЦена без скидки: ${price.before}₽.`;
    if (price.after !== price.before) message += `\nЦена со скидкой: ${price.after}₽.`;
  }
  openAdminDM(message);
  await window.__CASE_API__.markPromocodeUsed(row.id, { status:'used', used_at:new Date().toISOString(), used_by:user.telegram_id });
  await refreshPromos();
  toast('Сообщение админу отправлено', 'success');
}

// ---------- Модалы ----------
function showModal(html){
  $('#modalContent').innerHTML = html;
  $('#modal').classList.add('show');
}
function closeModal(){ $('#modal').classList.remove('show'); }
$('#modalClose').addEventListener('click', closeModal);
$('#modal').addEventListener('click', e=>{ if(e.target.id==='modal') closeModal(); });

function openPrizesModal(){
  const items = PRIZES.map(p=>`<li style="display:flex;align-items:center;justify-content:space-between;gap:12px"><b>${p.name}</b><span class="badge">${p.weight}‰</span></li>`).join('');
  showModal(`
    <h3>Все призы и шансы</h3>
    <p>Шанс выпадения учитывается при каждом спине. Вращение 15 секунд, замедление 5 секунд.</p>
    <ul style="display:grid;gap:8px;list-style:none;margin-top:10px">${items}</ul>
  `);
}

function openHistory(){
  showModal(`<h3>История</h3><p>Журнал смотрите в таблице <code>roulette_history</code>. Последние призы — в «Лента промокодов».</p>`);
}

function openResultModal(prize, code){
  const action = prize.action === 'activate' ? 'Активировать' : 'Использовать';
  showModal(`
    <h3>Ваш выигрыш</h3>
    <p><b>${prize.name}</b></p>
    <p>Промокод: <code>${code}</code></p>
    <div class="actions" style="margin-top:10px;display:flex;gap:8px">
      <button class="btn primary" id="resMain">${action}</button>
      <button class="btn" id="resClose">Позже</button>
    </div>
  `);
  setTimeout(()=>{
    $('#resClose').onclick = closeModal;
    $('#resMain').onclick = async ()=>{
      await refreshPromos();
      const list = $('#promoList').children;
      for (const item of list){
        const codeEl = item.querySelector('.tiny') || item.querySelector('.code');
        if (codeEl && codeEl.textContent.includes(code)){
          const btn = item.querySelector('.actions .btn');
          if (btn && !btn.disabled) btn.click();
          break;
        }
      }
      closeModal();
    };
  }, 0);
}

// ---------- Покупка спина ----------
async function buySpin(){
  await refreshWalletUI();
  if ((user.mulacoin|0) < BUY_SPIN_COST){ toast('Недостаточно 🪙', 'error'); return; }
  await window.__CASE_API__.addRouletteHistory({
    user_id:user.id, prize_type:'buy_spin', prize_name:null, is_free:false,
    mulacoin_spent:BUY_SPIN_COST, won_at:new Date().toISOString(), promo_code_id:null
  });
  await refreshWalletUI();
  toast('Куплен 1 SPIN', 'success');
}

// ---------- События ----------
$('#btnSpin').addEventListener('click', spin);
$('#btnBuy').addEventListener('click', buySpin);
$('#btnPrizes').addEventListener('click', openPrizesModal);
$('#btnHistory').addEventListener('click', openHistory);

// ---------- Запуск ----------
bootstrap().catch(err=>{ console.error(err); toast('Ошибка инициализации', 'error'); });