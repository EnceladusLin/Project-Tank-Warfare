

import { Faction, TankClass } from "./types";

export const TILE_SIZE = 40;
export const MAP_WIDTH = 120;
export const MAP_HEIGHT = 80;
export const WORLD_WIDTH = MAP_WIDTH * TILE_SIZE;
export const WORLD_HEIGHT = MAP_HEIGHT * TILE_SIZE;

// NEON HORIZON PALETTE (Unified Faction Standards)
export const COLORS = {
  // Factions
  [Faction.BLUE]: '#00ccff',   // Cyber Guardian (Neon Cyan)
  [Faction.RED]: '#ff3333',    // Crimson Raider (High Alert Red)
  [Faction.GREEN]: '#33ff33',  // Toxic Vanguard (Radioactive Green)
  [Faction.PURPLE]: '#cc00ff', // Void Walker (Plasma Purple)
  [Faction.NEUTRAL]: '#fff700',// Neutral/Hazard (Industrial Yellow)
  
  // Environment
  BG: '#050505',               // Deep Void
  GRID: '#0a1a2a',             // Data Grid
  
  // Terrain
  WALL: '#8B4513',             // Earth Wall (Brown) - Destructible
  STEEL: '#708090',            // Iron Wall (Slate Grey) - Indestructible
  WATER: '#0077be',            // River (Blue)
  FOREST: '#006400',           // Forest (Dark Green)
  ICE: '#ffffff'
};

// FUTURE CITY HOLOGRAPHIC FLOOR PALETTE
export const FLOOR_COLORS = {
    BASE_BG: '#0A0A12',
    GRID_MAIN: 'rgba(0, 255, 255, 0.3)', // Neon Cyan 30%
    GRID_ACCENT: 'rgba(255, 0, 255, 0.5)', // Magenta
    NODE: '#FFFFFF',
    CHANNEL: '#00FFFF', // Opaque Cyan
    
    // Zones
    ZONE_BLUE: 'rgba(0, 153, 255, 0.15)',
    ZONE_RED: 'rgba(255, 0, 0, 0.15)',
    ZONE_GREEN: 'rgba(51, 255, 51, 0.15)',
    ZONE_PURPLE: 'rgba(204, 0, 255, 0.15)',
    ZONE_NEUTRAL: 'rgba(0, 255, 255, 0.05)',
    ZONE_ARENA: 'rgba(255, 215, 0, 0.15)', // Gold
    
    // Effects
    SCAN_WAVE: 'rgba(0, 255, 255, 0.5)',
    DATA_PACKET: '#FFFFFF',
    DATA_TRAIL: '#00FFFF',
    RIPPLE: 'rgba(0, 255, 255, 0.4)',
    TRACK: 'rgba(0, 255, 255, 0.2)',
    CRATER_GLITCH: 'rgba(255, 0, 0, 0.6)'
};

export const BASES = [
  { faction: Faction.RED, x: 60, y: 10 },    // Top
  { faction: Faction.BLUE, x: 60, y: 70 },   // Bottom
  { faction: Faction.GREEN, x: 10, y: 40 },  // Left
  { faction: Faction.PURPLE, x: 110, y: 40 } // Right
];

export const HUB_POS = { x: 60, y: 40 };

export const GAME_DURATION = 480; // seconds
export const WEATHER_DURATION = 120;
export const WEATHER_TRANSITION = 5;

// Physics
export const GLOBAL_SPEED_MOD = 1.0; 

// Base Speeds (Pixels per second) - Reduced by 10% (cumulative with previous reduction)
// Previous Normal was 1011 -> Now ~910
export const TANK_SPEEDS = {
  [TankClass.NORMAL]: 910,
  [TankClass.FLASHER]: 975,
  [TankClass.FREEZER]: 845,
  [TankClass.SMOKE]: 780,
  [TankClass.BOMBER]: 650,
  [TankClass.BOSS_OVERLORD]: 715,
  [TankClass.BOSS_RED]: 585,
  [TankClass.BOSS_BLUE]: 1040,
  [TankClass.GUARDIAN_RED]: 650,
  [TankClass.GUARDIAN_BLUE]: 650,
};

export const SPEED_MODS = {
  TURBO: 1.15,
  RAGE: 1.3,
  PERM_SPEED: 1.5,
  BUFF_BLUE: 1.5, 
  ICE_PLATE: 1.25, // Frozen water speed boost
  SNOW_DRIFT: 0.85, // Snow in forest slow
  FOREST: 1.3 // Standard Forest Speed (when not frozen)
};

