/**
 * SCADAmon Game Data
 * Contains all SCADAmon definitions, moves, types, and game constants
 */

// Type effectiveness chart
export const TYPE_CHART = {
  ELECTRIC: { strongAgainst: ['WATER'], weakAgainst: ['GROUND'], immuneTo: [] },
  WATER: { strongAgainst: ['FIRE'], weakAgainst: ['ELECTRIC'], immuneTo: [] },
  FIRE: { strongAgainst: ['STEEL', 'ICE'], weakAgainst: ['WATER'], immuneTo: [] },
  STEEL: { strongAgainst: ['ICE', 'POISON'], weakAgainst: ['FIRE', 'GROUND'], immuneTo: ['POISON'] },
  POISON: { strongAgainst: ['WATER'], weakAgainst: ['STEEL', 'GROUND'], immuneTo: [] },
  GHOST: { strongAgainst: ['GHOST', 'NORMAL'], weakAgainst: ['DARK'], immuneTo: ['NORMAL'] },
  GROUND: { strongAgainst: ['ELECTRIC', 'STEEL', 'FIRE'], weakAgainst: ['WATER', 'ICE'], immuneTo: ['ELECTRIC'] },
  ICE: { strongAgainst: ['GROUND', 'FIRE'], weakAgainst: ['FIRE', 'STEEL'], immuneTo: [] },
  NORMAL: { strongAgainst: [], weakAgainst: [], immuneTo: ['GHOST'] },
  DARK: { strongAgainst: ['GHOST'], weakAgainst: [], immuneTo: [] }
};

// Type colors for UI
export const TYPE_COLORS = {
  ELECTRIC: '#F8D030',
  WATER: '#6890F0',
  FIRE: '#F08030',
  STEEL: '#B8B8D0',
  POISON: '#9932CC',
  GHOST: '#705898',
  GROUND: '#E0C068',
  ICE: '#98D8D8',
  NORMAL: '#A8A878',
  DARK: '#705848'
};

// Domain to module mapping
export const DOMAIN_MODULES = {
  ics_basics: 1,
  architecture: 2,
  protocols: 3,
  windows: 4,
  unix: 5,
  governance: 6,
  response: 7,
  synthesis: 8,
  general: 0, // Can be used in any module
  threats: 0  // Enemy-only moves
};

// All moves in the game
export const MOVES = {
  // Basic moves (available early)
  SPARK: {
    id: 'SPARK',
    name: 'SPARK',
    type: 'ELECTRIC',
    power: 25,
    accuracy: 100,
    domain: 'ics_basics',
    description: 'A small electrical discharge. Basic but reliable.',
    emoji: '⚡'
  },
  BASELINE_CHECK: {
    id: 'BASELINE_CHECK',
    name: 'BASELINE CHECK',
    type: 'NORMAL',
    power: 20,
    accuracy: 100,
    domain: 'general',
    description: 'A basic security assessment. Establishes normal behavior.',
    emoji: '📋'
  },
  WATER_PULSE: {
    id: 'WATER_PULSE',
    name: 'WATER PULSE',
    type: 'WATER',
    power: 30,
    accuracy: 100,
    domain: 'protocols',
    description: 'A pulse of data flowing through the network.',
    emoji: '💧'
  },
  EMBER: {
    id: 'EMBER',
    name: 'EMBER',
    type: 'FIRE',
    power: 25,
    accuracy: 100,
    domain: 'ics_basics',
    description: 'A small flame attack. Basic process monitoring.',
    emoji: '🔥'
  },

  // Mid-level moves
  PROTOCOL_SCAN: {
    id: 'PROTOCOL_SCAN',
    name: 'PROTOCOL SCAN',
    type: 'WATER',
    power: 30,
    accuracy: 95,
    domain: 'protocols',
    description: 'Analyzes network protocols for vulnerabilities.',
    emoji: '🔍'
  },
  SURGE_PROTECT: {
    id: 'SURGE_PROTECT',
    name: 'SURGE PROTECT',
    type: 'ELECTRIC',
    power: 0,
    accuracy: 100,
    domain: 'ics_basics',
    description: 'Raises DEF by absorbing excess energy.',
    effect: { stat: 'def', stages: 1 },
    emoji: '🛡️'
  },
  NETWORK_SEGMENT: {
    id: 'NETWORK_SEGMENT',
    name: 'NETWORK SEGMENT',
    type: 'GROUND',
    power: 45,
    accuracy: 90,
    domain: 'architecture',
    description: 'Isolates the target in a segmented network zone.',
    emoji: '🔲'
  },
  FIREWALL_BLOCK: {
    id: 'FIREWALL_BLOCK',
    name: 'FIREWALL BLOCK',
    type: 'GROUND',
    power: 40,
    accuracy: 95,
    domain: 'architecture',
    description: 'Blocks unauthorized traffic with strict rules.',
    emoji: '🧱'
  },
  ENCRYPTION_SHIELD: {
    id: 'ENCRYPTION_SHIELD',
    name: 'ENCRYPTION SHIELD',
    type: 'STEEL',
    power: 0,
    accuracy: 100,
    domain: 'protocols',
    description: 'Wraps in encrypted protection.',
    effect: { stat: 'res', stages: 2 },
    emoji: '🔐'
  },
  PATCH_DEPLOY: {
    id: 'PATCH_DEPLOY',
    name: 'PATCH DEPLOY',
    type: 'STEEL',
    power: 35,
    accuracy: 100,
    domain: 'windows',
    description: 'Applies security patches to fix vulnerabilities.',
    emoji: '🩹'
  },
  INCIDENT_DETECT: {
    id: 'INCIDENT_DETECT',
    name: 'INCIDENT DETECT',
    type: 'DARK',
    power: 50,
    accuracy: 85,
    domain: 'response',
    description: 'Identifies and responds to security incidents.',
    emoji: '🚨'
  },
  RISK_ASSESS: {
    id: 'RISK_ASSESS',
    name: 'RISK ASSESS',
    type: 'NORMAL',
    power: 40,
    accuracy: 100,
    domain: 'governance',
    description: 'Evaluates and prioritizes threats systematically.',
    emoji: '📊'
  },
  ROOT_GUARD: {
    id: 'ROOT_GUARD',
    name: 'ROOT GUARD',
    type: 'DARK',
    power: 55,
    accuracy: 90,
    domain: 'unix',
    description: 'Restricts root access and monitors privileged actions.',
    emoji: '🔒'
  },
  AD_LOCKDOWN: {
    id: 'AD_LOCKDOWN',
    name: 'AD LOCKDOWN',
    type: 'ICE',
    power: 60,
    accuracy: 85,
    domain: 'windows',
    description: 'Hardens Active Directory against common attacks.',
    emoji: '❄️'
  },

  // Advanced moves
  MODBUS_SURGE: {
    id: 'MODBUS_SURGE',
    name: 'MODBUS SURGE',
    type: 'WATER',
    power: 50,
    accuracy: 95,
    domain: 'protocols',
    description: 'Floods target with Modbus commands.',
    emoji: '🌊'
  },
  DNP3_STRIKE: {
    id: 'DNP3_STRIKE',
    name: 'DNP3 STRIKE',
    type: 'WATER',
    power: 55,
    accuracy: 90,
    domain: 'protocols',
    description: 'Exploits DNP3 protocol weaknesses.',
    emoji: '⚔️'
  },
  GRID_SURGE: {
    id: 'GRID_SURGE',
    name: 'GRID SURGE',
    type: 'ELECTRIC',
    power: 65,
    accuracy: 85,
    domain: 'ics_basics',
    description: 'Powerful grid-wide electrical attack.',
    emoji: '⚡'
  },
  DEFENSE_IN_DEPTH: {
    id: 'DEFENSE_IN_DEPTH',
    name: 'DEFENSE IN DEPTH',
    type: 'GROUND',
    power: 0,
    accuracy: 100,
    domain: 'architecture',
    description: 'Layers multiple defenses.',
    effect: { stat: 'def', stages: 1, stat2: 'res', stages2: 1 },
    emoji: '🏰'
  },
  ZERO_TRUST: {
    id: 'ZERO_TRUST',
    name: 'ZERO TRUST',
    type: 'STEEL',
    power: 70,
    accuracy: 80,
    domain: 'architecture',
    description: 'Never trust, always verify. Powerful but requires setup.',
    emoji: '🔏'
  },
  FORENSIC_SCAN: {
    id: 'FORENSIC_SCAN',
    name: 'FORENSIC SCAN',
    type: 'DARK',
    power: 60,
    accuracy: 90,
    domain: 'response',
    description: 'Deep investigation revealing hidden threats.',
    emoji: '🔬'
  },
  COMPLIANCE_AUDIT: {
    id: 'COMPLIANCE_AUDIT',
    name: 'COMPLIANCE AUDIT',
    type: 'NORMAL',
    power: 55,
    accuracy: 100,
    domain: 'governance',
    description: 'Checks adherence to security frameworks.',
    emoji: '📝'
  },

  // Enemy-only moves
  MALWARE_INJECT: {
    id: 'MALWARE_INJECT',
    name: 'MALWARE INJECT',
    type: 'POISON',
    power: 60,
    accuracy: 90,
    domain: 'threats',
    description: 'Injects malicious code.',
    enemyOnly: true,
    emoji: '💉'
  },
  LATERAL_MOVE: {
    id: 'LATERAL_MOVE',
    name: 'LATERAL MOVE',
    type: 'GHOST',
    power: 55,
    accuracy: 95,
    domain: 'threats',
    description: 'Moves through network boundaries.',
    enemyOnly: true,
    emoji: '👻'
  },
  RANSOMWARE_LOCK: {
    id: 'RANSOMWARE_LOCK',
    name: 'RANSOMWARE LOCK',
    type: 'DARK',
    power: 80,
    accuracy: 75,
    domain: 'threats',
    description: 'Encrypts and locks target systems.',
    enemyOnly: true,
    emoji: '🔓'
  },
  PHISHING_LURE: {
    id: 'PHISHING_LURE',
    name: 'PHISHING LURE',
    type: 'GHOST',
    power: 45,
    accuracy: 85,
    domain: 'threats',
    description: 'Tricks targets into revealing information.',
    enemyOnly: true,
    emoji: '🎣'
  },
  DATA_EXFIL: {
    id: 'DATA_EXFIL',
    name: 'DATA EXFIL',
    type: 'DARK',
    power: 50,
    accuracy: 90,
    domain: 'threats',
    description: 'Steals and extracts sensitive data.',
    enemyOnly: true,
    emoji: '📤'
  }
};

