/**
 * SCADAmon Battle Engine
 * Handles battle logic, animations, and quiz integration
 */

import { MOVES, TYPE_COLORS, calculateDamage, getTypeEffectiveness, getScadamonByName } from './scadamon-data.js';
import stateManager from './state-manager.js';

// Battle states
const BATTLE_STATE = {
  INTRO: 'intro',
  PLAYER_TURN: 'player_turn',
  QUESTION: 'question',
  PLAYER_ATTACK: 'player_attack',
  ENEMY_ATTACK: 'enemy_attack',
  VICTORY: 'victory',
  DEFEAT: 'defeat',
  SWITCHING: 'switching'
};

// Animation speeds in ms
const ANIMATION_SPEEDS = {
  slow: { attack: 1200, hpDrain: 1500, shake: 400, fade: 800 },
  normal: { attack: 800, hpDrain: 1000, shake: 300, fade: 500 },
  fast: { attack: 400, hpDrain: 500, shake: 150, fade: 250 }
};

class BattleEngine {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Battle container not found: ${containerId}`);
    }

    this.options = {
      gymId: options.gymId || 1,
      gymLeader: options.gymLeader || null,
      questions: options.questions || [],
      passingScore: options.passingScore || 75,
      questionsPerBattle: options.questionsPerBattle || 25,
      onComplete: options.onComplete || (() => {}),
      animationSpeed: options.animationSpeed || 'normal',
      ...options
    };

    this.state = BATTLE_STATE.INTRO;
    this.playerTeam = [];
    this.playerCurrent = 0;
    this.enemyTeam = [];
    this.enemyCurrent = 0;

    this.questionsAsked = 0;
    this.questionsCorrect = 0;
    this.currentQuestion = null;
    this.selectedMove = null;

    this.animSpeeds = ANIMATION_SPEEDS[this.options.animationSpeed];

    this.init();
  }

  /**
   * Initialize the battle
   */
  async init() {
    // Wait for state manager to be ready
    if (!stateManager.initialized) {
      await stateManager.initialize();
    }

    // Get player team
    this.playerTeam = stateManager.getTeam().map(mon => ({
      ...mon,
      currentHp: mon.currentHp
    }));

    // Calculate average player level for scaling
    const avgPlayerLevel = Math.round(
      this.playerTeam.reduce((sum, mon) => sum + mon.level, 0) / this.playerTeam.length
    );

    console.log(`[BattleEngine] Player team avg level: ${avgPlayerLevel}`);

    // Create enemy team from gym leader, scaled to player level
    if (this.options.gymLeader) {
      this.enemyTeam = this.options.gymLeader.team.map((entry, index) => {
        const def = getScadamonByName(entry.scadamon);
        if (!def) {
          console.error(`SCADAmon not found: ${entry.scadamon}`);
          return null;
        }
        // Scale enemy level: match player level, with slight increase for later enemies
        // First enemy = player level, subsequent enemies +1 each
        const scaledLevel = avgPlayerLevel + index;
        console.log(`[BattleEngine] Creating enemy ${def.name} at level ${scaledLevel} (original: ${entry.level})`);
        return this.createEnemyInstance(def, scaledLevel);
      }).filter(Boolean);
    }

    // Shuffle and limit questions to questionsPerBattle
    if (this.options.questions.length > this.options.questionsPerBattle) {
      this.options.questions = this.shuffleArray([...this.options.questions])
        .slice(0, this.options.questionsPerBattle);
      console.log(`[BattleEngine] Limited questions to ${this.options.questionsPerBattle} from bank`);
    }

    // Render battle UI
    this.render();

    // Start intro sequence
    await this.playIntro();
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Create enemy SCADAmon instance
   */
  createEnemyInstance(definition, level) {
    const stats = this.calculateStats(definition.baseStats, level);
    const moves = definition.moves || ['MALWARE_INJECT', 'PHISHING_LURE'];

    return {
      id: 'enemy_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      definitionId: definition.id,
      name: definition.name,
      types: [...definition.types],
      level: level,
      currentHp: stats.hp,
      maxHp: stats.hp,
      stats: stats,
      moves: moves,
      emoji: definition.emoji
    };
  }

  /**
   * Calculate stats for enemy
   */
  calculateStats(baseStats, level) {
    const statCalc = (base) => Math.floor(((2 * base) * level / 100) + level + 10);
    const hpCalc = (base) => Math.floor(((2 * base) * level / 100) + level + 10 + level);

    return {
      hp: hpCalc(baseStats.hp),
      atk: statCalc(baseStats.atk),
      def: statCalc(baseStats.def),
      spd: statCalc(baseStats.spd),
      int: statCalc(baseStats.int || 50),
      res: statCalc(baseStats.res || 50)
    };
  }

  /**
   * Render the battle UI
   */
  render() {
    const player = this.playerTeam[this.playerCurrent];
    const enemy = this.enemyTeam[this.enemyCurrent];

    this.container.innerHTML = `
      <div class="battle-scene">
        <!-- Battle Background -->
        <div class="battle-background">
          <div class="battle-bg-placeholder">
            <!-- Placeholder for battle background image -->
            <div class="bg-grid"></div>
          </div>
        </div>

