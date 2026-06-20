// ═══════════════════════════════════════════════════════════
//  THE ONE RING CHRONICLES - TYPE DEFINITIONS
//  Middle-earth RPG - Complete Type System
// ═══════════════════════════════════════════════════════════

// ─── Core Stats ───
export interface CoreStats {
  STR: number;  // Strength - affects Attack
  AGI: number;  // Agility - affects Dodge & Accuracy
  INT: number;  // Intelligence - affects Magic Power & Max Mana
  LUCK: number; // Luck - affects Crit Rate & Crit Damage
  VIT: number;  // Vitality - affects Max HP & Defense
}

// ─── Derived Stats ───
export interface DerivedStats {
  atk: number;
  def: number;
  maxHp: number;
  maxMana: number;
  magicPower: number;
  dodgeChance: number;   // 0-100%
  accuracy: number;      // 0-100%
  critRate: number;      // 0-100%
  critDamage: number;    // percentage (150 = 150%)
}

// ─── Special Bonus Stats (only from gear/passives) ───
export interface BonusStats {
  atkPercent: number;    // % bonus to ATK
  defPercent: number;    // % bonus to DEF
  lifeSteal: number;     // % of damage healed
  manaSteal: number;     // % of damage converted to mana
  killChance: number;    // % chance to insta-kill non-boss
  blockChance: number;   // % chance to block (100% mitigation)
}

// ─── Combined Character Stats ───
export interface CharacterStats extends CoreStats, DerivedStats, BonusStats {
  currentHp: number;
  currentMana: number;
}

// ─── Equipment ───
export type EquipmentSlot = 'weapon' | 'shield' | 'armor' | 'accessory';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface ItemStat {
  statName: string;
  value: number;
}

export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: Rarity;
  itemLevel: number;
  baseStat: number;      // base value for the slot's primary stat
  bonusStats: ItemStat[];
  icon: string;          // emoji/icon representation
  description?: string;
  isEasterEgg?: boolean;
}

// ─── Skill ───
export interface Skill {
  id: string;
  name: string;
  description: string;
  effect: SkillEffect;
  learned: boolean;
  source: 'wizard' | 'tome';
  wizardName?: string;   // which of the 5 Istari taught this
}

export interface SkillEffect {
  type: 'passive_stat' | 'active_damage' | 'active_heal' | 'active_buff';
  stats?: Partial<CharacterStats>;
  damageMultiplier?: number;
  manaCost?: number;
  cooldown?: number;
  target: 'self' | 'enemy' | 'all_enemies';
}

// ─── Follower ───
export interface Follower {
  id: string;
  name: string;
  title: string;
  level: number;
  stats: CharacterStats;
  equipment: Record<EquipmentSlot, Equipment | null>;
  skills: Skill[];
  portrait: string;
  isAlive: boolean;
}

// ─── Enemy ───
export interface Enemy {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  isBoss: boolean;
  portrait: string;
  lootTable: Rarity[];
  expReward: number;
  goldReward: number;
}

// ─── Map Definition ───
export type RaceType = 'men' | 'dwarves' | 'orcs' | 'elves';

export interface GameMap {
  id: number;
  name: string;
  race: RaceType;
  levelRange: [number, number];
  bossName: string;
  bossPortrait: string;
  background: string;
  enemyPool: string[];    // enemy IDs that can spawn
  description: string;
  encountersToBoss: number;
}

// ─── Wizard (Istari) ───
export interface Wizard {
  name: string;
  title: string;
  color: string;
  portrait: string;
  skills: Skill[];
  dialogue: string[];
}

// ─── Combat State ───
export interface CombatState {
  isActive: boolean;
  enemies: Enemy[];
  currentTurn: number;
  combatLog: string[];
  playerActionPending: boolean;
  selectedSkill: string | null;
  lootDropped: Equipment[];
  expGained: number;
  goldGained: number;
}

// ─── Event Types ───
export type MapEventType = 'combat' | 'wizard' | 'loot' | 'follower' | 'boss';

export interface MapEvent {
  type: MapEventType;
  data?: Wizard | Equipment | Follower | Enemy[];
  message: string;
}

// ─── Player State ───
export interface PlayerState {
  name: string;
  level: number;
  exp: number;
  expToNext: number;
  statPoints: number;
  baseStats: CoreStats;
  totalStats: CharacterStats;
  equipment: Record<EquipmentSlot, Equipment | null>;
  inventory: Equipment[];
  skills: Skill[];
  followers: Follower[];
  gold: number;
  currentMap: number;
  mapsUnlocked: number;
  totalKills: number;
  bossesDefeated: number;
  playTime: number;
}

// ─── Game Screen State ───
export type GameScreen = 
  | 'title' 
  | 'character_creation' 
  | 'town_hub' 
  | 'map_select'
  | 'exploration' 
  | 'combat' 
  | 'inventory' 
  | 'skills'
  | 'followers'
  | 'wizard_event'
  | 'loot_screen'
  | 'game_over'
  | 'victory';

// ─── Game State ───
export interface GameState {
  screen: GameScreen;
  player: PlayerState;
  combat: CombatState;
  currentEvent: MapEvent | null;
  currentMapProgress: number;
  settings: GameSettings;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  autoSave: boolean;
}

// ─── Floating Text for Combat ───
export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  startTime: number;
}