// Starter SCADAmon
export const STARTERS = [
  {
    id: 1,
    name: 'GRIDLING',
    types: ['ELECTRIC'],
    baseStats: { hp: 45, atk: 49, def: 49, spd: 45, int: 65, res: 65 },
    description: 'A tiny spark that inhabits power distribution systems. It feeds on stable current and becomes agitated during power fluctuations.',
    lore: 'GRIDLINGs were first discovered in early SCADA systems during the 1980s. They\'re naturally drawn to well-maintained infrastructure.',
    emoji: '⚡',
    evolutionLevel: 16,
    evolvesTo: 'GRIDEON',
    moves: {
      1: ['SPARK', 'BASELINE_CHECK'],
      5: ['PROTOCOL_SCAN'],
      10: ['SURGE_PROTECT'],
      15: ['GRID_SURGE']
    }
  },
  {
    id: 4,
    name: 'PUMPLET',
    types: ['WATER'],
    baseStats: { hp: 50, atk: 46, def: 52, spd: 43, int: 60, res: 70 },
    description: 'A small water pump spirit. It happily monitors flow rates and becomes distressed when pressure drops unexpectedly.',
    lore: 'PUMPLETs are common in water treatment facilities. Operators say they chirp contentedly when turbidity levels are optimal.',
    emoji: '💧',
    evolutionLevel: 16,
    evolvesTo: 'PUMPLUX',
    moves: {
      1: ['WATER_PULSE', 'BASELINE_CHECK'],
      5: ['PROTOCOL_SCAN'],
      10: ['ENCRYPTION_SHIELD'],
      15: ['MODBUS_SURGE']
    }
  },
  {
    id: 7,
    name: 'SPARKLET',
    types: ['FIRE'],
    baseStats: { hp: 44, atk: 58, def: 44, spd: 61, int: 58, res: 48 },
    description: 'A tiny flame from refinery flare stacks. It dances when processes run smoothly and flickers when something\'s wrong.',
    lore: 'SPARKLETs are temperamental but loyal. They form strong bonds with operators who understand process safety.',
    emoji: '🔥',
    evolutionLevel: 16,
    evolvesTo: 'REFINAX',
    moves: {
      1: ['EMBER', 'BASELINE_CHECK'],
      5: ['INCIDENT_DETECT'],
      10: ['RISK_ASSESS'],
      15: ['FORENSIC_SCAN']
    }
  }
];