        <!-- Enemy Side -->
        <div class="battle-enemy-side">
          <div class="battle-info-box enemy-info">
            <div class="battle-name">${enemy?.name || '???'}</div>
            <div class="battle-level">Lv. ${enemy?.level || '?'}</div>
            <div class="battle-hp-container">
              <div class="battle-hp-label">HP</div>
              <div class="battle-hp-bar">
                <div class="battle-hp-fill enemy-hp" style="width: ${this.getHpPercent(enemy)}%"></div>
              </div>
            </div>
            <div class="battle-types">
              ${(enemy?.types || []).map(t => `<span class="type-badge" style="background: ${TYPE_COLORS[t]}">${t}</span>`).join('')}
            </div>
          </div>

          <div class="battle-sprite-container enemy-sprite-container">
            <div class="battle-sprite enemy-sprite" id="enemy-sprite">
              <div class="sprite-placeholder">${enemy?.emoji || '?'}</div>
            </div>
            <div class="trainer-sprite gym-leader-sprite" id="gym-leader-sprite">
              <div class="sprite-placeholder">${this.options.gymLeader?.emoji || '🏛️'}</div>
            </div>
          </div>
        </div>

        <!-- Player Side -->
        <div class="battle-player-side">
          <div class="battle-sprite-container player-sprite-container">
            <div class="battle-sprite player-sprite" id="player-sprite">
              <div class="sprite-placeholder">${player?.emoji || '?'}</div>
            </div>
            <div class="trainer-sprite player-trainer-sprite" id="player-trainer-sprite">
              <div class="sprite-placeholder">🧑‍💻</div>
            </div>
          </div>

          <div class="battle-info-box player-info">
            <div class="battle-name">${player?.name || '???'}</div>
            <div class="battle-level">Lv. ${player?.level || '?'}</div>
            <div class="battle-hp-container">
              <div class="battle-hp-label">HP</div>
              <div class="battle-hp-bar">
                <div class="battle-hp-fill player-hp" style="width: ${this.getHpPercent(player)}%"></div>
              </div>
              <div class="battle-hp-text">${player?.currentHp || 0} / ${player?.maxHp || 0}</div>
            </div>
            <div class="battle-types">
              ${(player?.types || []).map(t => `<span class="type-badge" style="background: ${TYPE_COLORS[t]}">${t}</span>`).join('')}
            </div>
          </div>
        </div>

        <!-- Message Box -->
        <div class="battle-message-box" id="battle-message">
          <div class="message-text" id="message-text"></div>
        </div>

