import React, { useState, useRef, useEffect, memo } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { TerminalBoot } from './components/TerminalBoot';
import { BaseStats, PlayerStats, WeatherType, Faction, WeaponType, RadarData, HubStats, KillFeedMessage, GameResult, GameOverPhase, RespawnPhase } from './types';
import { COLORS, WORLD_WIDTH, WORLD_HEIGHT, SKILL_CD } from './constants';
import { soundManager } from './services/SoundManager';

// --- UTILITY COMPONENTS ---

const ScrollingDataBG = memo(() => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if(!ctx) return;
        let frameId = 0;
        const fontSize = 10;
        const columns = Math.ceil(300 / fontSize);
        const drops = Array(columns).fill(0).map(() => Math.random() * 100);
        
        const draw = () => {
            ctx.clearRect(0, 0, 300, 150);
            ctx.fillStyle = 'rgba(0, 243, 255, 0.15)'; 
            ctx.font = `${fontSize}px monospace`;
            
            for(let i=0; i<drops.length; i++) {
                const text = Math.random() > 0.5 ? '1' : '0';
                ctx.fillText(text, i*fontSize, drops[i]*fontSize);
                if(drops[i]*fontSize > 150 && Math.random() > 0.975) drops[i] = 0;
                drops[i] += 0.5; 
            }
            frameId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(frameId);
    }, []);
    return <canvas ref={canvasRef} width={300} height={150} className="absolute inset-0 w-full h-full opacity-30 pointer-events-none scrolling-data-bg" />;
});

// --- HUD COMPONENTS ---

