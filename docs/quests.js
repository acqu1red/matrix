
/* ====== CONFIG ====== */
const SUPABASE_URL = window.SUPABASE_URL || "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const SUBSCRIPTIONS_TABLE = "subscriptions"; // колонка tg_id (text/bigint->text)
const PROMOCODES_TABLE = "promocodes"; // {code, tg_id, issued_at, expires_at, status}
const ADMIN_USERNAME = "your_admin_username"; // t.me/<username> для связи

const PAYMENT_URL = "https://acqu1red.github.io/formulaprivate/payment.html";
const ISLAND_MINIAPP_URL = "./island.html"; // один из квестов открывает этот визуал

const MAX_DAILY_FREE = 5;
const TOTAL_QUESTS = 15;
const VARIATIONS_PER_QUEST = 10;

/* ====== Telegram init ====== */
let tg = null;
function initTG(){
  try{
    tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    if(tg){
      tg.expand();
      tg.enableClosingConfirmation();
      document.body.classList.add("tg-ready");
    }
  }catch(e){ console.log("TG init fail", e); }
}
initTG();

/* ====== Supabase ====== */
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

/* ====== Utils ====== */
const $ = (sel, el=document)=>el.querySelector(sel);
const $$ = (sel, el=document)=>Array.from(el.querySelectorAll(sel));
const toast = (msg)=>{ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"), 2200); };

function dayIndex(){ return Math.floor(Date.now() / (24*60*60*1000)); }
function variationIndex(){ return dayIndex() % VARIATIONS_PER_QUEST; }
function groupIndex(){ return dayIndex() % 3; } // группы по 5 квестов

/* ====== Parallax particles ====== */
function fireflies(){
  const canvas = $("#fireflies");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  let W,H; function resize(){ W=canvas.width=canvas.clientWidth; H=canvas.height=canvas.clientHeight; } resize();
  window.addEventListener("resize", resize);
  const N = 24;
  const parts = Array.from({length:N},()=>({x:Math.random()*W,y:Math.random()*H, vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35, r:1.2+Math.random()*2.4, a:.5+Math.random()*.5 }));
  function step(){
    ctx.clearRect(0,0,W,H);
    parts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;
      ctx.beginPath();
      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*8);
      g.addColorStop(0, `rgba(102,247,213,${0.85*p.a})`);
      g.addColorStop(1, `rgba(102,247,213,0)`);
      ctx.fillStyle=g;
      ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(step);
  }
  step();
}
fireflies();

/* ====== Quests model (15) ====== */
const QUESTS = [
  { id:"treasure", theme:"Дикий запад", style:"artdeco", name:"Поиск сокровищ", intro:"Собери карту и найди клад раньше других.", type:"puzzle", build: buildTreasure },
  { id:"cyber", theme:"Киберпанк", style:"synthwave", name:"Кибер‑взлом", intro:"Подбери паттерн, чтобы открыть шлюз.", type:"minigame", build: buildCyber },
  { id:"bodylang", theme:"Современный город", style:"neo", name:"Язык тела", intro:"Распознай невербальные сигналы 2D‑персонажа.", type:"analysis", build: buildBodyLang },
  { id:"profiling", theme:"Соцсети", style:"neo", name:"Профайлинг аккаунта", intro:"Оцени профиль и выбери черты характера.", type:"analysis", build: buildProfiling },
  { id:"island", theme:"Неосоларпанк", style:"neo", name:"Остров Архив", intro:"Исследуй остров, активируй маяки.", type:"visual", build: buildIslandLink },

  // заработок/маркетинг
  { id:"roi", theme:"Маркетинг", style:"neo", name:"ROI‑калькулятор", intro:"Выбери кампанию с лучшей окупаемостью.", type:"puzzle", build: buildROI },
  { id:"funnel", theme:"Продажи", style:"neo", name:"Воронка конверсий", intro:"Найди самое узкое место.", type:"puzzle", build: buildFunnel },
  { id:"copy", theme:"Контент", style:"neo", name:"A/B заголовки", intro:"Выбери выигравший заголовок по метрикам.", type:"quiz", build: buildCopy },
  { id:"scam", theme:"Безопасность", style:"neo", name:"SCAM‑детектор", intro:"Отличи честную офферку от фишинга.", type:"quiz", build: buildScam },
  { id:"niche", theme:"Стратегия", style:"neo", name:"Выбор ниши", intro:"Сопоставь спрос и конкуренцию.", type:"puzzle", build: buildNiche },

  // атмосферные
  { id:"noir", theme:"Нуар", style:"artdeco", name:"Тень на стене", intro:"Соедини улики правильным порядком.", type:"puzzle", build: buildNoir },
  { id:"space", theme:"Космо", style:"synthwave", name:"Орбитал", intro:"Синхронизируй траектории спутников.", type:"minigame", build: buildSpace },
  { id:"steampunk", theme:"Стимпанк", style:"artdeco", name:"Шестерни судьбы", intro:"Выставь шестерни для передачи усилия.", type:"puzzle", build: buildGears },
  { id:"modern", theme:"Современность", style:"neo", name:"Сигналы рынка", intro:"Отфильтруй шум и найди тренд.", type:"puzzle", build: buildSignals },
  { id:"mystic", theme:"Мистика", style:"neo", name:"Созвездия", intro:"Проведи линию через звёзды.", type:"minigame", build: buildConstellation }
];