        <!-- Move Selection -->
        <div class="battle-moves-panel" id="moves-panel" style="display: none;">
          <div class="moves-header">What will ${player?.name || 'SCADAmon'} do?</div>
          <div class="moves-grid" id="moves-grid">
            ${this.renderMoves(player)}
          </div>
        </div>

        <!-- Question Panel -->
        <div class="battle-question-panel" id="question-panel" style="display: none;">
          <div class="question-box">
            <div class="question-text" id="question-text"></div>
          </div>
          <div class="answers-grid" id="answers-grid"></div>
        </div>

        <!-- Battle Stats -->
        <div class="battle-stats">
          <div class="stat-item">
            <span class="stat-label">Questions:</span>
            <span class="stat-value" id="stat-questions">${this.questionsCorrect}/${this.questionsAsked}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Score:</span>
            <span class="stat-value" id="stat-score">${this.getScore()}%</span>
          </div>
        </div>
      </div>
    `;

    // Attach event listeners
    this.attachEventListeners();
  }

  /**
   * Render move buttons
   */
  renderMoves(scadamon) {
    if (!scadamon || !scadamon.moves) return '';

    return scadamon.moves.map((moveId, index) => {
      const move = MOVES[moveId];
      if (!move) return '';

      return `
        <button class="move-button" data-move="${moveId}" data-index="${index}">
          <div class="move-name">${move.name}</div>
          <div class="move-info">
            <span class="move-type" style="background: ${TYPE_COLORS[move.type]}">${move.type}</span>
            <span class="move-power">${move.power > 0 ? `PWR: ${move.power}` : 'STATUS'}</span>
          </div>
          <div class="move-emoji">${move.emoji || '⚔️'}</div>
        </button>
      `;
    }).join('');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Move buttons
    const movesGrid = document.getElementById('moves-grid');
    if (movesGrid) {
      movesGrid.addEventListener('click', (e) => {
        const button = e.target.closest('.move-button');
        if (button && this.state === BATTLE_STATE.PLAYER_TURN) {
          this.selectMove(button.dataset.move);
        }
      });
    }

    // Answer buttons (delegated)
    const answersGrid = document.getElementById('answers-grid');
    if (answersGrid) {
      answersGrid.addEventListener('click', (e) => {
        const button = e.target.closest('.answer-button');
        if (button && this.state === BATTLE_STATE.QUESTION) {
          this.answerQuestion(parseInt(button.dataset.index));
        }
      });
    }
  }

  /**
   * Get HP percentage
   */
  getHpPercent(scadamon) {
    if (!scadamon || !scadamon.maxHp) return 0;
    return Math.max(0, Math.min(100, (scadamon.currentHp / scadamon.maxHp) * 100));
  }

  /**
   * Get current score percentage
   */
  getScore() {
    if (this.questionsAsked === 0) return 100;
    return Math.round((this.questionsCorrect / this.questionsAsked) * 100);
  }

  /**
   * Show message in message box
   */
  async showMessage(text, duration = 2000) {
    const messageEl = document.getElementById('message-text');
    if (messageEl) {
      messageEl.textContent = text;

      // Typewriter effect
      messageEl.style.opacity = '0';
      await this.wait(50);
      messageEl.style.opacity = '1';

      if (duration > 0) {
        await this.wait(duration);
      }
    }
  }

  /**
   * Play intro sequence
   */
  async playIntro() {
    this.state = BATTLE_STATE.INTRO;

    // Hide panels
    this.hidePanel('moves-panel');
    this.hidePanel('question-panel');

    // Show gym leader message
    if (this.options.gymLeader) {
      await this.showMessage(`${this.options.gymLeader.name}: "${this.options.gymLeader.preBattleMessage}"`, 3000);
    }

    // Send out enemy
    const enemy = this.enemyTeam[this.enemyCurrent];
    await this.showMessage(`${this.options.gymLeader?.name || 'Enemy'} sent out ${enemy.name}!`, 2000);

    // Animate enemy appearance
    await this.animateAppear('enemy-sprite');

    // Send out player
    const player = this.playerTeam[this.playerCurrent];
    await this.showMessage(`Go! ${player.name}!`, 1500);

    // Animate player appearance
    await this.animateAppear('player-sprite');

    // Start player turn
    this.startPlayerTurn();
  }

  /**
   * Start player's turn
   */
  startPlayerTurn() {
    this.state = BATTLE_STATE.PLAYER_TURN;
    this.showPanel('moves-panel');
    this.hidePanel('question-panel');
    this.showMessage('Choose a move!', 0);
  }

  /**
   * Handle move selection
   */
  async selectMove(moveId) {
    this.selectedMove = MOVES[moveId];
    if (!this.selectedMove) return;

    this.hidePanel('moves-panel');

    // Show question for this move's domain
    await this.showQuestion();
  }

  /**
   * Show a question for the selected move
   */
  async showQuestion() {
    this.state = BATTLE_STATE.QUESTION;

    // Get a question (preferring move's domain but falling back)
    const question = this.getNextQuestion();
    if (!question) {
      // No questions left, auto-success
      await this.executeAttack(true);
      return;
    }

    // Randomize answer order while tracking correct answer
    const originalCorrectIndex = question.correctIndex ?? question.correct ?? 0;
    const originalOptions = [...question.options];

    // Create shuffled indices
    const indices = originalOptions.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Create shuffled options and find new correct index
    const shuffledOptions = indices.map(i => originalOptions[i]);
    const newCorrectIndex = indices.indexOf(originalCorrectIndex);

    // Store the randomized question with updated correct index
    this.currentQuestion = {
      ...question,
      options: shuffledOptions,
      correctIndex: newCorrectIndex,
      correct: newCorrectIndex,
      originalOptions: originalOptions,
      originalCorrectIndex: originalCorrectIndex
    };

    this.questionsAsked++;

    // Update stats display
    this.updateStats();

    // Show question panel
    const questionText = document.getElementById('question-text');
    const answersGrid = document.getElementById('answers-grid');

    if (questionText) {
      questionText.textContent = this.currentQuestion.question;
    }

    if (answersGrid) {
      answersGrid.innerHTML = this.currentQuestion.options.map((opt, i) => `
        <button class="answer-button" data-index="${i}">
          <span class="answer-letter">${String.fromCharCode(65 + i)}</span>
          <span class="answer-text">${opt}</span>
        </button>
      `).join('');
    }

    this.showPanel('question-panel');
    await this.showMessage(`${this.selectedMove.name}! Answer correctly to land the attack!`, 0);
  }

  /**
   * Get next question from pool
   */
  getNextQuestion() {
    if (this.options.questions.length === 0) return null;

    // Get unused questions preferring move's domain
    const unusedQuestions = this.options.questions.filter(q => !q.used);

    if (unusedQuestions.length === 0) {
      // Reset all questions
      this.options.questions.forEach(q => q.used = false);
      return this.options.questions[0];
    }

    // Prefer questions matching move domain
    const domainQuestions = unusedQuestions.filter(q =>
      q.domain === this.selectedMove?.domain
    );

    const question = domainQuestions.length > 0
      ? domainQuestions[Math.floor(Math.random() * domainQuestions.length)]
      : unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];

    question.used = true;
    return question;
  }

  /**
   * Handle answer selection
   */
  async answerQuestion(answerIndex) {
    this.state = BATTLE_STATE.PLAYER_ATTACK;
    this.hidePanel('question-panel');

    const correct = answerIndex === (this.currentQuestion.correct ?? this.currentQuestion.correctIndex);

    // Highlight answer
    const buttons = document.querySelectorAll('.answer-button');
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === (this.currentQuestion.correct ?? this.currentQuestion.correctIndex)) {
        btn.classList.add('correct');
      } else if (i === answerIndex && !correct) {
        btn.classList.add('incorrect');
      }
    });

    if (correct) {
      this.questionsCorrect++;
      await this.showMessage('Correct!', 1000);

      // Report to LRS
      await window.cmi5?.answered(
        this.currentQuestion.id,
        this.currentQuestion.options[answerIndex],
        true
      );
    } else {
      await this.showMessage(`Wrong! The answer was: ${this.currentQuestion.options[this.currentQuestion.correct ?? this.currentQuestion.correctIndex]}`, 2500);

      // Report to LRS
      await window.cmi5?.answered(
        this.currentQuestion.id,
        this.currentQuestion.options[answerIndex],
        false
      );
    }

    this.updateStats();
    await this.executeAttack(correct);
  }

  /**
   * Execute the attack
   */
  async executeAttack(correct) {
    const player = this.playerTeam[this.playerCurrent];
    const enemy = this.enemyTeam[this.enemyCurrent];

    if (correct && this.selectedMove.power > 0) {
      // Calculate and deal damage
      const damage = calculateDamage(player, enemy, this.selectedMove, true);
      const effectiveness = getTypeEffectiveness(this.selectedMove.type, enemy.types);

      await this.showMessage(`${player.name} used ${this.selectedMove.name}!`, 1500);

      // Play attack animation
      await this.animateAttack('player-sprite', 'enemy-sprite');

      // Show effectiveness
      if (effectiveness > 1) {
        await this.showMessage("It's super effective!", 1000);
      } else if (effectiveness < 1 && effectiveness > 0) {
        await this.showMessage("It's not very effective...", 1000);
      } else if (effectiveness === 0) {
        await this.showMessage("It doesn't affect the enemy!", 1500);
      }

      // Apply damage
      enemy.currentHp = Math.max(0, enemy.currentHp - damage);
      await this.animateHpDrain('enemy-hp', this.getHpPercent(enemy));

      // Check if enemy fainted
      if (enemy.currentHp <= 0) {
        await this.handleEnemyFaint();
        return;
      }
    } else if (correct && this.selectedMove.power === 0) {
      // Status move
      await this.showMessage(`${player.name} used ${this.selectedMove.name}!`, 1500);
      await this.showMessage(`${player.name}'s stats changed!`, 1500);
    } else {
      // Missed due to wrong answer
      await this.showMessage(`${player.name}'s attack missed!`, 1500);
    }

    // Enemy's turn
    await this.enemyTurn();
  }

  /**
   * Enemy's turn
   */
  async enemyTurn() {
    this.state = BATTLE_STATE.ENEMY_ATTACK;

    const enemy = this.enemyTeam[this.enemyCurrent];
    const player = this.playerTeam[this.playerCurrent];

    // Enemy picks a random move
    const enemyMoves = enemy.moves.map(m => MOVES[m]).filter(m => m);
    const enemyMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];

    if (!enemyMove) {
      this.startPlayerTurn();
      return;
    }

    // Calculate current performance
    const currentScore = this.getScore();
    const wrongAnswers = this.questionsAsked - this.questionsCorrect;

    // NEW MECHANICS: Enemy always attacks - no more perfect blocking
    // Performance-based damage scaling:
    // - 90%+ correct: enemy deals 30% damage (strong defense)
    // - 75%+ correct: enemy deals 50% damage (passing defense)
    // - Below 75%: enemy deals full damage + 15% per wrong answer
    let damageMultiplier = 1.0;

    await this.showMessage(`${enemy.name} used ${enemyMove.name}!`, 1500);

    if (currentScore >= 90) {
      damageMultiplier = 0.3; // Strong performance = 30% damage
      await this.showMessage(`Your strong defenses reduce the impact!`, 1000);
    } else if (currentScore >= this.options.passingScore) {
      damageMultiplier = 0.5; // Passing = 50% damage
    } else {
      // Below passing - full damage plus penalty
      damageMultiplier = 1.0 + (wrongAnswers * 0.15);
      if (wrongAnswers > 2) {
        await this.showMessage(`Your weak defenses make the attack more effective!`, 1000);
      }
    }

    if (enemyMove.power > 0) {
      const baseDamage = calculateDamage(enemy, player, enemyMove, true);
      const damage = Math.floor(baseDamage * damageMultiplier);

      // Play attack animation
      await this.animateAttack('enemy-sprite', 'player-sprite');

      // Apply damage (but don't kill if score is passing - leave at 1 HP)
      let newHp = player.currentHp - damage;

      // Protection: if player is at passing score or above, can't be killed
      if (currentScore >= this.options.passingScore && newHp <= 0) {
        newHp = 1; // Leave at 1 HP - player is doing well enough to survive
      }

      player.currentHp = Math.max(0, newHp);
      await this.animateHpDrain('player-hp', this.getHpPercent(player));

      // Update actual team state
      stateManager.updateTeamMember(this.playerCurrent, { currentHp: player.currentHp });

      // Check if player fainted (only possible if below passing score)
      if (player.currentHp <= 0) {
        await this.handlePlayerFaint();
        return;
      }
    }

    // Check if we've reached the question limit
    if (this.questionsAsked >= this.options.questionsPerBattle) {
      if (currentScore >= this.options.passingScore) {
        // Victory! Player passed with enough questions
        await this.handleVictory();
        return;
      } else {
        // Defeat - didn't meet passing score after all questions
        await this.showMessage(`Your final score is ${currentScore}% - below the ${this.options.passingScore}% required!`, 2500);
        await this.handleDefeat();
        return;
      }
    }

    // Check score - if under passing for too long, team wipe
    if (this.questionsAsked >= this.options.questionsPerBattle && this.getScore() < this.options.passingScore) {
      await this.checkTeamWipe();
      if (this.state === BATTLE_STATE.DEFEAT) return;
    }

    // Back to player turn
    this.startPlayerTurn();
  }

  /**
   * Handle enemy fainting
   */
  async handleEnemyFaint() {
    const enemy = this.enemyTeam[this.enemyCurrent];
    await this.showMessage(`${enemy.name} fainted!`, 2000);
    await this.animateFaint('enemy-sprite');

    // Check for more enemies
    this.enemyCurrent++;
    if (this.enemyCurrent < this.enemyTeam.length) {
      const nextEnemy = this.enemyTeam[this.enemyCurrent];
      await this.showMessage(`${this.options.gymLeader?.name || 'Enemy'} sent out ${nextEnemy.name}!`, 2000);

      // Update UI
      this.updateEnemyDisplay();
      await this.animateAppear('enemy-sprite');

      this.startPlayerTurn();
    } else {
      // Victory!
      await this.handleVictory();
    }
  }

  /**
   * Handle player fainting
   */
  async handlePlayerFaint() {
    const player = this.playerTeam[this.playerCurrent];
    await this.showMessage(`${player.name} fainted!`, 2000);
    await this.animateFaint('player-sprite');

    // Check for more SCADAmon
    const remaining = this.playerTeam.filter((m, i) => i > this.playerCurrent && m.currentHp > 0);

    if (remaining.length > 0) {
      // Switch to next available
      for (let i = this.playerCurrent + 1; i < this.playerTeam.length; i++) {
        if (this.playerTeam[i].currentHp > 0) {
          this.playerCurrent = i;
          break;
        }
      }

      const nextPlayer = this.playerTeam[this.playerCurrent];
      await this.showMessage(`Go! ${nextPlayer.name}!`, 2000);

      this.updatePlayerDisplay();
      await this.animateAppear('player-sprite');

      this.startPlayerTurn();
    } else {
      // All fainted
      await this.handleDefeat();
    }
  }

  /**
   * Check if score is too low (team wipe condition)
   */
  async checkTeamWipe() {
    const score = this.getScore();
    // Only wipe if below passing score AND have answered all questions
    if (score < this.options.passingScore && this.questionsAsked >= this.options.questionsPerBattle) {
      await this.showMessage(`Your score is ${score}% - below the ${this.options.passingScore}% required!`, 2000);
      await this.showMessage('All your SCADAmon are overwhelmed by the enemy!', 2000);

      // Wipe all HP
      for (const mon of this.playerTeam) {
        mon.currentHp = 0;
        stateManager.updateTeamMember(this.playerTeam.indexOf(mon), { currentHp: 0 });
      }

      await this.handleDefeat();
    }
  }

  /**
   * Handle victory
   */
  async handleVictory() {
    this.state = BATTLE_STATE.VICTORY;

    const score = this.getScore();

    await this.showMessage('You defeated all opponents!', 2000);

    if (this.options.gymLeader) {
      await this.showMessage(`${this.options.gymLeader.name}: "${this.options.gymLeader.defeatMessage}"`, 3000);
      await this.showMessage(`You earned the ${this.options.gymLeader.badge}!`, 3000);
    }

    // Show final score
    await this.showMessage(`Final Score: ${score}%`, 2000);

    // Call completion handler
    this.options.onComplete({
      victory: true,
      score: score,
      questionsAsked: this.questionsAsked,
      questionsCorrect: this.questionsCorrect,
      badge: this.options.gymLeader?.badge
    });
  }

  /**
   * Handle defeat
   */
  async handleDefeat() {
    this.state = BATTLE_STATE.DEFEAT;

    const score = this.getScore();

    await this.showMessage('All your SCADAmon have fainted!', 2000);
    await this.showMessage(`Final Score: ${score}%`, 2000);
    await this.showMessage('Review the material and try again!', 2500);

    // Call completion handler
    this.options.onComplete({
      victory: false,
      score: score,
      questionsAsked: this.questionsAsked,
      questionsCorrect: this.questionsCorrect
    });
  }

  /**
   * Update enemy display
   */
  updateEnemyDisplay() {
    const enemy = this.enemyTeam[this.enemyCurrent];
    const infoBox = this.container.querySelector('.enemy-info');
    const sprite = document.getElementById('enemy-sprite');

    if (infoBox && enemy) {
      infoBox.querySelector('.battle-name').textContent = enemy.name;
      infoBox.querySelector('.battle-level').textContent = `Lv. ${enemy.level}`;
      infoBox.querySelector('.enemy-hp').style.width = `${this.getHpPercent(enemy)}%`;
      infoBox.querySelector('.battle-types').innerHTML =
        enemy.types.map(t => `<span class="type-badge" style="background: ${TYPE_COLORS[t]}">${t}</span>`).join('');
    }

    if (sprite) {
      sprite.querySelector('.sprite-placeholder').textContent = enemy.emoji;
    }
  }

  /**
   * Update player display
   */
  updatePlayerDisplay() {
    const player = this.playerTeam[this.playerCurrent];
    const infoBox = this.container.querySelector('.player-info');
    const sprite = document.getElementById('player-sprite');
    const movesGrid = document.getElementById('moves-grid');

    if (infoBox && player) {
      infoBox.querySelector('.battle-name').textContent = player.name;
      infoBox.querySelector('.battle-level').textContent = `Lv. ${player.level}`;
      infoBox.querySelector('.player-hp').style.width = `${this.getHpPercent(player)}%`;
      infoBox.querySelector('.battle-hp-text').textContent = `${player.currentHp} / ${player.maxHp}`;
      infoBox.querySelector('.battle-types').innerHTML =
        player.types.map(t => `<span class="type-badge" style="background: ${TYPE_COLORS[t]}">${t}</span>`).join('');
    }

    if (sprite) {
      sprite.querySelector('.sprite-placeholder').textContent = player.emoji;
    }

    if (movesGrid) {
      movesGrid.innerHTML = this.renderMoves(player);
    }
  }

  /**
   * Update stats display
   */
  updateStats() {
    const questionsEl = document.getElementById('stat-questions');
    const scoreEl = document.getElementById('stat-score');

    if (questionsEl) {
      questionsEl.textContent = `${this.questionsCorrect}/${this.questionsAsked}`;
    }

    if (scoreEl) {
      const score = this.getScore();
      scoreEl.textContent = `${score}%`;
      scoreEl.className = 'stat-value ' + (score >= this.options.passingScore ? 'passing' : 'failing');
    }
  }

  // ========================================
  // Animation Methods
  // ========================================

  /**
   * Show a panel
   */
  showPanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.style.display = 'block';
      panel.classList.add('fade-in');
    }
  }

  /**
   * Hide a panel
   */
  hidePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.style.display = 'none';
      panel.classList.remove('fade-in');
    }
  }

  /**
   * Wait for specified ms
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Animate sprite appearing
   */
  async animateAppear(spriteId) {
    const sprite = document.getElementById(spriteId);
    if (!sprite) return;

    sprite.style.opacity = '0';
    sprite.style.transform = 'scale(0.5)';
    sprite.style.transition = `all ${this.animSpeeds.fade}ms ease-out`;

    await this.wait(50);

    sprite.style.opacity = '1';
    sprite.style.transform = 'scale(1)';

    await this.wait(this.animSpeeds.fade);
  }

  /**
   * Animate attack
   */
  async animateAttack(attackerId, targetId) {
    const attacker = document.getElementById(attackerId);
    const target = document.getElementById(targetId);

    if (!attacker || !target) return;

    // Attacker lunges forward
    const isPlayer = attackerId.includes('player');
    const lungeX = isPlayer ? '50px' : '-50px';

    attacker.style.transition = `transform ${this.animSpeeds.attack / 4}ms ease-out`;
    attacker.style.transform = `translateX(${lungeX})`;

    await this.wait(this.animSpeeds.attack / 4);

    // Return and target shakes
    attacker.style.transform = 'translateX(0)';

    // Shake target
    await this.animateShake(targetId);
  }

  /**
   * Animate shake effect
   */
  async animateShake(spriteId) {
    const sprite = document.getElementById(spriteId);
    if (!sprite) return;

    const shakeFrames = [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(0)' }
    ];

    sprite.animate(shakeFrames, {
      duration: this.animSpeeds.shake,
      easing: 'ease-in-out'
    });

    await this.wait(this.animSpeeds.shake);
  }

  /**
   * Animate HP drain
   */
  async animateHpDrain(hpBarClass, targetPercent) {
    const hpBar = this.container.querySelector(`.${hpBarClass}`);
    if (!hpBar) return;

    hpBar.style.transition = `width ${this.animSpeeds.hpDrain}ms ease-out`;
    hpBar.style.width = `${targetPercent}%`;

    // Update color based on HP
    if (targetPercent <= 20) {
      hpBar.style.background = 'var(--danger, #FF1C1C)';
    } else if (targetPercent <= 50) {
      hpBar.style.background = 'var(--warning, #F8D030)';
    } else {
      hpBar.style.background = 'var(--success, #78C850)';
    }

    await this.wait(this.animSpeeds.hpDrain);

    // Update HP text for player
    if (hpBarClass === 'player-hp') {
      const player = this.playerTeam[this.playerCurrent];
      const hpText = this.container.querySelector('.battle-hp-text');
      if (hpText) {
        hpText.textContent = `${player.currentHp} / ${player.maxHp}`;
      }
    }
  }

  /**
   * Animate faint
   */
  async animateFaint(spriteId) {
    const sprite = document.getElementById(spriteId);
    if (!sprite) return;

    sprite.style.transition = `all ${this.animSpeeds.fade}ms ease-in`;
    sprite.style.opacity = '0';
    sprite.style.transform = 'translateY(50px)';

    await this.wait(this.animSpeeds.fade);
  }
}

// Export
export default BattleEngine;
window.BattleEngine = BattleEngine;
