/* ===== BUSINESS QUEST ENGINE (clean rebuild) ===== */

class BusinessQuestEngine {
  constructor() {
    // Стадии по ключам, как ожидает UI
    this.stages = ['businessNiche', 'teamHiring', 'businessManagement', 'questResults'];

    // Данные (кандидаты и позиции) могут приходить из business-data.js; подстрахуемся дефолтами
    this.candidates = Array.isArray(window.BUSINESS_CANDIDATES) ? window.BUSINESS_CANDIDATES : [];
    this.positions  = Array.isArray(window.BUSINESS_POSITIONS)  ? window.BUSINESS_POSITIONS  : [
      { id: 'marketing',  title: 'Маркетинг' },
      { id: 'sales',      title: 'Продажи' },
      { id: 'tech',       title: 'Технологии' },
      { id: 'finance',    title: 'Финансы' },
      { id: 'operations', title: 'Операции' }
    ];
    this.niches     = Array.isArray(window.BUSINESS_NICHES) ? window.BUSINESS_NICHES : [
      { id: 'onlinestore', name: 'Онлайн-магазин', metrics: { monthlyRevenue: 5000, monthlyExpenses: 3000 } },
      { id: 'fitness', name: 'Фитнес-клуб', metrics: { monthlyRevenue: 7000, monthlyExpenses: 4500 } },
      { id: 'apps', name: 'MiniApps студия', metrics: { monthlyRevenue: 9000, monthlyExpenses: 6000 } }
    ];

    // Состояние игры
    this.gameState = {
      currentStage: 0,
      selectedNiche: null,
      hiredTeam: {},
      businessStats: {
        capital: 50000,
        revenue: 0,
        expenses: 0,
        profit: 0,
        month: 1,
        maxMonths: 12
      },
      isRunning: false,
      isCompleted: false,
      passiveBusiness: null,
      eventsLog: []
    };

    // Простой EventEmitter
    this.listeners = {};

    // Инициализация
    try { this.loadProgress(); } catch(e) {}
    this.emit('initialized', this.gameState);
  }

  /* ===== Event Emitter ===== */
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
  emit(event, payload) {
    const arr = this.listeners[event] || [];
    arr.forEach(cb => { try { cb(payload); } catch(e) { console.error(e); } });
  }