// Wild SCADAmon (catchable between gyms)
export const WILD_SCADAMON = [
  {
    id: 10,
    name: 'SENSORB',
    types: ['ELECTRIC'],
    baseStats: { hp: 35, atk: 40, def: 30, spd: 55, int: 60, res: 45 },
    description: 'A floating sensor orb that monitors everything around it.',
    emoji: '🔮',
    rarity: 'common',
    availableAfterGym: 1,
    moves: {
      1: ['SPARK', 'BASELINE_CHECK'],
      10: ['PROTOCOL_SCAN'],
      20: ['SURGE_PROTECT']
    }
  },
  {
    id: 12,
    name: 'ACTUMON',
    types: ['ELECTRIC', 'STEEL'],
    baseStats: { hp: 50, atk: 55, def: 60, spd: 30, int: 40, res: 55 },
    description: 'A sturdy actuator creature. It faithfully executes commands.',
    emoji: '🤖',
    rarity: 'common',
    availableAfterGym: 1,
    moves: {
      1: ['SPARK', 'PATCH_DEPLOY'],
      10: ['FIREWALL_BLOCK'],
      20: ['ZERO_TRUST']
    }
  },
  {
    id: 15,
    name: 'HMINDER',
    types: ['NORMAL', 'ELECTRIC'],
    baseStats: { hp: 60, atk: 45, def: 50, spd: 55, int: 65, res: 55 },
    description: 'A Human-Machine Interface spirit. It displays process data.',
    emoji: '🖥️',
    rarity: 'common',
    availableAfterGym: 1,
    moves: {
      1: ['BASELINE_CHECK', 'RISK_ASSESS'],
      10: ['COMPLIANCE_AUDIT'],
      20: ['DEFENSE_IN_DEPTH']
    }
  },
  {
    id: 13,
    name: 'PLCEE',
    types: ['ELECTRIC', 'STEEL'],
    baseStats: { hp: 55, atk: 50, def: 65, spd: 35, int: 70, res: 60 },
    description: 'The embodiment of a Programmable Logic Controller.',
    emoji: '🎛️',
    rarity: 'uncommon',
    availableAfterGym: 2,
    moves: {
      1: ['SPARK', 'NETWORK_SEGMENT'],
      15: ['FIREWALL_BLOCK'],
      25: ['ZERO_TRUST']
    }
  },
  {
    id: 20,
    name: 'FIREWOLF',
    types: ['GROUND', 'STEEL'],
    baseStats: { hp: 65, atk: 70, def: 80, spd: 45, int: 60, res: 70 },
    description: 'A fierce network firewall creature. Guards boundaries.',
    emoji: '🐺',
    rarity: 'uncommon',
    availableAfterGym: 2,
    moves: {
      1: ['FIREWALL_BLOCK', 'NETWORK_SEGMENT'],
      15: ['DEFENSE_IN_DEPTH'],
      25: ['ZERO_TRUST']
    }
  },
  {
    id: 16,
    name: 'MODBUZZ',
    types: ['WATER', 'GHOST'],
    baseStats: { hp: 45, atk: 50, def: 40, spd: 65, int: 75, res: 50 },
    description: 'A spectral Modbus protocol spirit. Passes through networks freely.',
    emoji: '👻',
    rarity: 'common',
    availableAfterGym: 3,
    moves: {
      1: ['WATER_PULSE', 'PROTOCOL_SCAN'],
      15: ['MODBUS_SURGE'],
      25: ['DNP3_STRIKE']
    }
  },
  {
    id: 17,
    name: 'DNPEEP',
    types: ['WATER'],
    baseStats: { hp: 55, atk: 55, def: 55, spd: 55, int: 70, res: 60 },
    description: 'A DNP3 protocol creature. More sophisticated than MODBUZZ.',
    emoji: '🌊',
    rarity: 'uncommon',
    availableAfterGym: 3,
    moves: {
      1: ['WATER_PULSE', 'PROTOCOL_SCAN'],
      15: ['DNP3_STRIKE'],
      30: ['ENCRYPTION_SHIELD']
    }
  },
  {
    id: 19,
    name: 'OPCURON',
    types: ['WATER', 'STEEL'],
    baseStats: { hp: 70, atk: 60, def: 75, spd: 50, int: 85, res: 80 },
    description: 'An OPC UA protocol guardian. Born secure.',
    emoji: '🛡️',
    rarity: 'rare',
    availableAfterGym: 3,
    moves: {
      1: ['WATER_PULSE', 'ENCRYPTION_SHIELD'],
      20: ['ZERO_TRUST'],
      35: ['DEFENSE_IN_DEPTH']
    }
  },

  // NEW UNCOMMON SCADAMON (6)
  {
    id: 21,
    name: 'PATCHMON',
    types: ['STEEL', 'NORMAL'],
    baseStats: { hp: 55, atk: 45, def: 65, spd: 40, int: 55, res: 60 },
    description: 'A diligent patch management creature. It constantly updates and fixes vulnerabilities.',
    emoji: '🩹',
    rarity: 'uncommon',
    availableAfterGym: 2,
    moves: {
      1: ['PATCH_DEPLOY', 'BASELINE_CHECK'],
      15: ['ENCRYPTION_SHIELD'],
      25: ['DEFENSE_IN_DEPTH']
    }
  },
  {
    id: 22,
    name: 'VLANIX',
    types: ['GROUND', 'ELECTRIC'],
    baseStats: { hp: 50, atk: 50, def: 60, spd: 55, int: 65, res: 55 },
    description: 'A VLAN boundary guardian. It segments networks with precision.',
    emoji: '🔀',
    rarity: 'uncommon',
    availableAfterGym: 2,
    moves: {
      1: ['NETWORK_SEGMENT', 'SPARK'],
      15: ['FIREWALL_BLOCK'],
      25: ['ZERO_TRUST']
    }
  },
  {
    id: 23,
    name: 'SIEMGUARD',
    types: ['STEEL', 'ELECTRIC'],
    baseStats: { hp: 60, atk: 55, def: 70, spd: 35, int: 70, res: 65 },
    description: 'A Siemens-style industrial controller guardian. Robust and reliable.',
    emoji: '🏭',
    rarity: 'uncommon',
    availableAfterGym: 3,
    moves: {
      1: ['SPARK', 'PATCH_DEPLOY'],
      15: ['GRID_SURGE'],
      25: ['DEFENSE_IN_DEPTH']
    }
  },
  {
    id: 24,
    name: 'LOGKEEPER',
    types: ['NORMAL', 'WATER'],
    baseStats: { hp: 65, atk: 40, def: 55, spd: 45, int: 75, res: 60 },
    description: 'A log aggregation spirit. It remembers everything that happens.',
    emoji: '📜',
    rarity: 'uncommon',
    availableAfterGym: 4,
    moves: {
      1: ['BASELINE_CHECK', 'PROTOCOL_SCAN'],
      15: ['INCIDENT_DETECT'],
      25: ['FORENSIC_SCAN']
    }
  },
  {
    id: 25,
    name: 'HASHLOCK',
    types: ['STEEL', 'DARK'],
    baseStats: { hp: 50, atk: 55, def: 65, spd: 50, int: 70, res: 65 },
    description: 'A cryptographic hash guardian. It ensures data integrity through checksums.',
    emoji: '🔗',
    rarity: 'uncommon',
    availableAfterGym: 4,
    moves: {
      1: ['ENCRYPTION_SHIELD', 'BASELINE_CHECK'],
      15: ['ZERO_TRUST'],
      25: ['FORENSIC_SCAN']
    }
  },
  {
    id: 26,
    name: 'CRONOS',
    types: ['GHOST', 'NORMAL'],
    baseStats: { hp: 55, atk: 50, def: 50, spd: 60, int: 65, res: 55 },
    description: 'A scheduled task spirit. It executes jobs at precise times, watching for anomalies.',
    emoji: '⏰',
    rarity: 'uncommon',
    availableAfterGym: 5,
    moves: {
      1: ['BASELINE_CHECK', 'RISK_ASSESS'],
      15: ['INCIDENT_DETECT'],
      25: ['COMPLIANCE_AUDIT']
    }
  },

  // NEW RARE SCADAMON (5)
  {
    id: 27,
    name: 'ZEROTRUST',
    types: ['STEEL', 'GHOST'],
    baseStats: { hp: 65, atk: 60, def: 75, spd: 55, int: 80, res: 75 },
    description: 'Never trust, always verify. This creature questions everything.',
    emoji: '🚫',
    rarity: 'rare',
    availableAfterGym: 5,
    moves: {
      1: ['ZERO_TRUST', 'NETWORK_SEGMENT'],
      20: ['DEFENSE_IN_DEPTH'],
      35: ['FORENSIC_SCAN']
    }
  },
  {
    id: 28,
    name: 'AIRGAPPER',
    types: ['GROUND', 'STEEL'],
    baseStats: { hp: 80, atk: 55, def: 90, spd: 25, int: 60, res: 85 },
    description: 'The ultimate isolationist. Completely disconnects systems from networks.',
    emoji: '🏝️',
    rarity: 'rare',
    availableAfterGym: 5,
    moves: {
      1: ['NETWORK_SEGMENT', 'FIREWALL_BLOCK'],
      20: ['DEFENSE_IN_DEPTH'],
      35: ['ZERO_TRUST']
    }
  },
  {
    id: 29,
    name: 'FORENSIX',
    types: ['GHOST', 'DARK'],
    baseStats: { hp: 55, atk: 65, def: 50, spd: 70, int: 90, res: 60 },
    description: 'A digital forensics master. It uncovers hidden evidence and traces attacks.',
    emoji: '🔬',
    rarity: 'rare',
    availableAfterGym: 6,
    moves: {
      1: ['FORENSIC_SCAN', 'INCIDENT_DETECT'],
      20: ['RISK_ASSESS'],
      35: ['COMPLIANCE_AUDIT']
    }
  },
  {
    id: 30,
    name: 'HONEYPOT',
    types: ['POISON', 'GHOST'],
    baseStats: { hp: 70, atk: 45, def: 55, spd: 50, int: 85, res: 70 },
    description: 'A deception specialist. It lures attackers into revealing themselves.',
    emoji: '🍯',
    rarity: 'rare',
    availableAfterGym: 6,
    moves: {
      1: ['BASELINE_CHECK', 'INCIDENT_DETECT'],
      20: ['FORENSIC_SCAN'],
      35: ['ZERO_TRUST']
    }
  },
  {
    id: 31,
    name: 'SOCMON',
    types: ['ELECTRIC', 'DARK'],
    baseStats: { hp: 65, atk: 70, def: 60, spd: 65, int: 85, res: 65 },
    description: 'Security Operations Center guardian. 24/7 vigilance personified.',
    emoji: '👁️‍🗨️',
    rarity: 'rare',
    availableAfterGym: 7,
    moves: {
      1: ['INCIDENT_DETECT', 'SPARK'],
      20: ['FORENSIC_SCAN'],
      35: ['GRID_SURGE']
    }
  },

  // NEW LEGENDARY SCADAMON (4)
  {
    id: 32,
    name: 'STUXBANE',
    types: ['ELECTRIC', 'STEEL'],
    baseStats: { hp: 80, atk: 90, def: 80, spd: 75, int: 95, res: 80 },
    description: 'Born from lessons of Stuxnet. The ultimate ICS defender against targeted attacks.',
    emoji: '⚔️',
    rarity: 'legendary',
    availableAfterGym: 8,
    moves: {
      1: ['GRID_SURGE', 'ZERO_TRUST'],
      30: ['DEFENSE_IN_DEPTH'],
      50: ['FORENSIC_SCAN']
    }
  },
  {
    id: 33,
    name: 'TRITONIX',
    types: ['FIRE', 'POISON'],
    baseStats: { hp: 85, atk: 85, def: 75, spd: 80, int: 90, res: 85 },
    description: 'Forged from the TRITON/TRISIS attack lessons. Protects safety systems.',
    emoji: '☢️',
    rarity: 'legendary',
    availableAfterGym: 8,
    moves: {
      1: ['EMBER', 'INCIDENT_DETECT'],
      30: ['FORENSIC_SCAN'],
      50: ['RISK_ASSESS']
    }
  },
  {
    id: 34,
    name: 'GRIDLORD',
    types: ['ELECTRIC', 'DARK'],
    baseStats: { hp: 90, atk: 80, def: 85, spd: 70, int: 100, res: 90 },
    description: 'Master of the power grid. Learned from Ukraine blackout attacks.',
    emoji: '👑',
    rarity: 'legendary',
    availableAfterGym: 8,
    moves: {
      1: ['GRID_SURGE', 'DEFENSE_IN_DEPTH'],
      30: ['ZERO_TRUST'],
      50: ['INCIDENT_DETECT']
    }
  },
  {
    id: 35,
    name: 'SCADAKING',
    types: ['STEEL', 'ELECTRIC'],
    baseStats: { hp: 95, atk: 85, def: 90, spd: 65, int: 95, res: 95 },
    description: 'The ultimate ICS defender. Embodies all principles of SCADA security.',
    emoji: '🦁',
    rarity: 'legendary',
    availableAfterGym: 8,
    moves: {
      1: ['ZERO_TRUST', 'GRID_SURGE'],
      30: ['DEFENSE_IN_DEPTH'],
      50: ['COMPLIANCE_AUDIT']
    }
  },

  // NEW ADVANCED SCADAMON (from new-scadamon.json)
  // Architecture Types
  {
    id: 36,
    name: 'PURGAMON',
    types: ['GROUND', 'STEEL'],
    baseStats: { hp: 65, atk: 45, def: 75, spd: 35, int: 60, res: 70 },
    description: 'A towering guardian formed of crystallized network segments, each layer glowing with different intensity. Embodies the Purdue Model.',
    emoji: '🏛️',
    rarity: 'uncommon',
    availableAfterGym: 2,
    evolutionLevel: 20,
    evolvesTo: 'SEGMANTIS',
    moves: {
      1: ['NETWORK_SEGMENT', 'BASELINE_CHECK'],
      15: ['FIREWALL_BLOCK'],
      20: ['DEFENSE_IN_DEPTH']
    }
  },
  {
    id: 37,
    name: 'SEGMANTIS',
    types: ['GROUND', 'STEEL'],
    baseStats: { hp: 80, atk: 65, def: 90, spd: 40, int: 70, res: 85 },
    description: 'A mantis-like creature with crystalline exoskeleton divided into perfectly isolated segments. Damage to one segment never affects another.',
    emoji: '🦗',
    rarity: 'rare',
    availableAfterGym: 4,
    moves: {
      1: ['NETWORK_SEGMENT', 'FIREWALL_BLOCK'],
      20: ['DEFENSE_IN_DEPTH'],
      35: ['ZERO_TRUST']
    }
  },

  // Protocol Types
  {
    id: 38,
    name: 'MODBYTE',
    types: ['WATER'],
    baseStats: { hp: 50, atk: 55, def: 30, spd: 70, int: 65, res: 45 },
    description: 'A small, simple creature that communicates in pure binary. Direct and unsophisticated—what you see is what you get.',
    emoji: '📡',
    rarity: 'uncommon',
    availableAfterGym: 3,
    evolutionLevel: 25,
    evolvesTo: 'PROTOCRAWL',
    moves: {
      1: ['WATER_PULSE', 'PROTOCOL_SCAN'],
      15: ['MODBUS_SURGE'],
      25: ['DNP3_STRIKE']
    }
  },
  {
    id: 39,
    name: 'PROTOCRAWL',
    types: ['WATER', 'STEEL'],
    baseStats: { hp: 70, atk: 75, def: 55, spd: 80, int: 85, res: 65 },
    description: 'A serpentine creature that has evolved to understand multiple industrial languages. Can translate between protocol dialects.',
    emoji: '🐍',
    rarity: 'rare',
    availableAfterGym: 5,
    moves: {
      1: ['MODBUS_SURGE', 'DNP3_STRIKE'],
      20: ['ENCRYPTION_SHIELD'],
      35: ['ZERO_TRUST']
    }
  },

  // Integrity Types
  {
    id: 40,
    name: 'HASHLING',
    types: ['STEEL'],
    baseStats: { hp: 45, atk: 40, def: 60, spd: 55, int: 70, res: 60 },
    description: 'A small spherical creature that constantly verifies its own existence. Can instantly detect when anything has been modified.',
    emoji: '🔐',
    rarity: 'uncommon',
    availableAfterGym: 4,
    evolutionLevel: 25,
    evolvesTo: 'CRYPTOGUARD',
    moves: {
      1: ['ENCRYPTION_SHIELD', 'BASELINE_CHECK'],
      15: ['PATCH_DEPLOY'],
      25: ['ZERO_TRUST']
    }
  },
  {
    id: 41,
    name: 'CRYPTOGUARD',
    types: ['STEEL', 'DARK'],
    baseStats: { hp: 75, atk: 55, def: 85, spd: 45, int: 80, res: 80 },
    description: 'An armored warrior whose shield constantly displays rotating cryptographic keys. Protects authenticity and integrity.',
    emoji: '🛡️',
    rarity: 'rare',
    availableAfterGym: 6,
    moves: {
      1: ['ENCRYPTION_SHIELD', 'ZERO_TRUST'],
      20: ['FORENSIC_SCAN'],
      35: ['DEFENSE_IN_DEPTH']
    }
  },

  // Monitoring Types
  {
    id: 42,
    name: 'AUDITRIX',
    types: ['NORMAL', 'DARK'],
    baseStats: { hp: 55, atk: 35, def: 50, spd: 60, int: 75, res: 55 },
    description: 'A creature with countless eyes arranged in concentric rings, each recording everything. Never forgets and can replay any event.',
    emoji: '👁️',
    rarity: 'uncommon',
    availableAfterGym: 5,
    evolutionLevel: 30,
    evolvesTo: 'SENTINULL',
    moves: {
      1: ['BASELINE_CHECK', 'INCIDENT_DETECT'],
      15: ['RISK_ASSESS'],
      30: ['FORENSIC_SCAN']
    }
  },
  {
    id: 43,
    name: 'SENTINULL',
    types: ['DARK', 'STEEL'],
    baseStats: { hp: 80, atk: 60, def: 70, spd: 50, int: 90, res: 70 },
    description: 'A towering sentinel whose body is composed of flowing log streams and alert patterns. Doesn\'t just observe—correlates, analyzes, and acts.',
    emoji: '🗼',
    rarity: 'rare',
    availableAfterGym: 7,
    moves: {
      1: ['INCIDENT_DETECT', 'FORENSIC_SCAN'],
      20: ['RISK_ASSESS'],
      35: ['COMPLIANCE_AUDIT']
    }
  },

  // Governance Types
  {
    id: 44,
    name: 'COMPLION',
    types: ['NORMAL', 'STEEL'],
    baseStats: { hp: 60, atk: 40, def: 65, spd: 40, int: 70, res: 65 },
    description: 'A creature made of scrolls, policy documents, and regulatory frameworks. Ensures all actions follow proper procedure.',
    emoji: '📜',
    rarity: 'uncommon',
    availableAfterGym: 6,
    evolutionLevel: 30,
    evolvesTo: 'RISKMASTER',
    moves: {
      1: ['COMPLIANCE_AUDIT', 'BASELINE_CHECK'],
      15: ['RISK_ASSESS'],
      30: ['DEFENSE_IN_DEPTH']
    }
  },
  {
    id: 45,
    name: 'RISKMASTER',
    types: ['NORMAL', 'STEEL'],
    baseStats: { hp: 85, atk: 50, def: 80, spd: 55, int: 90, res: 80 },
    description: 'Has transcended mere compliance to truly understand risk. Can assess any threat\'s likelihood and impact.',
    emoji: '⚖️',
    rarity: 'rare',
    availableAfterGym: 7,
    moves: {
      1: ['RISK_ASSESS', 'COMPLIANCE_AUDIT'],
      20: ['DEFENSE_IN_DEPTH'],
      35: ['ZERO_TRUST']
    }
  },

  // Legendary Threat Types
  {
    id: 46,
    name: 'INDUSTROYER',
    types: ['ELECTRIC', 'DARK'],
    baseStats: { hp: 100, atk: 95, def: 70, spd: 75, int: 95, res: 75 },
    description: 'A terrifying digital entity that speaks the language of industrial protocols—all of them. First witnessed during Ukraine power grid attacks.',
    emoji: '⚡',
    rarity: 'legendary',
    availableAfterGym: 8,
    moves: {
      1: ['GRID_SURGE', 'DNP3_STRIKE'],
      30: ['MODBUS_SURGE'],
      50: ['ZERO_TRUST']
    }
  },
  {
    id: 47,
    name: 'TRITANIUM',
    types: ['FIRE', 'POISON'],
    baseStats: { hp: 90, atk: 100, def: 65, spd: 85, int: 95, res: 70 },
    description: 'Born from the TRITON/TRISIS malware that targeted safety systems. Represents attacks designed to disable safety protections.',
    emoji: '☣️',
    rarity: 'legendary',
    availableAfterGym: 8,
    moves: {
      1: ['EMBER', 'INCIDENT_DETECT'],
      30: ['FORENSIC_SCAN'],
      50: ['RISK_ASSESS']
    }
  },
  {
    id: 48,
    name: 'LAYERION',
    types: ['STEEL', 'GROUND'],
    baseStats: { hp: 110, atk: 60, def: 100, spd: 45, int: 80, res: 95 },
    description: 'The embodiment of defense-in-depth. Exists simultaneously across multiple security layers—physical, network, host, application, data, and procedural.',
    emoji: '🏰',
    rarity: 'legendary',
    availableAfterGym: 8,
    moves: {
      1: ['DEFENSE_IN_DEPTH', 'NETWORK_SEGMENT'],
      30: ['FIREWALL_BLOCK'],
      50: ['ZERO_TRUST']
    }
  },
  {
    id: 49,
    name: 'ZERODAWN',
    types: ['GHOST', 'DARK'],
    baseStats: { hp: 95, atk: 90, def: 75, spd: 90, int: 100, res: 80 },
    description: 'The manifestation of the unknown unknown—the zero-day vulnerability no one has discovered yet. Form constantly shifting.',
    emoji: '🌑',
    rarity: 'legendary',
    availableAfterGym: 8,
    moves: {
      1: ['FORENSIC_SCAN', 'INCIDENT_DETECT'],
      30: ['ZERO_TRUST'],
      50: ['DEFENSE_IN_DEPTH']
    }
  },

  // Recovery Type
  {
    id: 50,
    name: 'RESILIX',
    types: ['STEEL', 'NORMAL'],
    baseStats: { hp: 70, atk: 45, def: 55, spd: 50, int: 65, res: 70 },
    description: 'A phoenix-like creature composed of backup data, redundant systems, and recovery procedures. When knocked down, rises from verified backups.',
    emoji: '🔄',
    rarity: 'uncommon',
    availableAfterGym: 7,
    moves: {
      1: ['BASELINE_CHECK', 'PATCH_DEPLOY'],
      15: ['DEFENSE_IN_DEPTH'],
      25: ['COMPLIANCE_AUDIT']
    }
  }
];