/* ====== Rotation + gating ====== */
function featuredQuests(isSubscribed){
  if(isSubscribed) return QUESTS;
  const g = groupIndex(); // 0..2
  const start = g*5;
  return QUESTS.slice(start, start+5);
}

/* ====== Modal ====== */
const modal = $("#modal");
$("#modalClose").addEventListener("click", ()=> modal.classList.add("hidden"));

function showModal(html){
  $("#modalBody").innerHTML = "";
  $("#modalBody").appendChild(html);
  modal.classList.remove("hidden");
}

/* ====== Cards ====== */
function buildCards(state){
  const container = $("#quests");
  container.innerHTML = "";
  const list = featuredQuests(state.isSubscribed);
  list.forEach(q => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="label">${q.theme}</div>
      <h3>${q.name}</h3>
      <div class="tag">Вариация #${variationIndex()+1}/10</div>
      <div class="cta">
        <button class="btn primary start">Начать</button>
        <button class="btn ghost details">Описание</button>
      </div>
    `;
    card.querySelector(".start").addEventListener("click", ()=>startQuest(q, state));
    card.querySelector(".details").addEventListener("click", ()=>{
      const box = document.createElement("div");
      box.innerHTML = `<div class="questIntro"><h3>${q.name}</h3><p>${q.intro}</p></div>`;
      if(!state.isSubscribed){
        const b = document.createElement("div");
        b.className="banner";
        b.innerHTML = `Без подписки доступны 5 квестов в день. Возвращайся ежедневно — будет открываться по одному новому квесту. Открой все квесты за 10 дней — получи <b>скидку 50%</b> на месяц подписки.`;
        box.appendChild(b);
      }
      showModal(box);
    });
    container.appendChild(card);
  });

  // остальные — серыми (для free)
  if(!state.isSubscribed){
    const others = QUESTS.filter(q => !list.find(x=>x.id===q.id));
    others.forEach(q => {
      const card = document.createElement("div");
      card.className = "card locked";
      card.innerHTML = `
        <div class="lock">🔒 Заблокировано</div>
        <div class="label">${q.theme}</div>
        <h3>${q.name}</h3>
        <div class="tag">Откроется в один из дней</div>
      `;
      container.appendChild(card);
    });
  }
}

/* ====== Start quest ====== */
function startQuest(q, state){
  const root = document.createElement("div");
  root.className = "questBody";
  if(!state.isSubscribed){
    const banner = document.createElement("div");
    banner.className="banner";
    banner.innerHTML = `Ежедневно открывается <b>5 квестов</b>. Открой все за 10 дней — получи <b>-50% на месяц</b> (действует 60 дней).`;
    root.appendChild(banner);
  }
  q.build(root, state);
  showModal(root);
}

/* ====== Quests implementations ====== */

function buildTreasure(root, state){
  const v = variationIndex();
  const map = document.createElement("div");
  map.style.position="relative";
  map.style.height="300px";
  map.style.border="1px solid var(--border)";
  map.style.borderRadius="16px";
  map.style.background="radial-gradient(120% 100% at 60% 30%, rgba(255,255,255,.06), rgba(255,255,255,.02)), url('https://picsum.photos/seed/treasure"+v+"/800/400') center/cover";
  const msg = document.createElement("div");
  msg.innerHTML = "<p>Подсказка: три вспышки укажут на тайник. Нажми на карту, когда вспышка затухает.</p>";
  const btn = document.createElement("button");
  btn.className="btn primary"; btn.textContent="Начать поиск";
  const status = document.createElement("div");
  status.className="tag"; status.textContent="Попытки: 0/3";
  let tries=0, success=0, running=false, active=false;
  let tim=null;
  btn.onclick = ()=>{
    if(running) return;
    running=true; tries=0; success=0; status.textContent="Попытки: 0/3";
    runFlash();
  };
  function runFlash(){
    if(tries>=3){ running=false; finalize(); return; }
    tries++;
    status.textContent = `Попытки: ${tries}/3`;
    active=true;
    map.style.boxShadow="0 0 40px rgba(255,226,122,.45) inset";
    tim = setTimeout(()=>{
      active=false;
      map.style.boxShadow="none";
      if(tries<3) setTimeout(runFlash, 700);
      else setTimeout(()=>{running=false; finalize();}, 300);
    }, 900);
  }
  map.onclick = ()=>{
    if(active){ success++; toast("Нашёл след! +1 фрагмент"); }
  };
  function finalize(){
    const res = document.createElement("div");
    res.className="banner";
    res.innerHTML = success>=2 ? "Клад почти у тебя! Награда: +2 фрагмента." : "Ты был близко. Награда: +1 фрагмент.";
    root.appendChild(res);
  }
  root.append(msg, map, status, btn);
}

function buildCyber(root,state){
  const panel = document.createElement("div");
  panel.style.display="grid"; panel.style.gap="8px";
  panel.innerHTML = "<p>Подбери паттерн: собери ключ из 4 символов по подсветке.</p>";
  const symbols = "▲◆●■★✦✧✪".split("");
  const target = Array.from({length:4},()=>symbols[(variationIndex()+Math.floor(Math.random()*symbols.length))%symbols.length]);
  const board = document.createElement("div"); board.style.display="grid"; board.style.gridTemplateColumns="repeat(7,1fr)"; board.style.gap="6px";
  const sel=[];
  symbols.forEach(s=>{
    const b=document.createElement("button"); b.className="btn"; b.textContent=s;
    b.onclick = ()=>{ if(sel.length<4){ sel.push(s); b.style.outline="2px solid var(--glow1)"; if(sel.length===4) check(); } };
    board.appendChild(b);
  });
  function check(){
    const ok = sel.join("")===target.join("");
    toast(ok?"Шлюз открыт! +2 фрагмента":"Неверно, но система дала +1 фрагмент");
    const tgt = document.createElement("div"); tgt.className="tag"; tgt.textContent="Ключ был: "+target.join(" ");
    panel.appendChild(tgt);
  }
  panel.appendChild(board);
  root.appendChild(panel);
}

function buildBodyLang(root,state){
  const intro = document.createElement("div"); intro.className="questIntro";
  intro.innerHTML = "<p>Считай эмоцию по невербальным сигналам. Выбери один из трёх вариантов.</p>";
  const face = document.createElement("div"); face.className="face"; face.innerHTML='<div class="brow left"></div><div class="brow right"></div><div class="eye left"></div><div class="eye right"></div><div class="mouth"></div>';
  const variants = ["доминантность","неуверенность","радость","гнев","скепсис","удивление","презрение","страх","заинтересованность","решительность","колебание","отвращение","грусть","подчинение","нейтральность"];
  function pick3(){
    const copy=[...variants]; const res=[];
    for(let i=0;i<3;i++){ const idx=Math.floor(Math.random()*copy.length); res.push(copy.splice(idx,1)[0]); }
    return res;
  }
  const allExpressions = ["dominance","uncertainty","happy","angry","skeptic","surprise","contempt","fear","interest","determination","hesitation","disgust","sad","submission","neutral"];
  const exp = allExpressions[(variationIndex())%allExpressions.length];
  document.body.className = document.body.className.replace(/expr-\w+/g,"")+" expr-"+exp;
  const options = pick3();
  const ui = document.createElement("div"); ui.className="questActions";
  options.forEach(op=>{
    const b=document.createElement("button"); b.className="btn"; b.textContent=op;
    b.onclick=()=>{
      const map = {dominance:"доминантность",uncertainty:"неуверенность",happy:"радость",angry:"гнев",skeptic:"скепсис",surprise:"удивление",contempt:"презрение",fear:"страх",interest:"заинтересованность",determination:"решительность",hesitation:"колебание",disgust:"отвращение",sad:"грусть",submission:"подчинение",neutral:"нейтральность"};
      if(op===map[exp]) toast("Верно! +2 фрагмента"); else toast("Чуть мимо, но тоже опыт! +1 фрагмент");
    };
    ui.appendChild(b);
  });
  root.append(intro, face, ui);
}

function buildProfiling(root,state){
  const v = variationIndex();
  const sampleProfiles = Array.from({length:VARIATIONS_PER_QUEST}, (_,i)=>({ 
    avatar:`https://picsum.photos/seed/profile${i}/128/128`, 
    username:`user_${(1000+i)}`, 
    name:`Имя Фамилия ${i+1}`,
    status:["всегда онлайн","редко в сети","ночная сова","работаю над запуском","ищу партнёров"][i%5],
    stories: ["вебинар","доход","путешествие","кейсы","спорт","кофе","код","NFT","бот","таргет"][i%10]
  }));
  const p = sampleProfiles[v];
  const box = document.createElement("div"); box.className="questBody";
  box.innerHTML = `
    <div class="questIntro"><p>Перед тобой профиль. Выбери, какие черты более вероятны.</p></div>
    <div style="display:flex;gap:12px;align-items:center">
      <img src="${p.avatar}" alt="" style="width:72px;height:72px;border-radius:50%;border:1px solid var(--border)"/>
      <div>
        <div><b>${p.name}</b> <span class="muted">@${p.username}</span></div>
        <div class="muted">${p.status}</div>
        <div class="muted">истории: #${p.stories}</div>
      </div>
    </div>
  `;
  const traits = ["доминантность","коллективность","эмоциональность","замкнутость","отрешенность","самопрезентация","рациональность","перфекционизм"];
  const correct = ["самопрезентация","рациональность","коллективность"]; // условно
  const area = document.createElement("div"); area.className="questActions";
  traits.forEach(t=>{
    const b = document.createElement("button"); b.className="btn ghost"; b.textContent=t;
    b.onclick=()=>{
      toast(correct.includes(t) ? "Хорошая оценка! +2 фрагмента" : "Неплохо, но спорно. +1 фрагмент");
    };
    area.appendChild(b);
  });
  root.appendChild(box); root.appendChild(area);
}

