
export enum GameState {
  MENU,
  PLAYING,
  PAUSED,
  GAME_OVER,
  RESTARTING
}

export enum Faction {
  BLUE = 'BLUE',
  RED = 'RED',
  GREEN = 'GREEN',
  PURPLE = 'PURPLE',
  NEUTRAL = 'NEUTRAL'
}

export enum TileType {
  EMPTY = 0,
  WALL = 1,   // Destructible (Energy Barrier)
  STEEL = 2,  // Indestructible (Obsidian)
  WATER = 3,  // Plasma Stream
  FOREST = 4, // Holo Crystals
  BASE = 9
}

export enum WeatherType {
  CLEAR = 'CLEAR',
  ION_STORM = 'ION_STORM',
  THUNDERSTORM = 'THUNDERSTORM',
  FREEZE = 'FREEZE'
}

export enum WeaponType {
  CANNON = 0,
  LASER = 1,
  MACHINE_GUN = 2,
  MISSILE = 3,
  MINE = 4
}

export enum TankClass {
  NORMAL = 'NORMAL',
  SMOKE = 'SMOKE',
  BOMBER = 'BOMBER',
  FREEZER = 'FREEZER',
  FLASHER = 'FLASHER',
  BOSS_RED = 'BOSS_RED',
  BOSS_BLUE = 'BOSS_BLUE',
  BOSS_OVERLORD = 'BOSS_OVERLORD',
  GUARDIAN_RED = 'GUARDIAN_RED',
  GUARDIAN_BLUE = 'GUARDIAN_BLUE'
}

export enum AIState {
  AGGRESSIVE = 'AGGRESSIVE',
  TACTICAL = 'TACTICAL',
  SURVIVAL = 'SURVIVAL',
  SUPPORT = 'SUPPORT',
  STUCK = 'STUCK',
  EXPLORING = 'EXPLORING'
}

export enum GameOverPhase {
  NONE,
  SLOW_MOTION,   // Phase 1: Impact/Explosion
  ANIMATION,     // Phase 2: Glitch/Overlay
  TEXT_REVEAL,   // Phase 3: Victory/Defeat Text
  STATS,         // Phase 4: Stats counting
  WAITING        // Phase 5: Waiting for input
}

export enum RespawnPhase {
  IDLE,
  DEATH_CAM,    // 1.5s - Glitch, desaturate, text
  FADE_OUT,     // 0.3s - Black screen
  OMEN,         // 0.8s - Hex circle, light pillar, high camera
  MATERIALIZE,  // 1.2s - Wireframe, camera descend
  ACTIVATION,   // 0.5s - Burst, player alive
  READY         // 0.5s - Shield, HUD on
}

export interface GameResult {
  winner: Faction;
  kills: number;
  deaths: number;
  timeSurvived: number;
  basesDestroyed: number;
  rating: 'S' | 'A' | 'B' | 'C';
}

export interface AIMemory {
  lastKnownPlayerPos: Point | null;
  state: AIState;
  stateTimer: number;
  strafeDir: number; // 1 or -1
  strafeTimer: number;
  lastPos: Point;
  stuckCheckTimer: number;
  explorationTimer: number;
  patrolIndex: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Entity extends Point {
  id: string;
  radius: number;
  vx: number;
  vy: number;
  angle: number;
  dead: boolean;
}

export interface HealthPack extends Entity {
  spawnTime: number;
  baseY: number; // For floating animation
  value: number;
}

export interface Decal extends Point {
  id: string;
  type: 'scorch' | 'frost' | 'acid' | 'crater';
  scale: number;
  life: number;
  maxLife: number;
  rotation: number;
  opacity: number;
}

export interface Particle extends Entity {
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'spark' | 'smoke' | 'fire' | 'text' | 'shockwave' | 'ghost' | 'debris' | 'ring' | 'line' | 'muzzle' | 'star' | 'track' | 'hazard' | 'decoy' | 'snowflake' | 'heal' | 'electric' | 'orb' | 'rain' | 'glitch' | 'lens_flare' | 'data_bit';
  text?: string;
  alpha?: number;
  decay?: number;
  rotation?: number;
  rotationSpeed?: number;
  width?: number;
  gravity?: number;
  friction?: number;
  isHazard?: boolean;
  damage?: number;
  faction?: Faction;
  // Ghost Trail specific
  ghostSprite?: {
      tankClass: TankClass;
      angle: number;
      turretAngle: number;
      color: string;
  };
}

export interface BaseStats {
  hp: number;
  maxHp: number;
  faction: Faction;
  pos: Point;
  active: boolean;
  turretCooldown: number;
  turretAngle: number;
  visualTimer: number;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  heat: number;
  maxHeat: number;
  ammo: number;
  maxAmmo: number;
  kills: number;
  deaths: number;
  assists: number;
  weapon: WeaponType;
  skills: {
    dashCD: number;
    empCD: number;
    rageCD: number;
    turboCD: number;
    shieldCD: number;
    nukeAvailable: boolean;
  };
  buffs: {
    rageTime: number;
    shieldTime: number;
    turboTime: number;
    fireAmmo: boolean;
    permFire: boolean;
    permSpeed: boolean;
    buffRed: boolean; // Burning Core
    buffBlue: boolean; // Superconductive Engine
  };
  status: {
    frozen: boolean;
    silenced: boolean;
    blind: boolean;
    burned: boolean;
  };
  dead: boolean;
  canRespawn: boolean;
  overheated: boolean;
  killerName?: string; // Who killed the player
}

export interface Tank extends Entity {
  faction: Faction;
  tankClass: TankClass;
  hp: number;
  maxHp: number;
  turretAngle: number;
  cooldown: number;
  weapon: WeaponType;
  heat: number;
  overheated: boolean;
  targetX?: number;
  targetY?: number;
  moveX: number;
  moveY: number;
  shoot: boolean;
  isPlayer: boolean;
  isBoss: boolean;
  isInvisible: boolean;
  stealthTimer: number;
  lastCombatTime: number;
  lastDamageTime: number;
  isAggro: boolean;
  aggroTimer: number;
  aiMemory?: AIMemory;
  shield: number;
  rage: number;
  ccImmunity: number;
  burn: number;
  freeze: number;
  silence: number;
  blind: number;
  turboCD: number;
  turboTime: number;
  dashCD: number;
  empCD: number;
  rageCD: number;
  shieldCD: number;
  nukeUnlocked: boolean;
  permFire: boolean;
  permSpeed: boolean;
  missileAmmo: number;
  missileReload: number;
  empCharge: number;
  recoilX: number;
  recoilY: number;
  prevWeapon: WeaponType;
  weaponSwitchAnim: number;
  visualTimer: number;
  specialCD: number;
  phase: number;
  phaseTimer: number;
  
  // Buff System
  buffRed: boolean;
  buffBlue: boolean;
}

export interface HubStats {
  active: boolean;
  owner: Faction;
  progress: number;
  repairTimer: number;
  state: 'NEUTRAL' | 'CAPTURING' | 'CONTESTED' | 'SECURED';
}

export interface RadarEntity {
  x: number;
  y: number;
  faction: Faction;
  type: 'TANK' | 'BOSS' | 'BASE' | 'HUB' | 'ITEM' | 'GUARDIAN';
  isPlayer: boolean;
}

export interface RadarData {
  entities: RadarEntity[];
  cameraRect: { x: number, y: number, w: number, h: number };
}

export interface KillFeedMessage {
    id: string;
    killer: string;
    victim: string;
    killerFaction: Faction;
    victimFaction: Faction;
    time: number;
}