// Team Hack-It SCADAmon (enemies)
export const ENEMY_SCADAMON = [
  {
    id: 101,
    name: 'MALWAREMON',
    types: ['GHOST', 'POISON'],
    baseStats: { hp: 50, atk: 65, def: 40, spd: 70, int: 75, res: 45 },
    description: 'A malicious code creature used by Team Hack-It.',
    emoji: '🦠',
    moves: ['MALWARE_INJECT', 'LATERAL_MOVE', 'PHISHING_LURE']
  },
  {
    id: 102,
    name: 'SCRIPTKID',
    types: ['GHOST'],
    baseStats: { hp: 40, atk: 55, def: 35, spd: 80, int: 50, res: 40 },
    description: 'Uses pre-written exploit scripts without understanding them.',
    emoji: '👶',
    moves: ['PHISHING_LURE', 'LATERAL_MOVE']
  },
  {
    id: 103,
    name: 'BOTLING',
    types: ['GHOST', 'NORMAL'],
    baseStats: { hp: 35, atk: 45, def: 35, spd: 60, int: 40, res: 35 },
    description: 'A tiny bot creature. Weak alone, dangerous in swarms.',
    emoji: '🤖',
    moves: ['PHISHING_LURE', 'DATA_EXFIL']
  },
  {
    id: 104,
    name: 'LATERMON',
    types: ['GHOST', 'GROUND'],
    baseStats: { hp: 55, atk: 70, def: 55, spd: 75, int: 80, res: 55 },
    description: 'A lateral movement specialist. Finds paths between segments.',
    emoji: '🕸️',
    moves: ['LATERAL_MOVE', 'MALWARE_INJECT', 'DATA_EXFIL']
  },
  {
    id: 105,
    name: 'PIVOTEER',
    types: ['GHOST', 'DARK'],
    baseStats: { hp: 50, atk: 65, def: 50, spd: 85, int: 75, res: 50 },
    description: 'Establishes footholds in networks for other attackers.',
    emoji: '🎯',
    moves: ['LATERAL_MOVE', 'PHISHING_LURE', 'MALWARE_INJECT']
  },
  {
    id: 106,
    name: 'SNIFFERMON',
    types: ['WATER', 'GHOST'],
    baseStats: { hp: 45, atk: 55, def: 45, spd: 70, int: 90, res: 50 },
    description: 'A packet sniffer creature. Observes all network traffic.',
    emoji: '👁️',
    moves: ['DATA_EXFIL', 'PHISHING_LURE', 'LATERAL_MOVE']
  },
  {
    id: 107,
    name: 'SPOOFEON',
    types: ['WATER', 'GHOST'],
    baseStats: { hp: 50, atk: 75, def: 50, spd: 75, int: 80, res: 55 },
    description: 'Forges messages, pretending to be legitimate devices.',
    emoji: '🎭',
    moves: ['PHISHING_LURE', 'MALWARE_INJECT', 'DATA_EXFIL']
  },
  {
    id: 108,
    name: 'CRYPTLOCK',
    types: ['DARK', 'STEEL'],
    baseStats: { hp: 65, atk: 80, def: 70, spd: 60, int: 85, res: 65 },
    description: 'A ransomware creature. Encrypts data and demands payment.',
    emoji: '🔐',
    moves: ['RANSOMWARE_LOCK', 'MALWARE_INJECT', 'DATA_EXFIL']
  },
  {
    id: 109,
    name: 'EXFILMON',
    types: ['DARK', 'GHOST'],
    baseStats: { hp: 50, atk: 60, def: 45, spd: 90, int: 80, res: 55 },
    description: 'Steals sensitive information and smuggles it out.',
    emoji: '📤',
    moves: ['DATA_EXFIL', 'LATERAL_MOVE', 'PHISHING_LURE']
  },
  {
    id: 110,
    name: 'NULLVOID',
    types: ['DARK', 'GHOST'],
    baseStats: { hp: 90, atk: 95, def: 85, spd: 80, int: 100, res: 90 },
    description: 'NULL PRIME\'s ultimate SCADAmon. Embodies every attack technique.',
    emoji: '🌑',
    moves: ['RANSOMWARE_LOCK', 'MALWARE_INJECT', 'LATERAL_MOVE', 'DATA_EXFIL']
  }
];