function buildIslandLink(root,state){
  const box = document.createElement("div"); box.className="questIntro";
  box.innerHTML = `<p>Это экспериментальная сцена «Остров Архив». Нажми, чтобы открыть визуальную мини‑аппу.</p>`;
  const open = document.createElement("button"); open.className="btn primary"; open.textContent="Открыть остров";
  open.onclick = ()=>{
    if(tg && tg.openLink){
      tg.openLink(ISLAND_MINIAPP_URL, {try_instant_view:false});
    }else{
      const iframe = document.createElement("iframe");
      iframe.src = ISLAND_MINIAPP_URL;
      iframe.style.width="100%"; iframe.style.height="60vh"; iframe.style.border="1px solid var(--border)"; iframe.style.borderRadius="12px";
      root.appendChild(iframe);
    }
  };
  root.append(box, open);
}

function buildROI(root,state){
  const v = variationIndex();
  const opts = Array.from({length:3}, (_,i)=>{
    const spend = 100 + (i+v)%5*50;
    const rev = spend * (1.6 + (i%3)*0.2);
    const roi = (rev-spend)/spend;
    return {label:`Кампания ${String.fromCharCode(65+i)}`, spend, rev, roi};
  });
  const box = document.createElement("div"); box.innerHTML = "<p>Выбери кампанию с лучшим ROI.</p>";
  const area = document.createElement("div"); area.className="questActions";
  const best = opts.reduce((a,b)=> a.roi>b.roi?a:b );
  opts.forEach(o=>{
    const b=document.createElement("button"); b.className="btn"; b.textContent=`${o.label}: потрачено ${o.spend}$, доход ${o.rev.toFixed(0)}$`;
    b.onclick=()=> toast(o===best ? "Верно! +2 фрагмента" : "Можно лучше. +1 фрагмент");
    area.appendChild(b);
  });
  root.append(box, area);
}

