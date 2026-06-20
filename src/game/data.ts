// ═══════════════════════════════════════════════════════════
//  THE ONE RING CHRONICLES - GAME DATA
//  All Middle-earth content: Maps, Enemies, Items, Skills, Wizards
// ═══════════════════════════════════════════════════════════

import type { GameMap, Enemy, Equipment, Wizard, Follower, Rarity, EquipmentSlot } from './types';

// ─── RARITY CONFIG ───
export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9CA3AF',      // White/Gray
  uncommon: '#22C55E',    // Green
  rare: '#3B82F6',        // Blue
  epic: '#A855F7',        // Purple
  legendary: '#EAB308',   // Gold
  mythic: '#EF4444',      // Red
};

export const RARITY_NAMES: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
};

export const RARITY_STAT_COUNTS: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
};

// ─── 12 MAPS OF MIDDLE-EARTH ───
export const MAPS: GameMap[] = [
  {
    id: 1,
    name: 'The Shire',
    race: 'men',
    levelRange: [1, 3],
    bossName: 'The Wretched Farmer',
    bossPortrait: '/assets/enemy-orc.jpg',
    background: '/assets/bg-shire.jpg',
    enemyPool: ['fox', 'farmer', 'rat'],
    description: 'Peaceful green hills hiding dark shadows...',
    encountersToBoss: 3,
  },
  {
    id: 2,
    name: 'The Blue Mountains',
    race: 'dwarves',
    levelRange: [4, 6],
    bossName: 'The Cave Troll',
    bossPortrait: '/assets/enemy-troll.jpg',
    background: '/assets/bg-bluemountains.jpg',
    enemyPool: ['bat', 'troll_spawn', 'wolf'],
    description: 'Icy peaks and ancient dwarven holds...',
    encountersToBoss: 4,
  },
  {
    id: 3,
    name: 'Isengard',
    race: 'orcs',
    levelRange: [7, 10],
    bossName: "Saruman's Lieutenant",
    bossPortrait: '/assets/enemy-orc.jpg',
    background: '/assets/bg-isengard.jpg',
    enemyPool: ['uruk', 'warg', 'orc_scout'],
    description: 'The iron fortress of the fallen wizard...',
    encountersToBoss: 5,
  },
  {
    id: 4,
    name: 'Lothlorien',
    race: 'elves',
    levelRange: [11, 15],
    bossName: 'The Ancient Spider',
    bossPortrait: '/assets/enemy-spider.jpg',
    background: '/assets/bg-lothlorien.jpg',
    enemyPool: ['spider', 'shadow_spider', 'entling'],
    description: 'The golden wood harbors ancient darkness...',
    encountersToBoss: 5,
  },
  {
    id: 5,
    name: 'Rohan',
    race: 'men',
    levelRange: [20, 25],
    bossName: 'The Traitorous General',
    bossPortrait: '/assets/enemy-orc.jpg',
    background: '/assets/bg-rohan.jpg',
    enemyPool: ['deserter', 'wild_horse', 'bandit'],
    description: 'The golden plains echo with war drums...',
    encountersToBoss: 6,
  },
  {
    id: 6,
    name: 'The Iron Hills',
    race: 'dwarves',
    levelRange: [26, 32],
    bossName: 'The Forge Master',
    bossPortrait: '/assets/enemy-troll.jpg',
    background: '/assets/bg-ironhills.jpg',
    enemyPool: ['fire_drake', 'lava_golem', 'ash_zombie'],
    description: 'Deep beneath the earth, fires never die...',
    encountersToBoss: 6,
  },
  {
    id: 7,
    name: 'The Black Gate',
    race: 'orcs',
    levelRange: [33, 40],
    bossName: 'The Mouth of Sauron',
    bossPortrait: '/assets/boss-witchking.jpg',
    background: '/assets/bg-blackgate.jpg',
    enemyPool: ['orc_captain', 'fell_beast', 'troll_guard'],
    description: 'The dread entrance to the Land of Shadow...',
    encountersToBoss: 7,
  },
  {
    id: 8,
    name: 'Mirkwood',
    race: 'elves',
    levelRange: [41, 50],
    bossName: 'The Shadow Dragon',
    bossPortrait: '/assets/enemy-spider.jpg',
    background: '/assets/bg-mirkwood.jpg',
    enemyPool: ['giant_spider', 'shadow_bat', 'corrupted_elf'],
    description: 'Even the Elves fear to walk these paths...',
    encountersToBoss: 7,
  },
  {
    id: 9,
    name: 'Gondor',
    race: 'men',
    levelRange: [55, 65],
    bossName: 'The Witch-king of Angmar',
    bossPortrait: '/assets/boss-witchking.jpg',
    background: '/assets/bg-gondor.jpg',
    enemyPool: ['siege_troll', 'orc_raider', 'nazgul_stealth'],
    description: 'The White City stands besieged...',
    encountersToBoss: 8,
  },
  {
    id: 10,
    name: 'Moria',
    race: 'dwarves',
    levelRange: [66, 80],
    bossName: 'The Balrog',
    bossPortrait: '/assets/boss-balrog.jpg',
    background: '/assets/bg-moria.jpg',
    enemyPool: ['goblin_horde', 'cave_swarm', 'dark_dweller'],
    description: 'The abyss stares back in the deep places...',
    encountersToBoss: 8,
  },
  {
    id: 11,
    name: 'Mount Doom',
    race: 'orcs',
    levelRange: [81, 99],
    bossName: 'The Eye of Sauron',
    bossPortrait: '/assets/boss-balrog.jpg',
    background: '/assets/bg-mountdoom.jpg',
    enemyPool: ['fire_elemental', 'ash_zombie_lord', 'flame_wraith'],
    description: 'The fires of creation await their master...',
    encountersToBoss: 9,
  },
  {
    id: 12,
    name: 'The Grey Havens',
    race: 'elves',
    levelRange: [100, 120],
    bossName: 'The Corrupted Maia',
    bossPortrait: '/assets/boss-balrog.jpg',
    background: '/assets/bg-greyhavens.jpg',
    enemyPool: ['fallen_spirit', 'time_wraith', 'void_serpent'],
    description: 'At the edge of the world, fate is forged...',
    encountersToBoss: 10,
  },
];

