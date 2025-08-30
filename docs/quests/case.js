/* ====================================================
   CASE — рулетка (горизонтальная, вправо, 15с + 5с замедление)
   Ч/Б тема. Фокус: заработок × психология.
   ==================================================== */

// ---------- Конфиг цен (измените под ваш проект) ----------
const BASE_PRICES = {
  monthly: 1000,       // базовая цена "любая подписка" (1 мес)
  six_months: 5400,    // базовая цена 6 мес
  twelve_months: 9600, // базовая цена 12 мес
  consultation: 3000,  // базовая цена личной консультации
  training_frod: 25000 // базовая цена полного обучения ФРОДУ
};

// ---------- Призы и вес выпадения ----------
const PRIZES = [
  { id:'disc10_any', name:'Скидка 10% на любую подписку', type:'discount', action:'use', weight:40, meta:{percent:10, target:'any'} },
  { id:'disc20_6m', name:'Скидка 20% на подписку 6 мес.', type:'discount', action:'use', weight:25, meta:{percent:20, target:'6m'} },
  { id:'disc50_12m', name:'Скидка 50% на подписку 12 мес.', type:'discount', action:'use', weight:15, meta:{percent:50, target:'12m'} },
  { id:'sub_1m', name:'Полная подписка 1 мес.', type:'subscription', action:'activate', weight:5, meta:{months:1} },
  { id:'m50', name:'50 MULACOIN', type:'currency', action:'activate', weight:40, meta:{amount:50} },
  { id:'spin1', name:'+1 SPIN', type:'spin', action:'activate', weight:80, meta:{amount:1} },
  { id:'m10', name:'10 MULACOIN', type:'currency', action:'activate', weight:60, meta:{amount:10} },
  { id:'consult', name:'Личная консультация', type:'service', action:'use', weight:3, meta:{} },
  { id:'training_frod', name:'Полное обучение ФРОДУ', type:'service', action:'use', weight:1, meta:{} }
];

const BUY_SPIN_COST = 50; // MULACOIN

// ---------- Утилиты UI ----------
const $ = (s)=>document.querySelector(s);
const toast = (msg, type='info')=>{
  const el = $('#toast'); if(!el) return;
  el.textContent = msg; el.className = 'toast show ' + type;
  setTimeout(()=>{ el.className='toast'; }, 2500);
};

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

// Генерация сегмента с рандомной мешаниной призов
function randomSegment(length=18){
  const fragment = document.createDocumentFragment();
  for(let i=0;i<length;i++){
    const p = PRIZES[Math.floor(Math.random()*PRIZES.length)];
    fragment.appendChild(renderCard(p));
  }
  return fragment;
}

// ---------- Состояние пользователя ----------
let user = { tg_id:null, mulacoin:0, spins:1, nickname:'anon' };

async function syncUserUI(){
  $('#mulacoinAmount').textContent = user.mulacoin|0;
  $('#spinsCount').textContent = user.spins|0;
}

async function bootstrap(){
  if (window.Telegram && window.Telegram.WebApp) {
    try {
      Telegram.WebApp.expand();
      Telegram.WebApp.enableClosingConfirmation();
    } catch(e){}
  }
  user = await getOrCreateUser();
  await syncUserUI();
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

  // Препенджим слева запас, дальше основной массив, чтобы движение вправо выглядело бесконечно
  const leftPad = randomSegment(30);
  track.appendChild(leftPad);

  const main = document.createDocumentFragment();
  for(let i=0;i<6;i++){ main.appendChild(randomSegment(18)); }
  track.appendChild(main);

  // Чтобы точно посадить на выигрышный приз — добавим участок, где гарантированно есть победитель
  const winner = winningPrize || pickWeighted(PRIZES);
  const winnerCard = renderCard(winner);
  track.appendChild(randomSegment(8));
  track.appendChild(winnerCard);
  track.appendChild(randomSegment(12));

  // Применим начальное левое смещение (минус ширина ~24 карточек)
  // чтобы появилось пространство слева и движение было вправо
  const cards = Array.from(track.children).slice(0, 24);
  const base = cards.reduce((w, c)=>w + c.getBoundingClientRect().width + 12 /*gap*/, 0);
  const initX = -Math.max(0, base);
  track.style.transform = `translateX(${initX}px)`;
  window.__trackInitialX = initX;

  return winner;
}

function getCardCenterX(card, container){
  const cardRect = card.getBoundingClientRect();
  const contRect = container.getBoundingClientRect();
  const centerTrack = (cardRect.left + cardRect.right)/2;
  // вернем x центра карточки в координатах контейнера
  return centerTrack - contRect.left;
}

