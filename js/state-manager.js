/**
 * SCADAmon State Manager
 * Handles game state persistence via cmi5/xAPI
 * Maintains player progress, team, and course completion
 */

import { STARTERS, WILD_SCADAMON, LEVEL_PROGRESSION, XP_BONUSES, getScadamonByName, getMoveById } from './scadamon-data.js';

// State keys for xAPI state API
const STATE_KEYS = {
  GAME_STATE: 'scadamon.gameState',
  PLAYER_TEAM: 'scadamon.playerTeam',
  PROGRESS: 'scadamon.progress',
  SETTINGS: 'scadamon.settings'
};

class StateManager {
  constructor() {
    this.state = null;
    this.initialized = false;
    this.saveDebounceTimer = null;
    this.saveDebounceMs = 1000; // Debounce saves to avoid hammering LRS
  }

  /**
   * Initialize state manager and load existing state
   */
  async initialize() {
    // Wait for cmi5 to be ready
    if (!window.cmi5?.initialized) {
      await new Promise(resolve => {
        const checkCmi5 = setInterval(() => {
          if (window.cmi5?.initialized) {
            clearInterval(checkCmi5);
            resolve();
          }
        }, 100);
      });
    }

    // Load existing state or create new
    await this.loadState();
    this.initialized = true;

    console.log('StateManager initialized:', this.state);
    return this.state;
  }

  /**
   * Load state from LRS/localStorage
   */
  async loadState() {
    try {
      const savedState = await window.cmi5.getState(STATE_KEYS.GAME_STATE);

      if (savedState && savedState.version) {
        this.state = this.migrateState(savedState);
        console.log('Loaded existing game state');
      } else {
        this.state = this.createNewState();
        console.log('Created new game state');
      }
    } catch (error) {
      console.error('Error loading state:', error);
      this.state = this.createNewState();
    }

    return this.state;
  }