function buildFunnel(root,state){
  const steps = ["Показы","Клики","Лиды","Оплаты"];
  const funnel = steps.map((s,i)=> ({name:s, val: 10000 / Math.pow(2, i + (variationIndex()%2))}));
  const txt = document.createElement("p"); txt.textContent="Где узкое место в воронке?";
  const area = document.createElement("div"); area.className="questActions";
  const min = funnel.reduce((a,b)=> a.val<b.val?a:b );
  funnel.forEach(f=>{
    const b=document.createElement("button"); b.className="btn"; b.textContent=`${f.name}: ${f.val|0}`;
    b.onclick=()=> toast(f===min ? "Точно! +2" : "Не совсем. +1");
    area.appendChild(b);
  });
  root.append(txt, area);
}

function buildCopy(root,state){
  const v = variationIndex();
  const pairs = [
    ["Зарабатывай с телефона", "Твой первый онлайн‑доход за 7 дней"],
    ["Как начать без вложений", "0₽ старт: чек‑лист новичка"],
    ["Пассивный доход шаг‑за‑шагом", "Спи — а деньги идут? Разбираем мифы"]
  ];
  const idx = v % pairs.length;
  const [A,B] = pairs[idx];
  const winner = (v%2? "A":"B");
  const txt = document.createElement("p"); txt.textContent = "Что сработало лучше в A/B тесте?";
  const a=document.createElement("button"); a.className="btn"; a.textContent="A) "+A;
  const b=document.createElement("button"); b.className="btn"; b.textContent="B) "+B;
  a.onclick=()=>toast(winner==="A"?"Верно! +2 фрагмента":"На этот раз B был лучше. +1");
  b.onclick=()=>toast(winner==="B"?"Верно! +2 фрагмента":"Сегодня победил A. +1");
  const area=document.createElement("div"); area.className="questActions"; area.append(a,b);
  root.append(txt, area);
}

