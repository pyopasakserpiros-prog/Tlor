// ═══════════════════════════════════════════════════════════
//  THE ONE RING CHRONICLES - GAME ENGINE
//  Core systems: Combat, Loot, Stats, Progression
// ═══════════════════════════════════════════════════════════

import type {
  PlayerState, CharacterStats, CoreStats, Equipment, EquipmentSlot,
  Enemy, MapEvent, Follower, Rarity, GameMap,
} from './types';
import {
  ENEMY_TEMPLATES, WIZARDS, EASTER_EGG_ITEMS, FOLLOWER_TEMPLATES,
  RARITY_STAT_COUNTS, ROLLABLE_STATS, SLOT_BASE_STAT,
  WEAPON_PREFIXES, WEAPON_NAMES, SHIELD_PREFIXES, SHIELD_NAMES,
  ARMOR_PREFIXES, ARMOR_NAMES, ACCESSORY_PREFIXES, ACCESSORY_NAMES,
  GAME_CONFIG, expForLevel,
} from './data';

let itemCounter = 0;
function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${++itemCounter}`;
}

// ═══════════════════════════════════════════
//  STAT CALCULATION
// ═══════════════════════════════════════════

export function calculateDerivedStats(core: CoreStats): Omit<CharacterStats, keyof CoreStats | 'currentHp' | 'currentMana'> {
  return {
    // Derived
    atk: core.STR * GAME_CONFIG.ATK_PER_STR,
    def: core.VIT * GAME_CONFIG.DEF_PER_VIT,
    maxHp: GAME_CONFIG.BASE_HP + core.VIT * GAME_CONFIG.HP_PER_VIT,
    maxMana: GAME_CONFIG.BASE_MANA + core.INT * GAME_CONFIG.MANA_PER_INT,
    magicPower: core.INT * GAME_CONFIG.MAGIC_POWER_PER_INT,
    dodgeChance: GAME_CONFIG.BASE_DODGE + core.AGI * GAME_CONFIG.DODGE_PER_AGI,
    accuracy: GAME_CONFIG.BASE_ACCURACY + core.AGI * GAME_CONFIG.ACCURACY_PER_AGI,
    critRate: core.LUCK * GAME_CONFIG.CRIT_RATE_PER_LUCK,
    critDamage: GAME_CONFIG.BASE_CRIT_DAMAGE + core.LUCK * GAME_CONFIG.CRIT_DAMAGE_PER_LUCK,
    // Bonus (start at 0)
    atkPercent: 0,
    defPercent: 0,
    lifeSteal: 0,
    manaSteal: 0,
    killChance: 0,
    blockChance: 0,
  };
}

export function calculateTotalStats(player: PlayerState): CharacterStats {
  const derived = calculateDerivedStats(player.baseStats);

  const total: CharacterStats = {
    ...player.baseStats,
    ...derived,
    currentHp: player.totalStats.currentHp,
    currentMana: player.totalStats.currentMana,
  };

  // Add equipment stats
  for (const slot of ['weapon', 'shield', 'armor', 'accessory'] as EquipmentSlot[]) {
    const item = player.equipment[slot];
    if (item) {
      applyItemStats(total, item);
    }
  }

  // Add follower equipment (followers equip their own gear)
  for (const follower of player.followers) {
    if (follower.isAlive) {
      for (const slot of ['weapon', 'shield', 'armor', 'accessory'] as EquipmentSlot[]) {
        const item = follower.equipment[slot];
        if (item) {
          applyItemStats(total, item);
        }
      }
    }
  }

  // Add passive skill stats
  for (const skill of player.skills) {
    if (skill.learned && skill.effect.type === 'passive_stat' && skill.effect.stats) {
      const stats = skill.effect.stats as Record<string, number>;
      for (const [key, value] of Object.entries(stats)) {
        if (value !== undefined && key in total) {
          (total as unknown as Record<string, number>)[key] += value;
        }
      }
    }
  }

  // Apply percentage modifiers
  total.atk = Math.floor(total.atk * (1 + total.atkPercent / 100));
  total.def = Math.floor(total.def * (1 + total.defPercent / 100));
  total.maxHp = Math.floor(total.maxHp);
  total.maxMana = Math.floor(total.maxMana);

  // Clamp values
  total.dodgeChance = Math.min(75, Math.max(0, total.dodgeChance));
  total.accuracy = Math.min(100, Math.max(5, total.accuracy));
  total.critRate = Math.min(80, Math.max(0, total.critRate));
  total.blockChance = Math.min(50, Math.max(0, total.blockChance));
  total.killChance = Math.min(25, Math.max(0, total.killChance));

  return total;
}

function applyItemStats(stats: CharacterStats, item: Equipment) {
  const s = stats as unknown as Record<string, number>;
  // Base stat
  const baseStatKey = SLOT_BASE_STAT[item.slot];
  if (baseStatKey && baseStatKey in s) {
    s[baseStatKey] += item.baseStat;
  }
  // Bonus stats
  for (const bs of item.bonusStats) {
    if (bs.statName in s) {
      s[bs.statName] += bs.value;
    }
  }
}

// ═══════════════════════════════════════════
//  EQUIPMENT GENERATION
// ═══════════════════════════════════════════

function rollRarity(): Rarity {
  const roll = Math.random();
  if (roll < 0.005) return 'mythic';
  if (roll < 0.02) return 'legendary';
  if (roll < 0.08) return 'epic';
  if (roll < 0.20) return 'rare';
  if (roll < 0.45) return 'uncommon';
  return 'common';
}

function rollStatValue(statName: string, itemLevel: number): number {
  const base = Math.max(1, Math.floor(itemLevel * 0.5));
  const multiplier = 1 + Math.random() * 2;
  let value = Math.floor(base * multiplier);

  // Different stats have different scaling
  if (['STR', 'AGI', 'INT', 'LUCK', 'VIT'].includes(statName)) {
    value = Math.max(1, Math.floor(value * 0.3));
  } else if (['atk', 'def', 'magicPower'].includes(statName)) {
    value = Math.max(1, Math.floor(value * 0.8));
  } else if (['maxHp', 'maxMana'].includes(statName)) {
    value = Math.max(5, Math.floor(value * 3));
  } else if (['dodgeChance', 'accuracy', 'critRate', 'blockChance', 'killChance'].includes(statName)) {
    value = Math.max(1, Math.min(15, Math.floor(value * 0.2)));
  } else if (['critDamage'].includes(statName)) {
    value = Math.max(5, Math.floor(value * 0.5));
  } else if (['atkPercent', 'defPercent', 'lifeSteal', 'manaSteal'].includes(statName)) {
    value = Math.max(1, Math.min(20, Math.floor(value * 0.15)));
  }

  return value;
}

export function generateEquipment(itemLevel: number, forcedSlot?: EquipmentSlot, forcedRarity?: Rarity): Equipment {
  const slot = forcedSlot || (['weapon', 'shield', 'armor', 'accessory'] as EquipmentSlot[])[Math.floor(Math.random() * 4)];
  const rarity = forcedRarity || rollRarity();
  const numBonusStats = RARITY_STAT_COUNTS[rarity];

  // Check for Easter Egg (very rare)
  if (rarity === 'mythic' && Math.random() < 0.3) {
    const egg = EASTER_EGG_ITEMS.filter(e => e.slot === slot);
    if (egg.length > 0) {
      const chosen = egg[Math.floor(Math.random() * egg.length)];
      return { ...chosen, id: genId('egg'), itemLevel };
    }
  }

  // Generate name
  let name: string;
  switch (slot) {
    case 'weapon':
      name = `${WEAPON_PREFIXES[Math.floor(Math.random() * WEAPON_PREFIXES.length)]} ${WEAPON_NAMES[Math.floor(Math.random() * WEAPON_NAMES.length)]}`;
      break;
    case 'shield':
      name = `${SHIELD_PREFIXES[Math.floor(Math.random() * SHIELD_PREFIXES.length)]} ${SHIELD_NAMES[Math.floor(Math.random() * SHIELD_NAMES.length)]}`;
      break;
    case 'armor':
      name = `${ARMOR_PREFIXES[Math.floor(Math.random() * ARMOR_PREFIXES.length)]} ${ARMOR_NAMES[Math.floor(Math.random() * ARMOR_NAMES.length)]}`;
      break;
    case 'accessory':
      name = `${ACCESSORY_PREFIXES[Math.floor(Math.random() * ACCESSORY_PREFIXES.length)]} ${ACCESSORY_NAMES[Math.floor(Math.random() * ACCESSORY_NAMES.length)]}`;
      break;
  }

  // Base stat value
  const baseStatMult = { weapon: 3, shield: 2, armor: 8, accessory: 4 };
  const baseStat = Math.floor(itemLevel * baseStatMult[slot] * (1 + Math.random() * 0.5));

  // Bonus stats
  const bonusStats: { statName: string; value: number }[] = [];
  const usedStats = new Set<string>();
  for (let i = 0; i < numBonusStats; i++) {
    let statName: string;
    do {
      statName = ROLLABLE_STATS[Math.floor(Math.random() * ROLLABLE_STATS.length)];
    } while (usedStats.has(statName));
    usedStats.add(statName);
    bonusStats.push({ statName, value: rollStatValue(statName, itemLevel) });
  }

  const icons: Record<EquipmentSlot, string> = { weapon: '⚔️', shield: '🛡️', armor: '👕', accessory: '💍' };

  return {
    id: genId('item'),
    name,
    slot,
    rarity,
    itemLevel,
    baseStat,
    bonusStats,
    icon: icons[slot],
  };
}

// ═══════════════════════════════════════════
//  ENEMY GENERATION
// ═══════════════════════════════════════════

export function generateEnemy(map: GameMap, isBoss: boolean): Enemy {
  const template = isBoss
    ? { name: map.bossName, portrait: map.bossPortrait, isBoss: true }
    : ENEMY_TEMPLATES[map.enemyPool[Math.floor(Math.random() * map.enemyPool.length)]];

  const level = Math.floor(Math.random() * (map.levelRange[1] - map.levelRange[0] + 1)) + map.levelRange[0];

  const hpMult = isBoss ? GAME_CONFIG.BOSS_HP_MULTIPLIER : 1;
  const atkMult = isBoss ? GAME_CONFIG.BOSS_ATK_MULTIPLIER : 1;

  const maxHp = Math.floor(level * 20 * hpMult * (0.8 + Math.random() * 0.4));
  const atk = Math.floor(level * 3 * atkMult * (0.8 + Math.random() * 0.4));
  const def = Math.floor(level * 1.5 * (0.8 + Math.random() * 0.4));

  return {
    id: genId('enemy'),
    name: template?.name || 'Unknown Foe',
    level,
    hp: maxHp,
    maxHp,
    atk,
    def,
    isBoss: isBoss,
    portrait: template?.portrait || '/assets/enemy-orc.jpg',
    lootTable: [rollRarity(), rollRarity()],
    expReward: Math.floor(level * 10 * (isBoss ? 5 : 1)),
    goldReward: Math.floor(level * 5 * (isBoss ? 10 : 1)),
  };
}

export function generateCombatEncounter(map: GameMap, isBoss: boolean): Enemy[] {
  if (isBoss) {
    return [generateEnemy(map, true)];
  }
  const numEnemies = Math.floor(Math.random() * 3) + 1; // 1-3 enemies
  return Array.from({ length: numEnemies }, () => generateEnemy(map, false));
}

// ═══════════════════════════════════════════
//  COMBAT SYSTEM
// ═══════════════════════════════════════════

export interface CombatResult {
  damage: number;
  isCrit: boolean;
  isDodged: boolean;
  isBlocked: boolean;
  isKill: boolean;
  lifeStolen: number;
  manaStolen: number;
}

export function calculateDamage(
  attacker: { atk: number; accuracy: number; critRate: number; critDamage: number; killChance: number; magicPower?: number },
  defender: { def: number; dodgeChance: number; blockChance: number; isBoss: boolean },
  skillMultiplier = 1,
  isMagic = false
): CombatResult {
  // Check dodge
  if (Math.random() * 100 < defender.dodgeChance) {
    return { damage: 0, isCrit: false, isDodged: true, isBlocked: false, isKill: false, lifeStolen: 0, manaStolen: 0 };
  }

  // Check block
  if (Math.random() * 100 < defender.blockChance) {
    return { damage: 0, isCrit: false, isDodged: false, isBlocked: true, isKill: false, lifeStolen: 0, manaStolen: 0 };
  }

  // Check kill chance (non-boss only)
  const isKill = !defender.isBoss && attacker.killChance > 0 && Math.random() * 100 < attacker.killChance;

  // Base damage
  const baseAtk = isMagic ? (attacker.magicPower || 0) : attacker.atk;
  let damage = Math.max(1, Math.floor(baseAtk * skillMultiplier - defender.def * 0.5));

  // Check crit
  const isCrit = Math.random() * 100 < attacker.critRate;
  if (isCrit) {
    damage = Math.floor(damage * (attacker.critDamage / 100));
  }

  // Variance
  damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

  return {
    damage: isKill ? 99999 : damage,
    isCrit,
    isDodged: false,
    isBlocked: false,
    isKill,
    lifeStolen: 0,
    manaStolen: 0,
  };
}

// ═══════════════════════════════════════════
//  FOLLOWER SYSTEM
// ═══════════════════════════════════════════

export function generateFollower(map: GameMap): Follower {
  const template = FOLLOWER_TEMPLATES[Math.floor(Math.random() * FOLLOWER_TEMPLATES.length)];
  const level = Math.floor(Math.random() * (map.levelRange[1] - map.levelRange[0] + 1)) + map.levelRange[0];

  // Generate base core stats for follower
  const core: CoreStats = {
    STR: Math.floor(level * 1.5 + Math.random() * level),
    AGI: Math.floor(level * 1.2 + Math.random() * level),
    INT: Math.floor(level * 1.0 + Math.random() * level),
    LUCK: Math.floor(level * 0.8 + Math.random() * level),
    VIT: Math.floor(level * 1.5 + Math.random() * level),
  };

  const derived = calculateDerivedStats(core);
  const maxHp = derived.maxHp;
  const maxMana = derived.maxMana;

  // Generate some starting equipment
  const equipment: Record<EquipmentSlot, Equipment | null> = {
    weapon: Math.random() < 0.5 ? generateEquipment(level, 'weapon', 'uncommon') : null,
    shield: Math.random() < 0.3 ? generateEquipment(level, 'shield', 'common') : null,
    armor: generateEquipment(level, 'armor', 'uncommon'),
    accessory: Math.random() < 0.4 ? generateEquipment(level, 'accessory', 'common') : null,
  };

  return {
    id: genId('follower'),
    name: template.name,
    title: template.title,
    level,
    stats: {
      ...core,
      ...derived,
      currentHp: maxHp,
      currentMana: maxMana,
    },
    equipment,
    skills: [],
    portrait: template.portrait,
    isAlive: true,
  };
}

// ═══════════════════════════════════════════
//  MAP EVENT GENERATION
// ═══════════════════════════════════════════

export function generateMapEvent(map: GameMap, progress: number): MapEvent {
  const roll = Math.random();

  // Check if it's time for boss
  if (progress >= map.encountersToBoss) {
    return {
      type: 'boss',
      message: `A terrible presence awaits... ${map.bossName} blocks your path!`,
      data: generateCombatEncounter(map, true),
    };
  }

  if (roll < GAME_CONFIG.WIZARD_CHANCE) {
    const wizard = WIZARDS[Math.floor(Math.random() * WIZARDS.length)];
    return {
      type: 'wizard',
      message: `You encounter ${wizard.name} ${wizard.title}, one of the Istari!`,
      data: wizard,
    };
  }

  if (roll < GAME_CONFIG.WIZARD_CHANCE + GAME_CONFIG.FOLLOWER_CHANCE) {
    const follower = generateFollower(map);
    return {
      type: 'follower',
      message: `${follower.name} ${follower.title} wishes to join your fellowship!`,
      data: follower,
    };
  }

  if (roll < GAME_CONFIG.WIZARD_CHANCE + GAME_CONFIG.FOLLOWER_CHANCE + 0.1) {
    const item = generateEquipment(map.levelRange[1]);
    return {
      type: 'loot',
      message: `You discovered a ${item.name}!`,
      data: item,
    };
  }

  // Default: combat
  return {
    type: 'combat',
    message: 'Enemies appear before you!',
    data: generateCombatEncounter(map, false),
  };
}

// ═══════════════════════════════════════════
//  LOOT FROM COMBAT
// ═══════════════════════════════════════════

export function generateCombatLoot(enemies: Enemy[]): Equipment[] {
  const loot: Equipment[] = [];
  for (const enemy of enemies) {
    if (Math.random() < GAME_CONFIG.LOOT_CHANCE_BASE) {
      const rarity = enemy.lootTable[Math.floor(Math.random() * enemy.lootTable.length)];
      loot.push(generateEquipment(enemy.level, undefined, rarity));
    }
  }
  return loot;
}

// ═══════════════════════════════════════════
//  LEVEL UP
// ═══════════════════════════════════════════

export function checkLevelUp(player: PlayerState): { leveled: boolean; newLevel?: number } {
  if (player.exp >= player.expToNext) {
    const newLevel = player.level + 1;
    const newExp = player.exp - player.expToNext;
    player.level = newLevel;
    player.exp = newExp;
    player.expToNext = expForLevel(newLevel);
    player.statPoints += GAME_CONFIG.STAT_POINTS_PER_LEVEL;
    return { leveled: true, newLevel };
  }
  return { leveled: false };
}

// ═══════════════════════════════════════════
//  INITIAL PLAYER
// ═══════════════════════════════════════════

export function createNewPlayer(name: string): PlayerState {
  const baseStats: CoreStats = { STR: 5, AGI: 5, INT: 5, LUCK: 5, VIT: 5 };
  const derived = calculateDerivedStats(baseStats);

  return {
    name,
    level: 1,
    exp: 0,
    expToNext: expForLevel(1),
    statPoints: 0,
    baseStats,
    totalStats: {
      ...baseStats,
      ...derived,
      currentHp: derived.maxHp,
      currentMana: derived.maxMana,
    },
    equipment: { weapon: null, shield: null, armor: null, accessory: null },
    inventory: [
      generateEquipment(1, 'weapon', 'common'),
      generateEquipment(1, 'armor', 'common'),
    ],
    skills: [],
    followers: [],
    gold: 50,
    currentMap: 1,
    mapsUnlocked: 1,
    totalKills: 0,
    bossesDefeated: 0,
    playTime: 0,
  };
}

// ═══════════════════════════════════════════
//  EQUIP / UNEQUIP
// ═══════════════════════════════════════════

export function equipItem(player: PlayerState, item: Equipment, isFollower = false, followerIndex = -1): Equipment | null {
  if (isFollower && followerIndex >= 0 && followerIndex < player.followers.length) {
    const follower = player.followers[followerIndex];
    const oldItem = follower.equipment[item.slot];
    follower.equipment[item.slot] = item;
    return oldItem;
  } else {
    const oldItem = player.equipment[item.slot];
    player.equipment[item.slot] = item;
    return oldItem;
  }
}

export function unequipItem(player: PlayerState, slot: EquipmentSlot, isFollower = false, followerIndex = -1): Equipment | null {
  if (isFollower && followerIndex >= 0 && followerIndex < player.followers.length) {
    const item = player.followers[followerIndex].equipment[slot];
    player.followers[followerIndex].equipment[slot] = null;
    return item;
  } else {
    const item = player.equipment[slot];
    player.equipment[slot] = null;
    return item;
  }
}

// ═══════════════════════════════════════════
//  REVIVE FOLLOWERS
// ═══════════════════════════════════════════

export function reviveFollowers(player: PlayerState) {
  for (const f of player.followers) {
    f.isAlive = true;
    f.stats.currentHp = f.stats.maxHp;
    f.stats.currentMana = f.stats.maxMana;
  }
}