  /**
   * Create a fresh game state
   */
  createNewState() {
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Player info
      player: {
        name: 'Trainer',
        startedAt: null,
        starterChoice: null
      },

      // Team of up to 6 SCADAmon
      team: [],

      // Course progress
      progress: {
        currentSection: 'intro', // intro, module1, gym1, catch1, module2, etc.
        completedModules: [],
        completedGyms: [],
        completedCatchPhases: [], // Track which catch phases are done
        badges: [],
        eliteFourDefeated: [],
        rivalDefeated: false,
        isChampion: false
      },

      // Quiz/battle stats per module
      moduleStats: {},

      // Caught SCADAmon storage (PC box equivalent)
      storage: [],

      // Settings
      settings: {
        soundEnabled: true,
        animationSpeed: 'normal', // slow, normal, fast
        textSpeed: 'normal'
      }
    };
  }

  /**
   * Migrate old state versions to current
   */
  migrateState(oldState) {
    let state = { ...oldState };

    // Add any missing fields from newer versions
    if (!state.moduleStats) state.moduleStats = {};
    if (!state.storage) state.storage = [];
    if (!state.settings) {
      state.settings = {
        soundEnabled: true,
        animationSpeed: 'normal',
        textSpeed: 'normal'
      };
    }

    state.updatedAt = new Date().toISOString();
    return state;
  }

  /**
   * Save state to LRS (debounced)
   */
  async saveState() {
    if (!this.initialized) return false;

    // Debounce saves
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    return new Promise((resolve) => {
      this.saveDebounceTimer = setTimeout(async () => {
        try {
          this.state.updatedAt = new Date().toISOString();
          const success = await window.cmi5.saveState(STATE_KEYS.GAME_STATE, this.state);
          console.log('State saved:', success);
          resolve(success);
        } catch (error) {
          console.error('Error saving state:', error);
          resolve(false);
        }
      }, this.saveDebounceMs);
    });
  }

  /**
   * Force immediate save (use sparingly)
   */
  async forceSave() {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    try {
      this.state.updatedAt = new Date().toISOString();
      return await window.cmi5.saveState(STATE_KEYS.GAME_STATE, this.state);
    } catch (error) {
      console.error('Error force saving state:', error);
      return false;
    }
  }

  // ========================================
  // Player Methods
  // ========================================

  /**
   * Set player name
   */
  setPlayerName(name) {
    this.state.player.name = name;
    this.saveState();
  }

  /**
   * Get player name
   */
  getPlayerName() {
    return this.state.player.name;
  }

  /**
   * Check if player has started the game
   */
  hasStarted() {
    return this.state.player.startedAt !== null;
  }

  /**
   * Reset game state for new game
   */
  async resetGame() {
    this.state = this.createNewState();
    await this.forceSave();
    console.log('Game state reset');
    return this.state;
  }

  /**
   * Start new game with chosen starter
   */
  async startGame(starterName) {
    const starter = STARTERS.find(s => s.name === starterName);
    if (!starter) {
      throw new Error(`Invalid starter: ${starterName}`);
    }

    this.state.player.startedAt = new Date().toISOString();
    this.state.player.starterChoice = starterName;

    // Create starter SCADAmon instance
    const starterInstance = this.createScadamonInstance(starter, 5);
    this.state.team = [starterInstance];

    this.state.progress.currentSection = 'module1';

    await this.forceSave();

    // Report to LRS
    await window.cmi5.sendStatement({
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/initialized',
        display: { 'en-US': 'started game' }
      },
      result: {
        extensions: {
          'https://scadamon.training/xapi/extensions/starter': starterName
        }
      }
    });

    return starterInstance;
  }

  // ========================================
  // Team Methods
  // ========================================

  /**
   * Create a SCADAmon instance from definition
   */
  createScadamonInstance(definition, level) {
    // Calculate stats based on level
    const stats = this.calculateStats(definition.baseStats, level);

    // Get moves available at this level
    const moves = this.getMovesForLevel(definition, level);

    return {
      id: this.generateId(),
      definitionId: definition.id,
      name: definition.name,
      types: [...definition.types],
      level: level,
      currentHp: stats.hp,
      maxHp: stats.hp,
      stats: stats,
      moves: moves,
      exp: this.getExpForLevel(level),
      emoji: definition.emoji
    };
  }

  /**
   * Calculate stats for a given base stats and level
   */
  calculateStats(baseStats, level) {
    const statCalc = (base) => Math.floor(((2 * base) * level / 100) + level + 10);
    const hpCalc = (base) => Math.floor(((2 * base) * level / 100) + level + 10 + level);

    return {
      hp: hpCalc(baseStats.hp),
      atk: statCalc(baseStats.atk),
      def: statCalc(baseStats.def),
      spd: statCalc(baseStats.spd),
      int: statCalc(baseStats.int),
      res: statCalc(baseStats.res)
    };
  }

  /**
   * Get moves available at a given level
   */
  getMovesForLevel(definition, level) {
    const availableMoves = [];

    for (const [lvl, moveIds] of Object.entries(definition.moves)) {
      if (parseInt(lvl) <= level) {
        availableMoves.push(...moveIds);
      }
    }

    // Return last 4 moves (most recent learned)
    return availableMoves.slice(-4);
  }

  /**
   * Get exp required for a level
   */
  getExpForLevel(level) {
    // Simple cubic formula
    return Math.floor(Math.pow(level, 3));
  }

  /**
   * Get player's current team
   */
  getTeam() {
    return this.state.team;
  }

  /**
   * Add SCADAmon to team (max 6) or storage
   */
  addToTeam(scadamon) {
    if (this.state.team.length < 6) {
      this.state.team.push(scadamon);
    } else {
      this.state.storage.push(scadamon);
    }
    this.saveState();
  }

  /**
   * Remove SCADAmon from team by index
   */
  removeFromTeam(index) {
    if (this.state.team.length > 1 && index >= 0 && index < this.state.team.length) {
      const removed = this.state.team.splice(index, 1)[0];
      this.state.storage.push(removed);
      this.saveState();
      return removed;
    }
    return null;
  }

  /**
   * Swap team member with storage
   */
  swapTeamMember(teamIndex, storageIndex) {
    if (teamIndex >= 0 && teamIndex < this.state.team.length &&
        storageIndex >= 0 && storageIndex < this.state.storage.length) {
      const temp = this.state.team[teamIndex];
      this.state.team[teamIndex] = this.state.storage[storageIndex];
      this.state.storage[storageIndex] = temp;
      this.saveState();
      return true;
    }
    return false;
  }

  /**
   * Heal all team members
   */
  async healTeam() {
    for (const mon of this.state.team) {
      mon.currentHp = mon.maxHp;
      console.log(`[StateManager] Healed ${mon.name} to ${mon.currentHp}/${mon.maxHp}`);
    }
    await this.forceSave();
  }

  /**
   * Update team after battle
   */
  updateTeamMember(index, updates) {
    if (index >= 0 && index < this.state.team.length) {
      Object.assign(this.state.team[index], updates);
      this.saveState();
    }
  }

  /**
   * Level up team based on gym completion
   */
  levelUpTeam(gymNumber, quizScore) {
    const progression = LEVEL_PROGRESSION[gymNumber];
    if (!progression) return;

    // Determine XP bonus
    let xpMultiplier = 1.0;
    for (const [key, bonus] of Object.entries(XP_BONUSES)) {
      if (quizScore >= bonus.min && quizScore <= bonus.max) {
        xpMultiplier = bonus.multiplier;
        break;
      }
    }

    // Level up each team member
    for (const mon of this.state.team) {
      const targetLevel = Math.min(
        progression.maxLevel,
        mon.level + Math.floor((progression.maxLevel - mon.level) * 0.5 * xpMultiplier)
      );

      if (targetLevel > mon.level) {
        this.levelUpScadamon(mon, targetLevel);
      }
    }

    this.saveState();
  }

  /**
   * Level up a specific SCADAmon
   */
  levelUpScadamon(scadamon, newLevel) {
    const definition = getScadamonByName(scadamon.name);
    if (!definition) return;

    scadamon.level = newLevel;
    scadamon.stats = this.calculateStats(definition.baseStats, newLevel);
    scadamon.maxHp = scadamon.stats.hp;
    scadamon.currentHp = scadamon.maxHp; // Full heal on level up
    scadamon.exp = this.getExpForLevel(newLevel);

    // Check for new moves
    const newMoves = this.getMovesForLevel(definition, newLevel);
    scadamon.moves = newMoves;
  }

  // ========================================
  // Progress Methods
  // ========================================

  /**
   * Get current section
   */
  getCurrentSection() {
    return this.state.progress.currentSection;
  }

  /**
   * Set current section
   */
  setCurrentSection(section) {
    this.state.progress.currentSection = section;
    this.saveState();
  }

  /**
   * Check if module is completed
   */
  isModuleCompleted(moduleId) {
    return this.state.progress.completedModules.includes(moduleId);
  }

  /**
   * Complete a module
   */
  async completeModule(moduleId, score) {
    if (!this.state.progress.completedModules.includes(moduleId)) {
      this.state.progress.completedModules.push(moduleId);
    }

    // Store stats
    this.state.moduleStats[moduleId] = {
      score: score,
      completedAt: new Date().toISOString(),
      attempts: (this.state.moduleStats[moduleId]?.attempts || 0) + 1
    };

    await this.forceSave();

    // Report to LRS
    await window.cmi5.progressed(
      (this.state.progress.completedModules.length / 8) * 100
    );
  }

  /**
   * Check if gym is completed
   */
  isGymCompleted(gymId) {
    return this.state.progress.completedGyms.includes(gymId);
  }

  /**
   * Complete a gym battle
   */
  async completeGym(gymId, badge, score) {
    if (!this.state.progress.completedGyms.includes(gymId)) {
      this.state.progress.completedGyms.push(gymId);
    }

    if (!this.state.progress.badges.includes(badge)) {
      this.state.progress.badges.push(badge);
    }

    // Level up team
    this.levelUpTeam(gymId, score);

    // Set next section
    const nextGymId = gymId + 1;
    if (nextGymId <= 8) {
      this.state.progress.currentSection = `catch${gymId}`;
    } else {
      this.state.progress.currentSection = 'elite4';
    }

    await this.forceSave();

    // Report badge earned
    await window.cmi5.sendStatement({
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/earned',
        display: { 'en-US': 'earned' }
      },
      object: {
        id: `https://scadamon.training/badges/${badge.replace(/\s+/g, '-').toLowerCase()}`,
        definition: {
          name: { 'en-US': badge },
          type: 'https://scadamon.training/xapi/badge'
        }
      },
      result: {
        score: { raw: score, max: 100, scaled: score / 100 }
      }
    });

    return { badge, score };
  }

  /**
   * Get completed gyms count
   */
  getCompletedGymsCount() {
    return this.state.progress.completedGyms.length;
  }

  /**
   * Get badges
   */
  getBadges() {
    return this.state.progress.badges;
  }

  /**
   * Complete catch phase
   */
  completeCatchPhase(gymId) {
    if (!this.state.progress.completedCatchPhases) {
      this.state.progress.completedCatchPhases = [];
    }
    if (!this.state.progress.completedCatchPhases.includes(gymId)) {
      this.state.progress.completedCatchPhases.push(gymId);
    }
    this.state.progress.currentSection = `module${gymId + 1}`;
    this.saveState();
  }

  /**
   * Check if catch phase is complete
   */
  isCatchPhaseComplete(gymId) {
    return this.state.progress.completedCatchPhases?.includes(gymId) || false;
  }

  /**
   * Defeat Elite 4 member
   */
  async defeatEliteFour(memberId) {
    if (!this.state.progress.eliteFourDefeated.includes(memberId)) {
      this.state.progress.eliteFourDefeated.push(memberId);
    }

    await this.forceSave();
  }

  /**
   * Check if all Elite 4 defeated
   */
  isEliteFourComplete() {
    return this.state.progress.eliteFourDefeated.length >= 4;
  }

  /**
   * Defeat rival and become champion
   */
  async defeatRival() {
    this.state.progress.rivalDefeated = true;
    this.state.progress.isChampion = true;

    await this.forceSave();

    // Report course completion
    await window.cmi5.completed(100, true);
    await window.cmi5.passed(100);

    return true;
  }

  /**
   * Check if player is champion
   */
  isChampion() {
    return this.state.progress.isChampion;
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Generate unique ID
   */
  generateId() {
    return 'scadamon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get full state (for debugging)
   */
  getFullState() {
    return this.state;
  }

  /**
   * Reset game (dangerous!)
   */
  async resetGame() {
    this.state = this.createNewState();
    await this.forceSave();
    console.log('Game reset');
  }
}

// Create singleton instance
const stateManager = new StateManager();

// Export for use in other modules
export default stateManager;

// Also attach to window for non-module scripts
window.stateManager = stateManager;