async function spin(){
  if (spinning) return;
  if ((user.spins|0) <= 0){
    toast('Нет спинов. Купите за 50 🪙', 'error');
    return;
  }

  spinning = true;
  $('#btnSpin').disabled = true;
  $('#btnBuy').disabled = true;
  $('#btnPrizes').disabled = true;

  // выбрать победителя заранее (по шансам)
  const winner = prepareTrack();

  // аудио на 15 сек
  const audio = $('#kazik');
  try { audio.currentTime = 0; audio.play().catch(()=>{}); } catch(e){}

  // рассчитать целевое смещение
  const track = $('#track');
  const stage = $('.stage');
  // Убедимся, что layout применён
  await new Promise(requestAnimationFrame);

  const cards = Array.from(track.children);
  // возьмем последнюю карточку с тем же pid (это наш winnerCard, мы его добавляли последним целевым)
  const targetCard = cards.reverse().find(c => c.dataset.pid === winner.id);
  if (!targetCard){ spinning=false; toast('Ошибка карточки приза', 'error'); return; }

  const pointerCenter = stage.clientWidth / 2;
  const itemCenter = getCardCenterX(targetCard, stage);
  const initialX = window.__trackInitialX || 0;
  const delta = (pointerCenter - itemCenter);
  const targetTranslate = initialX + delta; // финальное смещение (будет > initialX), двигаемся вправо

  // Анимация: 15с, последние 5с замедление
  const start = performance.now();
  const D1 = 10000; // 10 сек быстрой фазы
  const D2 = 5000;  // 5 сек замедление
  const D = D1 + D2;

  const easeOut = (t)=>1 - (1-t)*(1-t);

  cancelAnimationFrame(currentAnim);
  let ended = false;

  function frame(now){
    const t = now - start;
    let progress, x;
    if (t <= D1){
      // линейное ускорение к промежуточной точке (70% пути за 10с)
      const p = Math.min(1, t / D1);
      progress = p * 0.7;
    } else {
      const p2 = Math.min(1, (t - D1) / D2);
      progress = 0.7 + easeOut(p2) * 0.3;
    }
    x = initialX + (targetTranslate - initialX) * progress;
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
  // остановить аудио
  const audio = $('#kazik');
  try { audio.pause(); } catch(e){}

  // списать спин
  user.spins = Math.max(0, (user.spins|0) - 1);
  await updateUserPatch({ spins: user.spins });
  await syncUserUI();

  // сгенерировать промокод
  const code = `${winner.id}`.toUpperCase() + '-' + Math.random().toString(36).slice(2,8).toUpperCase();

  // записать в историю и таблицу промокодов
  await addRouletteHistory({ tg_id:user.tg_id, prize_id:winner.id, prize_name:winner.name, code, meta:winner.meta });
  await addPromocode({ tg_id:user.tg_id, code, type:winner.type, value: JSON.stringify(winner.meta), status:'won', meta:{ name:winner.name, action:winner.action } });

  // обновить ленту
  await refreshPromos();

  // показать модал результата
  openResultModal(winner, code);

  // разблокировать UI
  spinning = false;
  $('#btnSpin').disabled = false;
  $('#btnBuy').disabled = false;
  $('#btnPrizes').disabled = false;
}

// ---------- Промокоды (лента) ----------
function priceLineFor(prize){
  // Возвращаем {before, after} если это скидка/услуга
  switch(prize.id){
    case 'disc10_any': {
      const before = BASE_PRICES.monthly;
      return { before, after: Math.round(before * 0.9) };
    }
    case 'disc20_6m': {
      const before = BASE_PRICES.six_months;
      return { before, after: Math.round(before * 0.8) };
    }
    case 'disc50_12m': {
      const before = BASE_PRICES.twelve_months;
      return { before, after: Math.round(before * 0.5) };
    }
    case 'consult': {
      const before = BASE_PRICES.consultation;
      return { before, after: before }; // скидки нет — индивидуально
    }
    case 'training_frod': {
      const before = BASE_PRICES.training_frod;
      return { before, after: before };
    }
    default:
      return null;
  }
}

function renderPromoRow(row){
  // row: { id, code, type, value(json), status, meta(json) }
  const wrap = document.createElement('div');
  wrap.className = 'promo';
  const meta = (row.meta && typeof row.meta === 'object') ? row.meta :
               (typeof row.meta === 'string' ? JSON.parse(row.meta) : {});
  const v = typeof row.value === 'string' ? safeJSON(row.value) : (row.value || {});
  const name = meta.name || row.type;
  const action = meta.action || 'activate';

  wrap.innerHTML = `
    <div class="left">
      <span class="badge">${row.type}</span>
      <div>
        <div class="code">${name}</div>
        <div class="tiny">${row.code}</div>
      </div>
    </div>
    <div class="actions"></div>
  `;

  const actions = wrap.querySelector('.actions');
  const btn = document.createElement('button');
  btn.className = 'btn';
  if (row.status === 'used' || row.status === 'activated'){
    btn.disabled = true;
    btn.textContent = row.status === 'used' ? 'Использовано' : 'Активировано';
  } else {
    if (action === 'activate'){
      btn.classList.add('primary');
      btn.textContent = 'Активировать';
      btn.onclick = ()=>activatePromo(row, v);
    } else {
      btn.textContent = 'Использовать';
      btn.onclick = ()=>usePromo(row, v, meta);
    }
  }
  actions.appendChild(btn);
  return wrap;
}

function safeJSON(x){ try{return JSON.parse(x);}catch(e){return {}} }

async function refreshPromos(){
  const list = $('#promoList');
  list.innerHTML = '';
  const rows = await listPromocodes(user.tg_id);
  rows.forEach(r=> list.appendChild(renderPromoRow(r)));
}

// Активация наград: начисление валюты/спинов/подписки
async function activatePromo(row, value){
  if (row.type === 'currency'){
    const amount = value.amount|0;
    user.mulacoin = (user.mulacoin|0) + amount;
    await updateUserPatch({ mulacoin: user.mulacoin });
    await markPromocodeUsed(row.id, { status:'activated', activated_at: new Date().toISOString() });
    await refreshPromos(); await syncUserUI();
    toast(`+${amount} 🪙 добавлено`, 'success');
  } else if (row.type === 'spin'){
    const amount = value.amount|0;
    user.spins = (user.spins|0) + amount;
    await updateUserPatch({ spins: user.spins });
    await markPromocodeUsed(row.id, { status:'activated', activated_at: new Date().toISOString() });
    await refreshPromos(); await syncUserUI();
    toast(`+${amount} SPIN`, 'success');
  } else if (row.type === 'subscription'){
    // отправить событие боту на выдачу подписки /galdin 1 мес
    try {
      if (window.Telegram && window.Telegram.WebApp){
        Telegram.WebApp.sendData(JSON.stringify({ op:'activate_subscription', months:1, code:row.code }));
      }
    } catch(e){}
    await markPromocodeUsed(row.id, { status:'activated', activated_at: new Date().toISOString() });
    await refreshPromos();
    toast('Подписка будет выдана ботом', 'success');
  }
}

// Использование скидок/услуг — открываем диалог админу с префиллом
function openAdminDM(text){
  const u = encodeURIComponent(text);
  // В Telegram WebApp можно открыть ссылку
  window.open(`https://t.me/acqu1red?text=${u}`, '_blank');
}

async function usePromo(row, value, meta){
  const prize = PRIZES.find(p=>p.id === (row.code.split('-')[0] || '').toLowerCase());
  // если не нашли точный приз, распарсим из meta
  const name = (meta && meta.name) ? meta.name : (prize ? prize.name : row.type);
  const price = prize ? priceLineFor(prize) : null;

  let message = `Здравствуйте! Хочу использовать приз «${name}».\nМой промокод: ${row.code}.`;
  if (price){
    message += `\nЦена без скидки: ${price.before}₽.`;
    if (price.after !== price.before) message += `\nЦена со скидкой: ${price.after}₽.`;
  }
  openAdminDM(message);
  await markPromocodeUsed(row.id, { status:'used', used_at:new Date().toISOString() });
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
  const items = PRIZES.map(p=>`<li><b>${p.name}</b><span class="badge">${p.weight}‰</span></li>`).join('');
  showModal(`
    <h3>Все призы и шансы</h3>
    <p>Шанс выпадения учитывается при каждом спине. Вращение 15 секунд, замедление 5 секунд.</p>
    <ul style="display:grid;gap:8px;list-style:none;margin-top:10px">
      ${items}
    </ul>
  `);
}

function openHistory(){
  showModal(`<h3>История</h3><p>Полный журнал смотрите в таблице <code>roulette_history</code>. Последние призы отражены в «Лента промокодов» ниже.</p>`);
}

function openResultModal(prize, code){
  const action = prize.action === 'activate' ? 'Активировать' : 'Использовать';
  showModal(`
    <h3>Ваш выигрыш</h3>
    <p><b>${prize.name}</b></p>
    <p>Промокод: <code>${code}</code></p>
    <div class="actions">
      <button class="btn primary" id="resMain">${action}</button>
      <button class="btn" id="resClose">Позже</button>
    </div>
  `);
  // Кнопки
  setTimeout(()=>{
    $('#resClose').onclick = closeModal;
    $('#resMain').onclick = async ()=>{
      // найдём только что созданную запись в ленте
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
  if ((user.mulacoin|0) < BUY_SPIN_COST){
    toast('Недостаточно 🪙', 'error'); return;
  }
  user.mulacoin -= BUY_SPIN_COST;
  user.spins += 1;
  await updateUserPatch({ mulacoin: user.mulacoin, spins: user.spins });
  await syncUserUI();
  toast('Куплен 1 SPIN', 'success');
}

// ---------- События ----------
$('#btnSpin').addEventListener('click', spin);
$('#btnBuy').addEventListener('click', buySpin);
$('#btnPrizes').addEventListener('click', openPrizesModal);
$('#btnHistory').addEventListener('click', openHistory);

// ---------- Запуск ----------
bootstrap().catch(err=>{ console.error(err); toast('Ошибка инициализации', 'error'); });