  /* ===== Persistence ===== */
  saveProgress() {
    try {
      localStorage.setItem('businessQuestState', JSON.stringify(this.gameState));
    } catch (e) {
      console.warn('Не удалось сохранить состояние', e);
    }
  }
  loadProgress() {
    try {
      const raw = localStorage.getItem('businessQuestState');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        this.gameState = Object.assign(this.gameState, parsed);
      }
    } catch (e) {
      console.warn('Не удалось загрузить состояние', e);
    }
  }

  /* ===== Stage control ===== */
  startQuest() {
    this.gameState.isRunning = false;
    this.gameState.isCompleted = false;
    this.gameState.currentStage = 0;
    this.saveProgress();
    this.emit('stageChanged', this.getCurrentStage());
  }

  getCurrentStage() {
    return this.stages[this.gameState.currentStage] || 'businessNiche';
  }

  setStage(idx) {
    if (idx >= 0 && idx < this.stages.length) {
      this.gameState.currentStage = idx;
      this.saveProgress();
      this.emit('stageChanged', this.getCurrentStage());
    }
  }

  nextStage() {
    if (this.gameState.currentStage < this.stages.length - 1) {
      this.gameState.currentStage += 1;
      this.saveProgress();
      this.emit('stageChanged', this.getCurrentStage());
    }
  }

  previousStage() {
    if (this.gameState.currentStage > 0) {
      this.gameState.currentStage -= 1;
      this.saveProgress();
      this.emit('stageChanged', this.getCurrentStage());
      return true;
    }
    return false;
  }

  /* ===== Niche selection ===== */
  selectNiche(nicheId) {
    const niche = this.niches.find(n => n.id === nicheId);
    if (!niche) return false;
    this.gameState.selectedNiche = niche;
    this.saveProgress();
    this.emit('nicheSelected', niche);
    return true;
  }

  getSelectedNiche() {
    return this.gameState.selectedNiche;
  }

  /* ===== Hiring ===== */
  getPositionById(positionId) {
    return this.positions.find(p => p.id === positionId) || { id: positionId, title: positionId };
  }

  calculateSalary(candidate, position) {
    const base = 4000;
    const bonus = (candidate && candidate.level ? candidate.level * 500 : 0);
    return base + bonus;
  }

  canHireCandidate(candidate, position) {
    // Разрешаем любого кандидата на любую позицию, если слот свободен
    if (this.gameState.hiredTeam[position.id]) return false;
    return true;
  }

  getCandidatesForPosition(positionId) {
    const hiredIds = Object.values(this.gameState.hiredTeam).map(c => c.id);
    return this.candidates.filter(c => hiredIds.indexOf(c.id) === -1);
  }

  hireCandidate(candidateId, positionId) {
    const candidate = this.candidates.find(c => c.id === candidateId);
    const position = this.getPositionById(positionId);
    if (candidate && position && this.canHireCandidate(candidate, position)) {
      this.gameState.hiredTeam[positionId] = Object.assign({}, candidate, {
        hiredAt: this.gameState.businessStats.month,
        salary: this.calculateSalary(candidate, position)
      });
      this.saveProgress();
      this.emit('candidateHired', { candidate, position });
      return true;
    }
    return false;
  }

  fireCandidate(positionId) {
    if (this.gameState.hiredTeam[positionId]) {
      const candidate = this.gameState.hiredTeam[positionId];
      delete this.gameState.hiredTeam[positionId];
      this.saveProgress();
      this.emit('candidateFired', { candidate, position: positionId });
      return true;
    }
    return false;
  }

  /* ===== Simulation / Management ===== */
  startBusiness() {
    this.gameState.isRunning = true;
    this.saveProgress();
    this.emit('businessStarted', null);
  }

  evaluateTeamCompatibility() {
    const team = this.gameState.hiredTeam || {};
    let score = 0;
    for (const posId in team) {
      if (!Object.prototype.hasOwnProperty.call(team, posId)) continue;
      const emp = team[posId];
      if (emp && emp.role && emp.role === posId) score += 1;
      else score -= 1;
    }
    return score;
  }

  generateMonthlyEvent() {
    if (!this.gameState.isRunning) return null;
    const negative = this.evaluateTeamCompatibility() < 0;
    const id = 'evt_' + String(Date.now());
    const title = negative ? 'Незапланированный кризис' : 'Возможность для рывка';
    const description = negative
      ? 'Команда допоздна тушит проблемный участок работы. Что делать?'
      : 'На горизонте крутой шанс. Как поступим?';
    const choices = negative
      ? [{id:'a', text:'Потушить деньгами (-5000 ₽)'}, {id:'b', text:'Перераспределить обязанности (риск падения качества)'}]
      : [{id:'a', text:'Инвестировать в рост (-3000 ₽, возможен +доход)'}, {id:'b', text:'Осторожный тест (меньше риск, меньше выгода)'}];
    const outcomes = {
      a: negative ? { deltaCapital:-5000, deltaRevenue:0 } : { deltaCapital:-3000, deltaRevenue: 2000 + Math.floor(Math.random()*3000) },
      b: negative ? { deltaCapital:0, deltaRevenue: -(1000 + Math.floor(Math.random()*2000)) } : { deltaCapital:0, deltaRevenue: 800 + Math.floor(Math.random()*1200) }
    };
    this.gameState.eventsLog.push({ id, month:this.gameState.businessStats.month, negative, title });
    this.saveProgress();
    return { id, title, description, choices, outcomes };
  }

  applyEventChoice(eventId, choiceId) {
    const ev = this.gameState.eventsLog.find(e => e.id === eventId);
    const tmp = this.generateMonthlyEvent();
    const outcome = (tmp && tmp.outcomes) ? tmp.outcomes[choiceId] : null;
    if (!outcome) return false;
    this.gameState.businessStats.capital += outcome.deltaCapital || 0;
    this.gameState.businessStats.revenue += outcome.deltaRevenue || 0;
    this.updateBusinessStats();
    this.saveProgress();
    this.emit('eventResolved', {eventId, choiceId, outcome});
    return true;
  }

  updateBusinessStats() {
    const bs = this.gameState.businessStats;
    bs.expenses = Object.values(this.gameState.hiredTeam).reduce((sum, e) => sum + (e.salary || 0), 0);
    bs.profit = bs.revenue - bs.expenses;
    this.saveProgress();
  }

  generatePassiveIncome() {
    // нишевый пассив
    if (this.gameState.selectedNiche && this.gameState.selectedNiche.metrics) {
      const baseIncome = this.gameState.selectedNiche.metrics.monthlyRevenue || 0;
      const teamBonus = Object.keys(this.gameState.hiredTeam).length * 0.2;
      const income = Math.round(baseIncome * (1 + teamBonus));
      this.gameState.businessStats.revenue += income;
    }
    // пассивный бизнес (MULACOIN)
    const pb = this.gameState.passiveBusiness;
    if (pb) {
      const days = Math.floor((Date.now() - (new Date(pb.startedAt)).getTime()) / (1000*60*60*24));
      const expected = days * (pb.perDay || 10);
      if (!pb.totalEarned || expected > pb.totalEarned) {
        pb.totalEarned = expected;
      }
      if (!pb.isInCrisis && Date.now() > (new Date(pb.crisisAt)).getTime()) {
        pb.isInCrisis = true;
        pb.issues = Array.isArray(pb.issues) ? pb.issues : [];
        pb.issues.push({ when: new Date().toISOString(), text: 'Кризис ликвидности: падение спроса и рост расходов' });
      }
    }
  }

  nextMonth() {
    if (!this.gameState.isRunning) return false;
    const bs = this.gameState.businessStats;
    if (bs.month >= bs.maxMonths) return false;
    bs.month += 1;
    this.generatePassiveIncome();
    this.updateBusinessStats();
    this.saveProgress();
    this.emit('monthAdvanced', bs.month);
    return true;
  }

  performBusinessAction(actionType) {
    // Простейший обработчик действия; можно расширять
    if (!this.gameState.isRunning) return false;
    if (actionType === 'optimize') {
      this.gameState.businessStats.expenses = Math.max(0, this.gameState.businessStats.expenses - 500);
    } else if (actionType === 'promo') {
      this.gameState.businessStats.revenue += 1000;
    }
    this.updateBusinessStats();
    this.saveProgress();
    return true;
  }

  calculateSalePrice() {
    const cap = this.gameState.businessStats.capital || 0;
    let price = Math.floor(cap / 1000);
    if (price < 50) price = 50;
    if (price > 1000) price = 1000;
    return price;
  }

  completeSale(price) {
    this.gameState.isCompleted = true;
    this.gameState.isRunning = false;
    this.gameState.salePrice = price;
    this.saveProgress();
    this.emit('questCompleted', { sale: price });
    return true;
  }

  enablePassiveBusiness() {
    const now = new Date();
    const crisisDays = 7 + Math.floor(Math.random()*8);
    const pb = {
      startedAt: now.toISOString(),
      perDay: 10,
      totalEarned: 0,
      issues: [],
      crisisAt: new Date(now.getTime() + crisisDays*24*3600*1000).toISOString(),
      isInCrisis: false
    };
    this.gameState.passiveBusiness = pb;
    this.saveProgress();
    try {
      if (typeof window !== 'undefined' && window.supabase && window.SUPABASE_URL && window.SUPABASE_KEY) {
        const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
        client.from('businesses').upsert({
          user_id: (typeof window.USER_ID !== 'undefined' ? window.USER_ID : null),
          started_at: pb.startedAt,
          per_day: pb.perDay,
          total_earned: pb.totalEarned,
          crisis_at: pb.crisisAt,
          is_in_crisis: pb.isInCrisis,
          issues: pb.issues
        });
      }
    } catch (e) {
      console.warn('Supabase недоступен, используется локальное сохранение', e);
    }
    this.emit('passiveEnabled', pb);
    return true;
  }

  calculateFinalResults() {
    const bs = this.gameState.businessStats;
    const outcome = {
      capital: bs.capital,
      revenue: bs.revenue,
      expenses: bs.expenses,
      profit: bs.profit,
      month: bs.month
    };
    this.emit('finalCalculated', outcome);
    return outcome;
  }
}

/* Экспорт для использования в других модулях */
window.BusinessQuestEngine = BusinessQuestEngine;