const TacticalDisplay = memo(({ stats, radarData, weather }: { stats: PlayerStats, radarData: RadarData | null, weather: WeatherType }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!radarData || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        
        const size = 220; const cx = size / 2; const cy = size / 2; const radius = 90;
        const scaleX = size / WORLD_WIDTH; const scaleY = size / WORLD_HEIGHT; 

        ctx.clearRect(0, 0, size, size);

        const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, radius);
        grad.addColorStop(0, 'rgba(0, 243, 255, 0.05)'); grad.addColorStop(0.8, 'rgba(0, 50, 80, 0.4)'); grad.addColorStop(1, 'rgba(0, 243, 255, 0.1)');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = 'rgba(0, 243, 255, 0.2)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, radius * 0.33, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, radius * 0.66, 0, Math.PI*2); ctx.stroke();
        
        ctx.beginPath(); ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius); ctx.stroke();

        const time = Date.now() / 2000; const angle = (time % 1) * Math.PI * 2;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
        const scanGrad = ctx.createLinearGradient(0, 0, radius, 0);
        scanGrad.addColorStop(0, 'rgba(0, 243, 255, 0)'); scanGrad.addColorStop(1, 'rgba(0, 243, 255, 0.8)');
        ctx.strokeStyle = scanGrad; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(radius, 0); ctx.stroke();
        
        const fanGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        fanGrad.addColorStop(0, 'rgba(0, 243, 255, 0.2)'); fanGrad.addColorStop(1, 'rgba(0, 243, 255, 0)');
        ctx.fillStyle = fanGrad; ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0, radius, 0, 0.5); ctx.fill();
        ctx.restore();

        radarData.entities.forEach(e => {
            const x = e.x * scaleX; const y = e.y * scaleY;
            let jx = 0; let jy = 0;
            if (weather === WeatherType.ION_STORM) { jx = (Math.random()-0.5) * 2; jy = (Math.random()-0.5) * 2; }

            if (e.isPlayer) {
                ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 5;
                ctx.beginPath(); ctx.moveTo(x, y-4); ctx.lineTo(x+3, y+3); ctx.lineTo(x-3, y+3); ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                let color = '#fff'; let size = 2;
                if (e.type === 'BASE') { color = COLORS[e.faction]; size = 4; }
                else if (e.type === 'HUB') { color = '#fff'; size = 3; }
                else if (e.type === 'BOSS' || e.type === 'GUARDIAN') { color = '#f00'; size = 4; }
                else if (e.faction !== Faction.BLUE) color = '#f00'; else color = '#0ff';
                ctx.fillStyle = color;
                ctx.beginPath(); ctx.arc(x+jx, y+jy, size, 0, Math.PI*2); ctx.fill();
            }
        });
    }, [radarData, weather]);

    const hpPct = Math.max(0, stats.hp / stats.maxHp);
    let hpColor = 'var(--hud-cyan)';
    if(hpPct < 0.5) hpColor = 'var(--hud-amber)';
    if(hpPct < 0.25) hpColor = 'var(--hud-red)';

    const radius = 100; const circumference = 2 * Math.PI * radius; const dashOffset = circumference * (1 - hpPct);

    return (
        <div className="absolute bottom-8 left-8 z-30 pointer-events-auto flex items-end">
            <div className="relative w-[220px] h-[220px]">
                <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-48 h-4 bg-gradient-to-t from-[var(--hud-cyan)]/20 to-transparent blur-md"></div>
                <canvas ref={canvasRef} width={220} height={220} className="absolute inset-0 z-10" />
                <svg className="absolute inset-0 z-20 overflow-visible" width="220" height="220" viewBox="0 0 220 220">
                    <defs><filter id="glow-ring"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                    <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(0, 50, 80, 0.5)" strokeWidth="4" />
                    <circle cx="110" cy="110" r={radius} fill="none" stroke={hpColor} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90 110 110)" filter="url(#glow-ring)" className="transition-all duration-300" />
                    {stats.buffs.shieldTime > 0 && <circle cx="110" cy="110" r={radius + 8} fill="none" stroke="var(--hud-blue)" strokeWidth="2" strokeDasharray="10 5" filter="url(#glow-ring)" className="animate-[spin_4s_linear_infinite]" />}
                </svg>
            </div>
            <div className="ml-4 mb-4 flex flex-col justify-end min-w-[180px]">
                <div className="glass-panel p-4 flex flex-col border-l-4 border-[var(--hud-cyan)] bg-black/60 backdrop-blur-md">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[10px] text-gray-400 font-mono">HULL INTEGRITY</span>
                        <span className="text-[10px] text-[var(--hud-cyan)] font-mono">{Math.floor(hpPct*100)}%</span>
                    </div>
                    <span className="text-4xl font-ocr font-bold text-white neon-text leading-none">{Math.ceil(stats.hp)}</span>
                    <div className="text-[9px] text-[var(--hud-cyan)]/60 font-tech mt-1">SYSTEM STATUS: NOMINAL</div>
                </div>
                <div className="mt-2 w-full h-4 bg-gray-900 border border-[var(--hud-cyan-dim)] relative overflow-hidden shadow-[0_0_10px_rgba(0,255,255,0.2)]">
                    <div className="h-full bg-gradient-to-r from-[var(--hud-red)] via-[var(--hud-amber)] to-[var(--hud-cyan)] transition-all duration-300 relative" style={{ width: `${hpPct * 100}%` }}>
                         <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                    </div>
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_90%,rgba(0,0,0,0.8)_100%)] bg-[length:10px_100%]" />
                </div>
                {stats.buffs.shieldTime > 0 && <div className="mt-1 w-full h-1 bg-[var(--hud-blue)] animate-pulse shadow-[0_0_10px_#0077ff]" />}
            </div>
        </div>
    );
}, (prev, next) => {
    // Optimization: Shallow compare relevant props to prevent excess renders
    return (
        prev.weather === next.weather &&
        Math.abs(prev.stats.hp - next.stats.hp) < 1 &&
        prev.stats.buffs.shieldTime === next.stats.buffs.shieldTime &&
        prev.radarData === next.radarData // Reference check is fine if engine creates new ref only on change, but engine creates new ref every frame.
        // GameEngine creates new radarData every frame, so this will re-render every frame.
        // However, React.memo mainly helps if parents re-render but props didn't change. 
        // Since props change every frame, this is purely to prevent renders if somehow props WERE same.
    );
});