// Gym Leaders
export const GYM_LEADERS = [
  {
    id: 1,
    name: 'AXIOM',
    title: 'Foundation Falls Gym Leader',
    badge: 'Foundation Badge',
    domain: 'ics_basics',
    emoji: '🏛️',
    team: [
      { scadamon: 'SCRIPTKID', level: 10 },
      { scadamon: 'BOTLING', level: 12 }
    ],
    defeatMessage: 'You understand the fundamentals! Take this Foundation Badge!',
    preBattleMessage: 'Welcome to Foundation Falls! Let me test your ICS knowledge!'
  },
  {
    id: 2,
    name: 'SEGMENT',
    title: 'Purdue City Gym Leader',
    badge: 'Architecture Badge',
    domain: 'architecture',
    emoji: '🏗️',
    team: [
      { scadamon: 'LATERMON', level: 18 },
      { scadamon: 'PIVOTEER', level: 20 }
    ],
    defeatMessage: 'Your network knowledge is solid! The Architecture Badge is yours!',
    preBattleMessage: 'I am SEGMENT, master of network architecture! Can you defend against lateral movement?'
  },
  {
    id: 3,
    name: 'CIPHER',
    title: 'Protocol Port Gym Leader',
    badge: 'Protocol Badge',
    domain: 'protocols',
    emoji: '🔐',
    team: [
      { scadamon: 'SNIFFERMON', level: 26 },
      { scadamon: 'SPOOFEON', level: 28 }
    ],
    defeatMessage: 'You speak the language of protocols! Accept the Protocol Badge!',
    preBattleMessage: 'Protocols are the language of ICS. Let\'s see if you\'re fluent!'
  },
  {
    id: 4,
    name: 'PATCHER',
    title: 'Patch Plains Gym Leader',
    badge: 'Windows Badge',
    domain: 'windows',
    emoji: '🪟',
    team: [
      { scadamon: 'MALWAREMON', level: 32 },
      { scadamon: 'CRYPTLOCK', level: 35 }
    ],
    defeatMessage: 'Your Windows security is on point! Here\'s the Windows Badge!',
    preBattleMessage: 'Windows runs most HMIs and SCADA servers. Can you secure them?'
  },
  {
    id: 5,
    name: 'ROOTGUARD',
    title: 'Root Valley Gym Leader',
    badge: 'Unix Badge',
    domain: 'unix',
    emoji: '🐧',
    team: [
      { scadamon: 'PIVOTEER', level: 38 },
      { scadamon: 'EXFILMON', level: 40 }
    ],
    defeatMessage: 'You have root-level knowledge! The Unix Badge is earned!',
    preBattleMessage: 'In the valley of Unix, privilege is everything. Show me your skills!'
  },
  {
    id: 6,
    name: 'AUDITOR',
    title: 'Compliance Citadel Gym Leader',
    badge: 'Governance Badge',
    domain: 'governance',
    emoji: '📜',
    team: [
      { scadamon: 'SNIFFERMON', level: 44 },
      { scadamon: 'CRYPTLOCK', level: 46 }
    ],
    defeatMessage: 'You passed the audit! The Governance Badge is yours!',
    preBattleMessage: 'Compliance isn\'t optional. Let me audit your knowledge!'
  },
  {
    id: 7,
    name: 'RESPONDER',
    title: 'Incident Island Gym Leader',
    badge: 'Response Badge',
    domain: 'response',
    emoji: '🚨',
    team: [
      { scadamon: 'MALWAREMON', level: 50 },
      { scadamon: 'EXFILMON', level: 52 }
    ],
    defeatMessage: 'You can handle any incident! Take the Response Badge!',
    preBattleMessage: 'When incidents happen, you must be ready. Show me your response!'
  },
  {
    id: 8,
    name: 'INTEGRATOR',
    title: 'Synthesis Summit Gym Leader',
    badge: 'Champion Badge',
    domain: 'synthesis',
    emoji: '🏆',
    team: [
      { scadamon: 'LATERMON', level: 56 },
      { scadamon: 'CRYPTLOCK', level: 58 },
      { scadamon: 'NULLVOID', level: 60 }
    ],
    defeatMessage: 'You\'ve integrated all knowledge! The Champion Badge awaits!',
    preBattleMessage: 'This is the final gym. Show me everything you\'ve learned!'
  }
];