function buildScam(root,state){
  const txt = document.createElement("p"); txt.textContent="Что из этого похоже на фишинг/скам?";
  const opts = [
    {t:"Гарантированный 20%/день навсегда", scam:true},
    {t:"Партнёрка 10–30% с чек‑листом", scam:false},
    {t:"Платёж «тестовый за 1₽», вернём x100", scam:true}
  ];
  const area = document.createElement("div"); area.className="questActions";
  opts.forEach(o=>{
    const b=document.createElement("button"); b.className="btn"; b.textContent=o.t;
    b.onclick=()=>toast(o.scam?"Верно: это триггер скама. +2":"Осторожно: это похоже на норм вариант. +1");
    area.appendChild(b);
  });
  root.append(txt, area);
}

function buildNiche(root,state){
  const n = [
    {name:"Стикеры‑боты", demand:60, comp:30},
    {name:"Инфо‑продукты", demand:80, comp:70},
    {name:"Автоворонки", demand:70, comp:50}
  ];
  const txt = document.createElement("p"); txt.textContent="Выбери нишу с лучшим балансом спроса/конкуренции.";
  const area = document.createElement("div"); area.className="questActions";
  const score = (x)=> x.demand - x.comp*0.6;
  const best = n.reduce((a,b)=> score(a)>score(b)?a:b);
  n.forEach(o=>{
    const b=document.createElement("button"); b.className="btn"; b.textContent=`${o.name}: спрос ${o.demand}, конкуренция ${o.comp}`;
    b.onclick=()=>toast(o===best ? "Отличный выбор! +2" : "Неплохо, но был лучше вариант. +1");
    area.appendChild(b);
  });
  root.append(txt, area);
}