export const ROTATION_SPEED = 4;
export const FRICTION = 0.92;
export const ICE_FRICTION = 0.98; // Slightly less slippery than pure ice
export const RAIN_FRICTION = 0.6; 

// Stats 
export const HP_CONFIG = {
  BASE: 3750,
  OVERLORD: 10000,
  BOSS: 1875,
  GUARDIAN: 3750,
  PLAYER: 1250,
  MOB: 125,
  ELITE: 170
};

export const HEALTH_PACK_CONFIG = {
  VALUE: 250,
  RADIUS: 25,
  SPAWN_GLOBAL: 45.0,
  SPAWN_BASE: 60.0,
  MAX_GLOBAL: 5
};

export const PLAYER_REGEN = {
  DELAY: 3.0, 
  AMOUNT: 50 
};

// Weapons
export const WEAPON_CONFIG = {
  // Cannon - Damage buffed +5% (40 -> 42), Splash added logic in engine
  0: { damage: 42, delay: 0.21, heat: 13.5, speed: 600, range: 800, burst: 1 }, 
  // Laser
  1: { damage: 40, delay: 0.273, heat: 13.5, speed: 800, range: 880, burst: 1 }, 
  // MG
  2: { damage: 18.75, delay: 0.069, heat: 9.0, speed: 900, range: 480, burst: 3 }, 
  // Mine
  4: { damage: 135, delay: 3.15, heat: 0, speed: 0, range: 0, burst: 1 } 
};

export const CANNON_SPLASH_RADIUS = 60; // Base splash (increased by 25% logic in engine)

export const MISSILE_CONFIG = {
  damage: 135,
  radius: 70, 
  speed: 300, 
  maxAmmo: 3,
  reloadTime: 5.0
};

export const HEAT_CONFIG = {
  MAX: 100,
  DISSIPATION: 30,
  DISSIPATION_FREEZE_MOD: 0.7, 
  MG_LOCK_PENALTY: 3.0 
};

export const SKILL_CD = {
  DASH: 10.0,
  EMP: 15.0,
  RAGE: 180.0,
  TURBO: 3.0,
  TURBO_DURATION: 10.0,
  SHIELD: 8.0, 
  SHIELD_DURATION: 2.0 
};

// Enemy Class Configs
export const AURA_RADIUS = 250;
export const FREEZER_SLOW = 0.5;
export const FLASHER_CD = 8.0;
export const SMOKE_DAMAGE = 2; 

// Hub Config
export const HUB_CONFIG = {
    RADIUS: 150,
    CAPTURE_RATE: 10, 
    DECAY_RATE: 5, 
    BUFF_REPAIR: 50, 
    BUFF_REPAIR_INTERVAL: 10.0,
    BUFF_RELOAD_MOD: 0.75 
};

// Buff Guardians
export const BUFF_CONFIG = {
    SPAWN_INITIAL: 60.0,
    RESPAWN_DELAY: 120.0,
    BURN_DAMAGE: 15, 
    SPEED_BOOST: 1.5
};

export const GUARDIAN_SPAWNS = [
    { x: 10, y: 10 },    // Top Left
    { x: 110, y: 10 },    // Top Right
    { x: 10, y: 70 },     // Bottom Left
    { x: 110, y: 70 }    // Bottom Right
];

// Lockdown Locations
export const LOCKDOWN_ZONES = [
    // Buffs (Radius 6)
    { x: 50, y: 20, r: 6, time: 60, type: 'BUFF' }, // Smoke
    { x: 70, y: 60, r: 6, time: 60, type: 'BUFF' }, // Bomber
    { x: 30, y: 40, r: 6, time: 60, type: 'BUFF' }, // Freezer
    { x: 90, y: 40, r: 6, time: 60, type: 'BUFF' }, // Flasher
    // Bosses (Radius 8-10)
    { x: 20, y: 20, r: 8, time: 200, type: 'BOSS' }, // Red 1
    { x: 100, y: 20, r: 8, time: 200, type: 'BOSS' }, // Blue 1
    { x: 20, y: 60, r: 8, time: 200, type: 'BOSS' }, // Blue 2
    { x: 100, y: 60, r: 8, time: 200, type: 'BOSS' }, // Red 2
    { x: 60, y: 40, r: 10, time: 200, type: 'BOSS' }  // Overlord
];

export const AI_PATROL_POINTS = [
    { x: 60, y: 25 }, // Top Mid
    { x: 80, y: 30 }, // TR
    { x: 40, y: 30 }, // TL
    { x: 60, y: 40 }  // Hub
];