// Elite 4 (Team Hack-It Admins)
export const ELITE_FOUR = [
  {
    id: 'e1',
    name: 'Admin GLITCH',
    title: 'Team Hack-It Admin',
    specialty: 'Basic Attacks',
    emoji: '👾',
    team: [
      { scadamon: 'SCRIPTKID', level: 52 },
      { scadamon: 'BOTLING', level: 54 },
      { scadamon: 'MALWAREMON', level: 56 }
    ],
    defeatMessage: 'Glitch in my system... you got lucky!',
    preBattleMessage: 'I\'m Admin GLITCH! My basic attacks will overwhelm you!'
  },
  {
    id: 'e2',
    name: 'Admin ARCHITECT',
    title: 'Team Hack-It Admin',
    specialty: 'Network Attacks',
    emoji: '🕷️',
    team: [
      { scadamon: 'LATERMON', level: 56 },
      { scadamon: 'PIVOTEER', level: 58 },
      { scadamon: 'EXFILMON', level: 60 }
    ],
    defeatMessage: 'You... mapped my entire network?!',
    preBattleMessage: 'I design the attack infrastructure. You can\'t escape my web!'
  },
  {
    id: 'e3',
    name: 'Admin WIRETAP',
    title: 'Team Hack-It Admin',
    specialty: 'Protocol Attacks',
    emoji: '📡',
    team: [
      { scadamon: 'SNIFFERMON', level: 60 },
      { scadamon: 'SPOOFEON', level: 62 },
      { scadamon: 'MODBUZZ', level: 58 }
    ],
    defeatMessage: 'My wiretaps... you found them all!',
    preBattleMessage: 'I hear everything on the wire. Your secrets are mine!'
  },
  {
    id: 'e4',
    name: 'Admin RANSOMWARE',
    title: 'Team Hack-It Admin',
    specialty: 'Encryption Attacks',
    emoji: '💀',
    team: [
      { scadamon: 'CRYPTLOCK', level: 64 },
      { scadamon: 'EXFILMON', level: 62 },
      { scadamon: 'MALWAREMON', level: 66 }
    ],
    defeatMessage: 'My encryption... broken?! Impossible!',
    preBattleMessage: 'Pay up or lose everything! I am Admin RANSOMWARE!'
  }
];