function buildNoir(root,state){
  const txt = document.createElement("p"); txt.textContent="Восстанови порядок улик (1→3).";
  const clues = ["следы ботинок","сломанный замок","пустая касса"];
  const area = document.createElement("div"); area.className="questActions";
  let order=[];
  clues.forEach(c=>{
    const b=document.createElement("button"); b.className="btn ghost"; b.textContent=c;
    b.onclick=()=>{ order.push(c); if(order.length===3) check(); };
    area.appendChild(b);
  });
  function check(){
    const ok = order.join("|")==="следы ботинок|сломанный замок|пустая касса";
    toast(ok?"Логично! +2":"Последовательность иная. +1");
  }
  root.append(txt, area);
}

function buildSpace(root,state){
  const txt = document.createElement("p"); txt.textContent="Синхронизируй орбиту: нажми, когда спутник в зоне.";
  const zone = document.createElement("div"); zone.style.height="120px"; zone.style.border="1px solid var(--border)"; zone.style.borderRadius="12px"; zone.style.position="relative"; zone.style.overflow="hidden";
  const sat = document.createElement("div"); sat.style.width="14px"; sat.style.height="14px"; sat.style.borderRadius="50%"; sat.style.background="var(--glow2)"; sat.style.position="absolute"; sat.style.left="0"; sat.style.top="52px";
  const gate = document.createElement("div"); gate.style.position="absolute"; gate.style.left="50%"; gate.style.top="40px"; gate.style.width="40px"; gate.style.height="40px"; gate.style.border="2px dashed var(--accent)"; gate.style.borderRadius="50%";
  zone.append(sat, gate);
  let x=0, dir=1;
  const loop = ()=>{
    x+=dir*2; if(x>zone.clientWidth-14){dir=-1}else if(x<0){dir=1}
    sat.style.transform=`translateX(${x}px)`;
    requestAnimationFrame(loop);
  }; loop();
  zone.onclick=()=>{
    const satCenter = x+7, gateLeft=zone.clientWidth/2-20, gateRight=zone.clientWidth/2+20;
    if(satCenter>gateLeft && satCenter<gateRight){ toast("Синхронизация! +2 фрагмента"); } else { toast("Почти! +1"); }
  };
  root.append(txt, zone);
}

function buildGears(root,state){
  const txt = document.createElement("p"); txt.textContent="Выставь шестерни так, чтобы большая крутилась по часовой.";
  const area=document.createElement("div"); area.className="questActions";
  ["маленькая ↺","средняя ↻","большая ↺","большая ↻"].forEach(t=>{
    const b=document.createElement("button"); b.className="btn"; b.textContent=t;
    b.onclick=()=>toast(t.includes("большая ↻")? "Да! +2" : "Нет, передача неверна. +1");
    area.appendChild(b);
  });
  root.append(txt, area);
}

function buildSignals(root,state){
  const txt=document.createElement("p"); txt.textContent="Выбери график с явным восходящим трендом.";
  const area=document.createElement("div"); area.className="questActions";
  const arr=[ "+  ／／／", "~  ／~／", "-  \\\\__" ];
  const best=0;
  arr.forEach((g,i)=>{
    const b=document.createElement("button"); b.className="btn"; b.textContent=g.replaceAll("/", "▝").replaceAll("\\\\","▖");
    b.onclick=()=>toast(i===best? "Это тренд! +2":"Шум. +1");
    area.appendChild(b);
  });
  root.append(txt, area);
}