const WeaponSystems = memo(({ stats }: { stats: PlayerStats }) => {
    const isOverheat = stats.heat >= 100;
    return (
        <div className="absolute bottom-8 right-8 z-30 pointer-events-auto flex flex-col items-end">
            <div className="flex items-center space-x-1 mb-[-1px] mr-4 z-10">
                <div className="h-2 w-16 bg-[var(--hud-cyan)]"></div>
                <div className="px-3 py-1 bg-[var(--hud-glass)] border border-[var(--hud-border)] border-b-0 text-[10px] font-tech text-[var(--hud-cyan)]">WPN_SYS_V4</div>
            </div>
            <div className="glass-panel clip-corner-cut p-5 w-[340px] relative overflow-hidden">
                <ScrollingDataBG />
                <div className="relative z-10 flex justify-between items-end">
                    <div className="flex flex-col">
                        <div className="flex items-baseline space-x-2">
                            <span className="text-4xl font-ocr font-bold text-white neon-text">
                                {stats.weapon === WeaponType.CANNON ? '120MM' : stats.weapon === WeaponType.LASER ? 'ION' : 'GAUSS'}
                            </span>
                            <span className="text-xs text-[var(--hud-cyan)] font-tech tracking-wider">
                                {stats.weapon === WeaponType.CANNON ? 'AP-SHELL' : stats.weapon === WeaponType.LASER ? 'BEAM' : 'PDW'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                             <div className={`text-[10px] px-1 border ${stats.weapon===0 ? 'border-[var(--hud-cyan)] bg-[var(--hud-cyan)]/20 text-white' : 'border-gray-700 text-gray-600'}`}>1</div>
                             <div className={`text-[10px] px-1 border ${stats.weapon===1 ? 'border-[var(--hud-cyan)] bg-[var(--hud-cyan)]/20 text-white' : 'border-gray-700 text-gray-600'}`}>2</div>
                             <div className={`text-[10px] px-1 border ${stats.weapon===2 ? 'border-[var(--hud-cyan)] bg-[var(--hud-cyan)]/20 text-white' : 'border-gray-700 text-gray-600'}`}>3</div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end space-y-3">
                         <div className="flex flex-col items-end w-[140px]">
                             <div className="flex justify-between w-full text-[9px] text-[var(--hud-cyan)] font-mono mb-1">
                                 <span>THERMAL</span>
                                 <span className={isOverheat ? 'text-[var(--hud-red)] animate-flash-red' : ''}>{Math.floor(stats.heat)}%</span>
                             </div>
                             <div className="w-full h-2 bg-black/50 border border-[var(--hud-cyan-dim)] skew-x-[-20deg]">
                                 <div className={`h-full transition-all duration-100 ${isOverheat ? 'bg-[var(--hud-red)]' : 'bg-gradient-to-r from-[var(--hud-cyan)] to-[var(--hud-blue)]'}`} style={{ width: `${Math.min(100, stats.heat)}%` }} />
                             </div>
                         </div>
                         <div className="flex flex-col items-end">
                             <span className="text-[9px] text-[var(--hud-amber)] font-mono mb-1">SECONDARY_ORDNANCE</span>
                             <div className="flex space-x-1">
                                 {[0,1,2].map(i => (
                                     <div key={i} className={`w-3 h-3 border border-[var(--hud-amber)] transform rotate-45 ${i < stats.ammo ? 'bg-[var(--hud-amber)] shadow-[0_0_5px_orange]' : 'opacity-20'}`}></div>
                                 ))}
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}, (prev, next) => {
    return (
        prev.stats.heat === next.stats.heat &&
        prev.stats.ammo === next.stats.ammo &&
        prev.stats.weapon === next.stats.weapon
    );
});

const SkillTrapezoid = memo(({ skill, idx }: { skill: any, idx: number }) => {
    return (
        <div className={`relative group w-14 h-10 mx-1 transition-all duration-300 ${skill.active ? 'transform -translate-y-2' : ''}`}>
             <div className={`absolute inset-0 clip-trapezoid-up ${skill.locked ? 'bg-gray-900/80 grayscale' : (skill.active ? 'bg-[var(--hud-cyan)]' : 'bg-[var(--hud-glass)]')} border-t-2 ${skill.active ? 'border-white' : 'border-[var(--hud-cyan)]'} flex flex-col items-center justify-center backdrop-blur-sm transition-colors duration-200`}>
                 <span className={`text-[9px] font-bold font-tech ${skill.active ? 'text-black' : 'text-[var(--hud-cyan)]'}`}>{skill.name}</span>
                 <span className={`text-[7px] font-mono ${skill.active ? 'text-black' : 'text-gray-400'}`}>[{skill.key}]</span>
                 {skill.cd > 0 && (
                     <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                         <span className="text-[var(--hud-cyan)] font-mono font-bold text-xs">{Math.ceil(skill.cd)}</span>
                     </div>
                 )}
                 {skill.locked && (
                     <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/60"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div></div>
                 )}
             </div>
             {skill.active && <div className="absolute -bottom-2 left-0 w-full h-4 bg-[var(--hud-cyan)] blur-md opacity-60"></div>}
        </div>
    );
});

const SkillBar = memo(({ stats }: { stats: PlayerStats }) => {
    const skills = [
        { key: 'SHFT', name: 'TURBO', cd: stats.skills.turboCD, active: stats.buffs.turboTime > 0 },
        { key: 'Q', name: 'DASH', cd: stats.skills.dashCD, active: false },
        { key: 'SPC', name: 'SHIELD', cd: stats.skills.shieldCD, active: stats.buffs.shieldTime > 0 },
        { key: 'F', name: 'EMP', cd: stats.skills.empCD, active: false },
        { key: 'C', name: 'RAGE', cd: stats.skills.rageCD, active: stats.buffs.rageTime > 0 },
        { key: 'B', name: 'NUKE', cd: 0, active: false, locked: !stats.skills.nukeAvailable }
    ];
    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end z-30 pointer-events-auto opacity-90 hover:opacity-100 transition-opacity">
            {skills.map((s, i) => <SkillTrapezoid key={i} skill={s} idx={i} />)}
        </div>
    );
}, (prev, next) => {
    // Only re-render if cooldowns or active states change
    const p = prev.stats; const n = next.stats;
    return (
        p.skills.turboCD === n.skills.turboCD && p.buffs.turboTime === n.buffs.turboTime &&
        p.skills.dashCD === n.skills.dashCD &&
        p.skills.shieldCD === n.skills.shieldCD && p.buffs.shieldTime === n.buffs.shieldTime &&
        p.skills.empCD === n.skills.empCD &&
        p.skills.rageCD === n.skills.rageCD && p.buffs.rageTime === n.buffs.rageTime &&
        p.skills.nukeAvailable === n.skills.nukeAvailable
    );
});

const Header = memo(({ time, bases, kills }: { time: number, bases: BaseStats[], kills: number }) => {
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
    const blueBase = bases.find(b => b.faction === Faction.BLUE);
    const blueHp = blueBase?.hp || 0;
    const blueMax = blueBase?.maxHp || 1;
    const bluePct = (blueHp / blueMax) * 100;
    const enemyFactions = [Faction.RED, Faction.GREEN, Faction.PURPLE];

    return (
        <div className="absolute top-0 left-0 w-full h-24 z-30 pointer-events-none flex justify-center pt-2">
            <div className="flex items-start space-x-8 bg-gradient-to-b from-black/90 to-transparent px-16 pb-6 pt-2 clip-trapezoid-down border-b border-[var(--hud-cyan)]/30 backdrop-blur-md">
                <div className="flex flex-col items-end">
                    <span className="text-[var(--hud-cyan)] font-tech text-[10px] tracking-[0.2em] mb-1 text-shadow-glow">ALLIANCE BASE</span>
                    <div className="relative w-[300px] h-5 bg-[#00111f] border border-[#004455] skew-x-[-20deg] overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[var(--hud-blue-dim)] via-[var(--hud-cyan)] to-white shadow-[0_0_15px_cyan] transition-all duration-300 relative" style={{ width: `${bluePct}%` }}>
                            <div className="absolute inset-0 bg-white/30 w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-end px-4 skew-x-[20deg]">
                            <span className="font-mono text-xs font-bold text-white drop-shadow-md tracking-wider">{Math.ceil(blueHp)} <span className="text-[var(--hud-cyan)]">/ {blueMax}</span></span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center mx-2 mt-[-4px]">
                    <div className="bg-[#050505] border-x border-b border-[var(--hud-cyan)]/50 px-8 py-2 clip-corner-cut shadow-[0_0_10px_rgba(0,243,255,0.2)]">
                        <span className={`text-4xl font-ocr font-bold ${time < 60 ? 'text-[var(--hud-red)] animate-pulse' : 'text-white'} neon-text tracking-widest`}>{formatTime(time)}</span>
                    </div>
                    <div className="mt-2 flex space-x-6 text-[10px] font-tech text-[var(--hud-cyan)] opacity-80 bg-black/50 px-3 py-0.5 rounded-full border border-[var(--hud-cyan)]/20">
                        <span>KILLS: <span className="text-white">{kills}</span></span>
                    </div>
                </div>
                <div className="flex flex-col items-start space-y-1">
                    <span className="text-[var(--hud-red)] font-tech text-[10px] tracking-[0.2em] mb-1 text-shadow-glow">HOSTILE CORES</span>
                    {enemyFactions.map((faction, idx) => {
                         const base = bases.find(b => b.faction === faction);
                         const hp = base?.hp || 0; const max = base?.maxHp || 1; const pct = (hp / max) * 100;
                         const color = COLORS[faction]; const isActive = base?.active;
                         let barColor = 'from-[var(--hud-red)] to-white';
                         if (faction === Faction.GREEN) barColor = 'from-[var(--hud-green)] to-white';
                         if (faction === Faction.PURPLE) barColor = 'from-[var(--hud-purple)] to-white';
                         return (
                            <div key={idx} className={`relative w-[200px] h-3 bg-[#1f0000] border border-[#550000] skew-x-[20deg] overflow-hidden ${!isActive ? 'grayscale opacity-30' : ''}`}>
                                <div className={`absolute top-0 right-0 h-full bg-gradient-to-l ${barColor} shadow-[0_0_10px_currentColor] transition-all duration-300`} style={{ width: `${pct}%`, color }}></div>
                                <div className="absolute inset-0 flex items-center justify-start px-2 skew-x-[-20deg]">
                                     <span className="text-[8px] font-mono font-bold text-white shadow-black drop-shadow-md">{Math.ceil(hp)}</span>
                                </div>
                            </div>
                         );
                    })}
                </div>
            </div>
        </div>
    );
}, (prev, next) => {
    return prev.time === next.time && prev.kills === next.kills && prev.bases === next.bases;
});

const NotificationFeed = memo(({ feed }: { feed: KillFeedMessage[] }) => {
    return (
        <div className="absolute top-28 right-8 flex flex-col items-end space-y-1 z-30 pointer-events-none">
            {feed.map(msg => (
                <div key={msg.id} className="bg-[var(--hud-glass)] border-r-2 border-[var(--hud-cyan)] pl-8 pr-2 py-1 text-[10px] font-mono text-white animate-in slide-in-from-right fade-in duration-300 clip-corner-cut flex items-center shadow-lg">
                    <span className={msg.killerFaction === Faction.BLUE ? 'text-[var(--hud-cyan)]' : 'text-[var(--hud-red)]'}>[{msg.killer}]</span>
                    <span className="mx-2 text-gray-500">::</span>
                    <span className={msg.victimFaction === Faction.BLUE ? 'text-[var(--hud-cyan)]' : 'text-[var(--hud-red)]'}>{msg.victim}</span>
                </div>
            ))}
        </div>
    );
});

const TacticalAlert = memo(({ event }: { event: { text: string, subtext: string, color: string } | null }) => {
    if (!event) return null;
    return (
        <div className="absolute top-28 left-8 z-40 pointer-events-none flex items-center space-x-2 animate-in slide-in-from-left duration-300 fade-in">
            <div className="h-8 w-1" style={{ backgroundColor: event.color, boxShadow: `0 0 10px ${event.color}` }}></div>
            <div className="bg-black/80 border border-white/10 px-4 py-2 backdrop-blur-md shadow-lg">
                <div className="flex flex-col">
                     <span className="text-[10px] font-mono text-gray-400 tracking-[0.2em] uppercase">// {event.text}</span>
                     <span className="text-xs font-bold font-tech tracking-wider uppercase" style={{ color: event.color, textShadow: `0 0 5px ${event.color}` }}>{event.subtext}</span>
                </div>
            </div>
        </div>
    );
});

const GameOverScreen = ({ result, phase }: { result: GameResult, phase: GameOverPhase }) => {
    const isVictory = result.winner === Faction.BLUE;
    const color = isVictory ? 'text-[var(--hud-cyan)]' : 'text-[var(--hud-red)]';

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-auto bg-black/80 backdrop-blur-md">
             <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none"><ScrollingDataBG /></div>
             <div className={`transform transition-all duration-1000 flex flex-col items-center ${phase >= GameOverPhase.TEXT_REVEAL ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
                 <h1 className={`text-9xl font-black font-tech ${color} neon-text italic tracking-tighter mb-4`}>{isVictory ? 'MISSION ACCOMPLISHED' : 'SYSTEM FAILURE'}</h1>
                 {phase >= GameOverPhase.STATS && (
                     <div className="mt-8 p-8 border border-white/10 bg-black/60 w-[600px] clip-corner-cut">
                         <div className="grid grid-cols-2 gap-4 font-mono text-sm text-gray-300">
                             <span>HOSTILES ELIMINATED:</span> <span className="text-right text-white font-bold">{result.kills}</span>
                             <span>UNITS LOST:</span> <span className="text-right text-white font-bold">{result.deaths}</span>
                             <span>SURVIVAL TIME:</span> <span className="text-right text-white font-bold">{Math.floor(result.timeSurvived)}s</span>
                             <div className="col-span-2 border-t border-white/10 my-2"></div>
                             <span className="self-center">RATING:</span> <span className={`text-right text-6xl font-ocr font-bold ${color}`}>{result.rating}</span>
                         </div>
                     </div>
                 )}
                 {phase >= GameOverPhase.WAITING && (<div className="mt-12 animate-pulse text-[var(--hud-cyan)] font-tech">PRESS [R] TO REBOOT</div>)}
             </div>
        </div>
    );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [gameOverData, setGameOverData] = useState<{result: GameResult | null, phase: GameOverPhase}>({ result: null, phase: GameOverPhase.NONE });
  const [paused, setPaused] = useState(false);
  
  const [stats, setStats] = useState<(PlayerStats & { respawnState?: any }) | null>(null);
  const [bases, setBases] = useState<BaseStats[]>([]);
  const [time, setTime] = useState(480);
  const [weather, setWeather] = useState<WeatherType>(WeatherType.CLEAR);
  const [radarData, setRadarData] = useState<RadarData | null>(null);
  const [hub, setHub] = useState<HubStats | null>(null);
  const [killFeed, setKillFeed] = useState<KillFeedMessage[]>([]);
  const [gameEvent, setGameEvent] = useState<{ text: string, subtext: string, color: string } | null>(null);

  const handleStart = () => { setStarted(true); soundManager.playBootSequence(); };
  const handleKill = (msg: KillFeedMessage) => {
      setKillFeed(prev => { const newState = [...prev, msg]; if (newState.length > 6) newState.shift(); return newState; });
      setTimeout(() => { setKillFeed(prev => prev.filter(m => m.id !== msg.id)); }, 5000);
  };
  const handleGameEvent = (text: string, subtext: string, color: string) => {
      setGameEvent({ text, subtext, color });
      setTimeout(() => setGameEvent(null), 4000);
  };

  useEffect(() => {
     const handleKey = (e: KeyboardEvent) => { if (e.code === 'KeyP' && started && !gameOverData.result) setPaused(prev => !prev); };
     window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
  }, [started, gameOverData]);

  if (!started) return <TerminalBoot onComplete={handleStart} />;
  const isHUDVisible = stats && (!stats.dead || (stats.respawnState?.active && stats.respawnState.phase >= RespawnPhase.READY));

  return (
    <div className={`relative w-screen h-screen overflow-hidden cursor-crosshair bg-black select-none ${stats?.status.silenced ? 'grayscale contrast-125' : ''}`}>
      <div className="scan-line opacity-20 pointer-events-none" />
      <div className="chromatic-aberration opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-hex-grid opacity-10 pointer-events-none" />
      
      {stats?.status.blind && <div className="absolute inset-0 bg-white z-[60] animate-pulse pointer-events-none mix-blend-overlay opacity-80" />}
      {stats?.status.burned && <div className="absolute inset-0 shadow-[inset_0_0_200px_red] z-[55] pointer-events-none opacity-50 mix-blend-overlay" />}
      {stats?.status.frozen && <div className="absolute inset-0 shadow-[inset_0_0_200px_cyan] z-[55] pointer-events-none opacity-50 mix-blend-overlay" />}

      <GameCanvas 
        onUIUpdate={(s, b, t, w, r, h) => { setStats(s); setBases(b); setTime(t); setWeather(w); setRadarData(r); setHub(h); }}
        onGameOver={(result, phase) => setGameOverData({ result, phase })}
        onKill={handleKill} onRespawn={() => {}} onGameEvent={handleGameEvent}
      />

      {gameOverData.result && <GameOverScreen result={gameOverData.result} phase={gameOverData.phase} />}

      {stats && !gameOverData.result && (
        <div className="absolute inset-0 z-20 pointer-events-none">
            <Header time={time} bases={bases} kills={stats.kills} />
            <TacticalAlert event={gameEvent} />
            <NotificationFeed feed={killFeed} />
            <div className={`absolute inset-0 transition-transform duration-700 ease-in-out ${isHUDVisible ? 'translate-y-0 opacity-100' : 'translate-y-[100%] opacity-0'}`}>
                <TacticalDisplay stats={stats} radarData={radarData} weather={weather} />
                <SkillBar stats={stats} />
                <WeaponSystems stats={stats} />
            </div>
            {paused && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
                     <div className="glass-panel px-16 py-8 clip-corner-cut border-l-4 border-[var(--hud-amber)]">
                         <div className="text-6xl font-bold font-tech text-[var(--hud-amber)] tracking-[0.2em] neon-text">PAUSED</div>
                     </div>
                 </div>
            )}
            {stats.dead && !stats.respawnState?.active && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/10 z-40">
                     <div className="bg-black/80 border-y-2 border-[var(--hud-red)] px-20 py-4 mb-8">
                         <div className="text-6xl font-black text-[var(--hud-red)] font-tech tracking-widest animate-pulse neon-text">SIGNAL LOST</div>
                     </div>
                     {stats.canRespawn && <div className="text-xl text-white font-mono bg-[var(--hud-cyan)]/20 px-6 py-2 border border-[var(--hud-cyan)] animate-bounce">PRESS [L] TO REINITIALIZE</div>}
                </div>
            )}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.8)_100%)]"></div>
        </div>
      )}
    </div>
  );
};
export default App;