// Rival Jerry
export const RIVAL = {
  name: 'Jerry',
  title: 'Your Rival',
  emoji: '😏',
  getTeam: (playerStarter) => {
    // Jerry picks the starter strong against yours
    const starterCounters = {
      'GRIDLING': 'SPARKLET', // Fire beats nothing but Jerry picks opposite
      'PUMPLET': 'GRIDLING',  // Electric beats Water
      'SPARKLET': 'PUMPLET'   // Water beats Fire
    };
    const jerryStarter = starterCounters[playerStarter] || 'GRIDLING';

    return [
      { scadamon: jerryStarter, level: 65, isStarter: true },
      { scadamon: 'PLCEE', level: 62 },
      { scadamon: 'FIREWOLF', level: 63 },
      { scadamon: 'OPCURON', level: 64 },
      { scadamon: 'CRYPTLOCK', level: 66 },
      { scadamon: 'NULLVOID', level: 68 }
    ];
  },
  preBattleMessage: 'I\'ve been waiting for you! I beat the Elite 4 first, but I\'m not champion yet. That title goes to whoever wins THIS battle!',
  defeatMessage: 'You... actually beat me? Fine. You\'re the true ICS Defender Champion. But I\'ll be back!'
};

// Level progression by gym
export const LEVEL_PROGRESSION = {
  1: { baseLevel: 10, maxLevel: 15 },
  2: { baseLevel: 18, maxLevel: 22 },
  3: { baseLevel: 26, maxLevel: 30 },
  4: { baseLevel: 32, maxLevel: 38 },
  5: { baseLevel: 38, maxLevel: 44 },
  6: { baseLevel: 44, maxLevel: 50 },
  7: { baseLevel: 50, maxLevel: 56 },
  8: { baseLevel: 56, maxLevel: 62 },
  elite: { baseLevel: 60, maxLevel: 70 }
};