function buildConstellation(root,state){
  const txt=document.createElement("p"); txt.textContent="Проведи линию через звёзды.";
  const box=document.createElement("div"); box.style.height="240px"; box.style.border="1px solid var(--border)"; box.style.borderRadius="12px"; box.style.position="relative";
  const stars = Array.from({length:5},(_,i)=>({x:20+i*50+Math.random()*20, y:30+Math.random()*160}));
  stars.forEach(s=>{
    const d=document.createElement("div");
    d.style.width="8px"; d.style.height="8px"; d.style.borderRadius="50%"; d.style.background="white"; d.style.position="absolute"; d.style.left=s.x+'px'; d.style.top=s.y+'px';
    box.appendChild(d);
  });
  let drawing=false; let last=null;
  box.addEventListener("pointerdown",e=>{drawing=true; last={x:e.offsetX,y:e.offsetY}});
  box.addEventListener("pointermove",e=>{
    if(!drawing) return;
    const seg=document.createElement("div");
    const dx=e.offsetX-last.x, dy=e.offsetY,lastx=last.x,lasty=last.y, len=Math.hypot(dx,dy), ang=Math.atan2(dy,dx)*180/Math.PI;
    seg.style.position="absolute"; seg.style.left=lastx+'px'; seg.style.top=lasty+'px';
    seg.style.width=len+'px'; seg.style.height='2px'; seg.style.background="linear-gradient(90deg, #A6B4FF, transparent)";
    seg.style.transformOrigin="0 50%"; seg.style.transform=`rotate(${ang}deg)`;
    seg.style.opacity=".85";
    box.appendChild(seg);
    last={x:e.offsetX,y:e.offsetY};
  });
  window.addEventListener("pointerup",()=>{ if(drawing){ drawing=false; toast("Созвездие собрано! +2"); } });
  root.append(txt, box);
}

/* ====== Subscription + promo ====== */
async function loadState(){
  let userId = null;
  try{ userId = tg && tg.initDataUnsafe && tg.initDataUnsafe.user ? String(tg.initDataUnsafe.user.id) : null; }catch(e){}
  let isSubscribed=false;
  if(supabase && userId){
    try{
      const { data, error } = await supabase.from(SUBSCRIPTIONS_TABLE).select("*").eq("tg_id", userId).maybeSingle();
      if(!error && data){ isSubscribed=true; }
    }catch(e){ console.warn("supabase check fail", e); }
  }
  return { userId, isSubscribed };
}

function recordDayVisit(){
  const key="qh_days";
  const d = String(dayIndex());
  let set=new Set((localStorage.getItem(key)||"").split(",").filter(Boolean));
  set.add(d);
  localStorage.setItem(key, Array.from(set).join(","));
  return set.size;
}

async function maybeOfferPromo(state){
  if(state.isSubscribed) return;
  const days = recordDayVisit();
  if(days>=10){
    const claim = document.createElement("div");
    claim.className="glass"; claim.style.margin="12px"; claim.style.padding="12px";
    claim.innerHTML = `<b>Поздравляем!</b> Ты открыл все квесты за 10 дней. Забери промокод на -50% (действует 60 дней).`;
    const btn = document.createElement("button"); btn.className="btn primary"; btn.textContent="Получить промокод";
    btn.onclick = async ()=>{
      const code = genCode(state.userId);
      await savePromo(code, state.userId);
      const box = document.createElement("div"); box.className="banner";
      box.innerHTML = `Промокод: <b>${code}</b> — действует 60 дней. Напиши администратору <a href="https://t.me/${ADMIN_USERNAME}" target="_blank">@${ADMIN_USERNAME}</a>.`;
      claim.appendChild(box);
    };
    claim.appendChild(btn);
    $(".app").insertAdjacentElement("afterbegin", claim);
  }
}

function genCode(uid){
  const rand = Math.random().toString(36).slice(2,8).toUpperCase();
  return ("QH-"+(uid||"GUEST").slice(-4)+"-"+rand).replace(/[^A-Z0-9\-]/g,"");
}

async function savePromo(code, uid){
  if(!supabase){ toast("Промокод: "+code); return true; }
  const expires = new Date(Date.now()+60*24*60*60*1000).toISOString();
  const { data, error } = await supabase.from(PROMOCODES_TABLE).insert({ code, tg_id: uid, status:"unused", issued_at: new Date().toISOString(), expires_at: expires });
  if(error){ console.warn(error); toast("Сохранение промокода не удалось, но код: "+code); return false; }
  toast("Промокод сохранён!");
  return true;
}

/* ====== Header buttons ====== */
$("#btnSubscribe").addEventListener("click", ()=>{
  if(tg && tg.openLink){ tg.openLink(PAYMENT_URL, {try_instant_view:false}); } else { window.open(PAYMENT_URL, "_blank"); }
});
$("#btnAlbum").addEventListener("click", ()=>{ toast("Коллекция скоро здесь ✨"); });

/* ====== Init ====== */
loadState().then(state=>{
  buildCards(state);
  maybeOfferPromo(state);
});