// ─── ENEMY TEMPLATES ───
export const ENEMY_TEMPLATES: Record<string, Partial<Enemy>> = {
  // The Shire enemies
  fox: { name: 'Rabid Fox', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  farmer: { name: 'Misguided Farmer', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  rat: { name: 'Giant Rat', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  // Blue Mountains enemies
  bat: { name: 'Cave Bat', portrait: '/assets/enemy-spider.jpg', isBoss: false },
  troll_spawn: { name: 'Troll Spawn', portrait: '/assets/enemy-troll.jpg', isBoss: false },
  wolf: { name: 'Snow Wolf', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  // Isengard enemies
  uruk: { name: 'Wild Uruk-hai', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  warg: { name: 'Warg Rider', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  orc_scout: { name: 'Orc Scout', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  // Lothlorien enemies
  spider: { name: 'Shadow Spider', portrait: '/assets/enemy-spider.jpg', isBoss: false },
  shadow_spider: { name: 'Venomous Spider', portrait: '/assets/enemy-spider.jpg', isBoss: false },
  entling: { name: 'Corrupted Entling', portrait: '/assets/enemy-troll.jpg', isBoss: false },
  // Rohan enemies
  deserter: { name: 'Deserter Soldier', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  wild_horse: { name: 'Wild Horse', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  bandit: { name: 'Highway Bandit', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  // Iron Hills enemies
  fire_drake: { name: 'Fire Drake', portrait: '/assets/enemy-spider.jpg', isBoss: false },
  lava_golem: { name: 'Lava Golem', portrait: '/assets/enemy-troll.jpg', isBoss: false },
  ash_zombie: { name: 'Ash Zombie', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  // Black Gate enemies
  orc_captain: { name: 'Orc Captain', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  fell_beast: { name: 'Fell Beast', portrait: '/assets/enemy-spider.jpg', isBoss: false },
  troll_guard: { name: 'Troll Guard', portrait: '/assets/enemy-troll.jpg', isBoss: false },
  // Mirkwood enemies
  giant_spider: { name: 'Giant Spider', portrait: '/assets/enemy-spider.jpg', isBoss: false },
  shadow_bat: { name: 'Shadow Bat', portrait: '/assets/enemy-spider.jpg', isBoss: false },
  corrupted_elf: { name: 'Corrupted Elf', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  // Gondor enemies
  siege_troll: { name: 'Siege Troll', portrait: '/assets/enemy-troll.jpg', isBoss: false },
  orc_raider: { name: 'Orc Raider', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  nazgul_stealth: { name: 'Nazgul Stealth', portrait: '/assets/boss-witchking.jpg', isBoss: false },
  // Moria enemies
  goblin_horde: { name: 'Goblin Horde', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  cave_swarm: { name: 'Cave Swarm', portrait: '/assets/enemy-spider.jpg', isBoss: false },
  dark_dweller: { name: 'Dark Dweller', portrait: '/assets/enemy-troll.jpg', isBoss: false },
  // Mount Doom enemies
  fire_elemental: { name: 'Fire Elemental', portrait: '/assets/boss-balrog.jpg', isBoss: false },
  ash_zombie_lord: { name: 'Ash Zombie Lord', portrait: '/assets/enemy-orc.jpg', isBoss: false },
  flame_wraith: { name: 'Flame Wraith', portrait: '/assets/boss-balrog.jpg', isBoss: false },
  // Grey Havens enemies
  fallen_spirit: { name: 'Fallen Spirit', portrait: '/assets/boss-witchking.jpg', isBoss: false },
  time_wraith: { name: 'Time Wraith', portrait: '/assets/boss-balrog.jpg', isBoss: false },
  void_serpent: { name: 'Void Serpent', portrait: '/assets/enemy-spider.jpg', isBoss: false },
};

// ─── THE 5 ISTARI (WIZARDS) ───
export const WIZARDS: Wizard[] = [
  {
    name: 'Gandalf',
    title: 'the Grey',
    color: '#9CA3AF',
    portrait: '/assets/wizard-gandalf.jpg',
    dialogue: [
      'A wizard is never late, nor is he early. He arrives precisely when he means to.',
      'All we have to decide is what to do with the time that is given us.',
      'Even the smallest person can change the course of the future.',
    ],
    skills: [
      {
        id: 'gandalf_wisdom',
        name: "Gandalf's Wisdom",
        description: 'INT +10, Max Mana +50',
        learned: false,
        source: 'wizard',
        wizardName: 'Gandalf',
        effect: { type: 'passive_stat', target: 'self', stats: { INT: 10, maxMana: 50 } },
      },
      {
        id: 'gandalf_fire',
        name: 'Flame of Anor',
        description: 'Active: Deal 3x Magic Damage to all enemies (30 Mana)',
        learned: false,
        source: 'wizard',
        wizardName: 'Gandalf',
        effect: { type: 'active_damage', target: 'all_enemies', damageMultiplier: 3, manaCost: 30, cooldown: 5 },
      },
    ],
  },
  {
    name: 'Saruman',
    title: 'the White',
    color: '#E5E7EB',
    portrait: '/assets/wizard-gandalf.jpg',
    dialogue: [
      'The old world will burn in the fires of industry.',
      'Knowledge, Rule, Order!',
      'I have seen it.',
    ],
    skills: [
      {
        id: 'saruman_voice',
        name: 'Voice of Saruman',
        description: 'Active: Stun enemy for 2 turns (20 Mana)',
        learned: false,
        source: 'wizard',
        wizardName: 'Saruman',
        effect: { type: 'active_buff', target: 'enemy', manaCost: 20, cooldown: 4 },
      },
      {
        id: 'saruman_industry',
        name: 'Industry of Isengard',
        description: 'STR +8, ATK +15%',
        learned: false,
        source: 'wizard',
        wizardName: 'Saruman',
        effect: { type: 'passive_stat', target: 'self', stats: { STR: 8, atkPercent: 15 } },
      },
    ],
  },
  {
    name: 'Radagast',
    title: 'the Brown',
    color: '#92400E',
    portrait: '/assets/wizard-gandalf.jpg',
    dialogue: [
      'The Greenwood is sick, Gandalf. A darkness has fallen over it.',
      'Nature speaks to those who listen.',
      'The birds bring news from afar.',
    ],
    skills: [
      {
        id: 'radagast_nature',
        name: 'Nature\'s Bounty',
        description: 'VIT +10, Max HP +100, Life Steal +5%',
        learned: false,
        source: 'wizard',
        wizardName: 'Radagast',
        effect: { type: 'passive_stat', target: 'self', stats: { VIT: 10, maxHp: 100, lifeSteal: 5 } },
      },
      {
        id: 'radagast_heal',
        name: 'Healing Herbs',
        description: 'Active: Heal 50% HP (25 Mana)',
        learned: false,
        source: 'wizard',
        wizardName: 'Radagast',
        effect: { type: 'active_heal', target: 'self', damageMultiplier: 0.5, manaCost: 25, cooldown: 6 },
      },
    ],
  },
  {
    name: 'Alatar',
    title: 'the Blue',
    color: '#1E40AF',
    portrait: '/assets/wizard-gandalf.jpg',
    dialogue: [
      'The East holds many secrets unknown to the West.',
      'Darkness grows in the lands beyond the map.',
      'I have walked where no Elf or Man has tread.',
    ],
    skills: [
      {
        id: 'alatar_mystic',
        name: 'Eastern Mysticism',
        description: 'AGI +12, Dodge +8%, Crit Rate +5%',
        learned: false,
        source: 'wizard',
        wizardName: 'Alatar',
        effect: { type: 'passive_stat', target: 'self', stats: { AGI: 12, dodgeChance: 8, critRate: 5 } },
      },
      {
        id: 'alatar_lightning',
        name: 'Storm of the East',
        description: 'Active: Deal 4x Magic Damage (40 Mana)',
        learned: false,
        source: 'wizard',
        wizardName: 'Alatar',
        effect: { type: 'active_damage', target: 'enemy', damageMultiplier: 4, manaCost: 40, cooldown: 5 },
      },
    ],
  },
  {
    name: 'Pallando',
    title: 'the Blue',
    color: '#1E3A5F',
    portrait: '/assets/wizard-gandalf.jpg',
    dialogue: [
      'The South burns with ancient fire.',
      'Some evils sleep, waiting for the right moment to awaken.',
      'I have seen the end of all things.',
    ],
    skills: [
      {
        id: 'pallando_flame',
        name: 'Flames of the South',
        description: 'Magic Power +20, Mana Steal +5%',
        learned: false,
        source: 'wizard',
        wizardName: 'Pallando',
        effect: { type: 'passive_stat', target: 'self', stats: { magicPower: 20, manaSteal: 5 } },
      },
      {
        id: 'pallando_seer',
        name: 'Foresight',
        description: 'LUCK +15, Crit Damage +25%, Block Chance +5%',
        learned: false,
        source: 'wizard',
        wizardName: 'Pallando',
        effect: { type: 'passive_stat', target: 'self', stats: { LUCK: 15, critDamage: 25, blockChance: 5 } },
      },
    ],
  },
];

// ─── EASTER EGG LEGENDARY ITEMS ───
export const EASTER_EGG_ITEMS: Equipment[] = [
  {
    id: 'narsil',
    name: 'Narsil',
    slot: 'weapon',
    rarity: 'mythic',
    itemLevel: 50,
    baseStat: 150,
    bonusStats: [
      { statName: 'STR', value: 20 },
      { statName: 'critRate', value: 15 },
      { statName: 'critDamage', value: 50 },
      { statName: 'atkPercent', value: 25 },
      { statName: 'killChance', value: 5 },
    ],
    icon: '⚔️',
    description: 'The sword of Elendil, reforged from the shards. "I am Anduril, who was Narsil, the sword of Elendil."',
    isEasterEgg: true,
  },
  {
    id: 'sting',
    name: 'Sting',
    slot: 'weapon',
    rarity: 'mythic',
    itemLevel: 25,
    baseStat: 80,
    bonusStats: [
      { statName: 'AGI', value: 25 },
      { statName: 'critRate', value: 20 },
      { statName: 'dodgeChance', value: 10 },
      { statName: 'atk', value: 40 },
      { statName: 'killChance', value: 8 },
    ],
    icon: '🗡️',
    description: '"Sting\'s my name. Let me sing you the song of my people... orcs fleeing in terror!"',
    isEasterEgg: true,
  },
  {
    id: 'mithril_shirt',
    name: 'Mithril Shirt',
    slot: 'armor',
    rarity: 'mythic',
    itemLevel: 40,
    baseStat: 200,
    bonusStats: [
      { statName: 'VIT', value: 15 },
      { statName: 'def', value: 60 },
      { statName: 'blockChance', value: 15 },
      { statName: 'defPercent', value: 20 },
      { statName: 'maxHp', value: 150 },
    ],
    icon: '🛡️',
    description: 'A shirt of Mithril rings. "It\'s worth more than the Shire and everything in it!" - Gandalf',
    isEasterEgg: true,
  },
  {
    id: 'the_one_ring',
    name: 'The One Ring',
    slot: 'accessory',
    rarity: 'mythic',
    itemLevel: 100,
    baseStat: 200,
    bonusStats: [
      { statName: 'INT', value: 30 },
      { statName: 'LUCK', value: 30 },
      { statName: 'magicPower', value: 50 },
      { statName: 'critRate', value: 25 },
      { statName: 'killChance', value: 10 },
    ],
    icon: '💍',
    description: 'One Ring to rule them all, One Ring to find them...',
    isEasterEgg: true,
  },
  {
    id: ' Glamdring',
    name: 'Glamdring',
    slot: 'weapon',
    rarity: 'legendary',
    itemLevel: 45,
    baseStat: 120,
    bonusStats: [
      { statName: 'STR', value: 15 },
      { statName: 'INT', value: 10 },
      { statName: 'magicPower', value: 25 },
      { statName: 'critRate', value: 10 },
    ],
    icon: '⚔️',
    description: 'The Foe-Hammer, found in a troll-hoard. It shines blue when orcs are near.',
    isEasterEgg: true,
  },
  {
    id: 'anduril',
    name: 'Anduril',
    slot: 'weapon',
    rarity: 'mythic',
    itemLevel: 80,
    baseStat: 200,
    bonusStats: [
      { statName: 'STR', value: 30 },
      { statName: 'atk', value: 80 },
      { statName: 'critRate', value: 20 },
      { statName: 'critDamage', value: 40 },
      { statName: 'atkPercent', value: 30 },
    ],
    icon: '🗡️',
    description: 'The Flame of the West, reforged for the King who will return.',
    isEasterEgg: true,
  },
];

// ─── FOLLOWER TEMPLATES ───
export const FOLLOWER_TEMPLATES: Omit<Follower, 'id' | 'level' | 'stats'>[] = [
  {
    name: 'Legolas',
    title: 'the Archer',
    equipment: { weapon: null, shield: null, armor: null, accessory: null },
    skills: [],
    portrait: '/assets/follower-archer.jpg',
    isAlive: true,
  },
  {
    name: 'Gimli',
    title: 'the Dwarf',
    equipment: { weapon: null, shield: null, armor: null, accessory: null },
    skills: [],
    portrait: '/assets/follower-dwarf.jpg',
    isAlive: true,
  },
  {
    name: 'Galadriel',
    title: 'the Wise',
    equipment: { weapon: null, shield: null, armor: null, accessory: null },
    skills: [],
    portrait: '/assets/follower-mage.jpg',
    isAlive: true,
  },
  {
    name: 'Aragorn',
    title: 'the Ranger',
    equipment: { weapon: null, shield: null, armor: null, accessory: null },
    skills: [],
    portrait: '/assets/follower-rogue.jpg',
    isAlive: true,
  },
  {
    name: 'Boromir',
    title: 'the Captain',
    equipment: { weapon: null, shield: null, armor: null, accessory: null },
    skills: [],
    portrait: '/assets/hero-portrait.jpg',
    isAlive: true,
  },
  {
    name: 'Eowyn',
    title: 'the Shieldmaiden',
    equipment: { weapon: null, shield: null, armor: null, accessory: null },
    skills: [],
    portrait: '/assets/follower-archer.jpg',
    isAlive: true,
  },
  {
    name: 'Faramir',
    title: 'the Steward',
    equipment: { weapon: null, shield: null, armor: null, accessory: null },
    skills: [],
    portrait: '/assets/follower-rogue.jpg',
    isAlive: true,
  },
  {
    name: 'Thorin',
    title: 'Oakenshield',
    equipment: { weapon: null, shield: null, armor: null, accessory: null },
    skills: [],
    portrait: '/assets/follower-dwarf.jpg',
    isAlive: true,
  },
];

// ─── EQUIPMENT NAME PREFIXES/SUFFIXES ───
export const WEAPON_PREFIXES = ['Rusty', 'Iron', 'Steel', 'Elven', 'Dwarven', 'Enchanted', 'Ancient', 'Runic', 'Holy', 'Dark'];
export const WEAPON_NAMES = ['Sword', 'Blade', 'Dagger', 'Axe', 'Mace', 'Spear', 'Longsword', 'Rapier', 'Claymore', 'Scimitar'];
export const SHIELD_PREFIXES = ['Wooden', 'Buckler', 'Kite', 'Tower', 'Round', 'Dwarven', 'Elven', 'Runed', 'Sacred', 'Black'];
export const SHIELD_NAMES = ['Shield', 'Buckler', 'Guard', 'Ward', 'Aegis', 'Bulwark', 'Protector', 'Barrier'];
export const ARMOR_PREFIXES = ['Leather', 'Chain', 'Scale', 'Plate', 'Elven', 'Dwarven', 'Shadow', 'Holy', 'Dragon', 'Mithril'];
export const ARMOR_NAMES = ['Armor', 'Mail', 'Vest', 'Plate', 'Cuirass', 'Hauberk', 'Tunic', 'Robe', 'Garments'];
export const ACCESSORY_PREFIXES = ['Simple', 'Glowing', 'Ancient', 'Mystic', 'Golden', 'Silver', 'Crystal', 'Emerald', 'Ruby', 'Sapphire'];
export const ACCESSORY_NAMES = ['Ring', 'Amulet', 'Pendant', 'Talisman', 'Charm', 'Band', 'Circlet', 'Bracelet', 'Medallion'];

// ─── STAT POOL FOR RANDOM ROLLS ───
export const ROLLABLE_STATS = [
  'STR', 'AGI', 'INT', 'LUCK', 'VIT',
  'atk', 'def', 'maxHp', 'maxMana', 'magicPower',
  'dodgeChance', 'accuracy', 'critRate', 'critDamage',
  'atkPercent', 'defPercent', 'lifeSteal', 'manaSteal', 'killChance', 'blockChance',
];

// ─── SLOT BASE STATS ───
export const SLOT_BASE_STAT: Record<EquipmentSlot, string> = {
  weapon: 'atk',
  shield: 'def',
  armor: 'maxHp',
  accessory: 'maxMana',
};

// ─── EXPERIENCE CURVE ───
export function expForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

// ─── GAME BALANCE CONSTANTS ───
export const GAME_CONFIG = {
  STAT_POINTS_PER_LEVEL: 5,
  BASE_HP: 100,
  BASE_MANA: 50,
  HP_PER_VIT: 10,
  DEF_PER_VIT: 0.5,
  ATK_PER_STR: 1,
  MANA_PER_INT: 5,
  MAGIC_POWER_PER_INT: 1,
  DODGE_PER_AGI: 0.5,
  ACCURACY_PER_AGI: 0.5,
  CRIT_RATE_PER_LUCK: 0.3,
  CRIT_DAMAGE_PER_LUCK: 1,
  BASE_CRIT_DAMAGE: 150,
  MAX_FOLLOWERS: 4,
  INVENTORY_SIZE: 40,
  BASE_DODGE: 5,
  BASE_ACCURACY: 95,
  BOSS_HP_MULTIPLIER: 5,
  BOSS_ATK_MULTIPLIER: 2,
  LOOT_CHANCE_BASE: 0.6,
  WIZARD_CHANCE: 0.08,
  FOLLOWER_CHANCE: 0.05,
  EASTER_EGG_CHANCE: 0.005,
};