// XP bonus multipliers based on quiz score
export const XP_BONUSES = {
  perfect: { min: 100, max: 100, multiplier: 1.25, label: 'PERFECT!' },
  excellent: { min: 95, max: 99, multiplier: 1.15, label: 'Excellent!' },
  great: { min: 90, max: 94, multiplier: 1.10, label: 'Great!' },
  good: { min: 80, max: 89, multiplier: 1.05, label: 'Good!' },
  pass: { min: 0, max: 79, multiplier: 1.0, label: 'Keep practicing!' }
};

// Catch rates based on quiz performance (out of 25 questions)
// 25/25 = 100% = legendary, 23/25 = 92% = rare, 22/25 = 88% = uncommon
export const CATCH_RATES = {
  legendary: { minScore: 100 },  // 25/25 perfect score
  rare: { minScore: 92 },        // 23/25 or better
  uncommon: { minScore: 88 },    // 22/25 or better
  common: { minScore: 0 }        // Always available
};

// Helper function to get SCADAmon by name
export function getScadamonByName(name) {
  const allScadamon = [...STARTERS, ...WILD_SCADAMON, ...ENEMY_SCADAMON];
  return allScadamon.find(s => s.name === name);
}

// Helper function to get move by ID
export function getMoveById(moveId) {
  return MOVES[moveId];
}

// Helper function to calculate damage
export function calculateDamage(attacker, defender, move, isCorrectAnswer) {
  if (!isCorrectAnswer) return 0;

  const movePower = move.power;
  if (movePower === 0) return 0; // Status move

  const attack = attacker.stats.atk;
  const defense = defender.stats.def;
  const level = attacker.level;

  // Base damage formula (simplified Pokemon formula)
  let damage = Math.floor(((2 * level / 5 + 2) * movePower * (attack / defense)) / 50 + 2);

  // Type effectiveness
  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  damage = Math.floor(damage * effectiveness);

  // Random variance (85-100%)
  const variance = 0.85 + Math.random() * 0.15;
  damage = Math.floor(damage * variance);

  return Math.max(1, damage); // Minimum 1 damage
}

// Helper function to get type effectiveness
export function getTypeEffectiveness(attackType, defenderTypes) {
  let multiplier = 1;

  const typeData = TYPE_CHART[attackType];
  if (!typeData) return 1;

  for (const defType of defenderTypes) {
    if (typeData.immuneTo.includes(defType)) {
      return 0; // Immune
    }
    if (typeData.strongAgainst.includes(defType)) {
      multiplier *= 2;
    }
    if (typeData.weakAgainst.includes(defType)) {
      multiplier *= 0.5;
    }
  }

  return multiplier;
}

// Helper to get available wild SCADAmon after a gym
export function getAvailableWildScadamon(completedGyms, quizScore) {
  const maxGym = Math.max(...completedGyms, 0);

  // Determine available rarities based on score using new thresholds
  // 25/25 = 100% = legendary, 23/25 = 92% = rare, 22/25 = 88% = uncommon
  let availableRarities = ['common'];
  if (quizScore >= CATCH_RATES.uncommon.minScore) availableRarities.push('uncommon');
  if (quizScore >= CATCH_RATES.rare.minScore) availableRarities.push('rare');
  if (quizScore >= CATCH_RATES.legendary.minScore) availableRarities.push('legendary');

  return WILD_SCADAMON.filter(s =>
    s.availableAfterGym <= maxGym &&
    availableRarities.includes(s.rarity)
  );
}
