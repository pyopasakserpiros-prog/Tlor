// ═══════════════════════════════════════════════════════════
//  THE ONE RING CHRONICLES - MAIN GAME COMPONENT
//  Complete Middle-earth RPG with all systems
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, PlayerState, Equipment, EquipmentSlot, Enemy, Follower, FloatingText, Skill } from './game/types';
import {
  createNewPlayer, calculateTotalStats, generateCombatLoot,
  checkLevelUp, equipItem, reviveFollowers, calculateDamage,
  generateMapEvent,
} from './game/engine';
import { RARITY_COLORS, RARITY_NAMES, MAPS, GAME_CONFIG, SLOT_BASE_STAT } from './game/data';
import { saveGame, loadGame, hasSave, deleteSave } from './game/storage';
import './App.css';

let floatTextId = 0;

function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = loadGame();
    if (saved) {
      saved.screen = 'town_hub';
      return saved;
    }
    return {
      screen: 'title',
      player: createNewPlayer('Hero'),
      combat: { isActive: false, enemies: [], currentTurn: 0, combatLog: [], playerActionPending: false, selectedSkill: null, lootDropped: [], expGained: 0, goldGained: 0 },
      currentEvent: null,
      currentMapProgress: 0,
      settings: { soundEnabled: true, musicEnabled: true, difficulty: 'normal', autoSave: true },
    };
  });

  const [playerName, setPlayerName] = useState('');
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [levelUpAnim, setLevelUpAnim] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const combatInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const player = gameState.player;
  const combat = gameState.combat;
  const currentMap = MAPS[player.currentMap - 1];
  const totalStats = calculateTotalStats(player);

  const updatePlayer = useCallback((updates: Partial<PlayerState>) => {
    setGameState(prev => {
      const newState = { ...prev, player: { ...prev.player, ...updates } };
      newState.player.totalStats = calculateTotalStats(newState.player);
      return newState;
    });
  }, []);

  const showMsg = useCallback((msg: string) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2500);
  }, []);

  const triggerShake = useCallback(() => {
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 300);
  }, []);

  const changeScreen = useCallback((screen: string) => {
    setGameState(prev => ({ ...prev, screen: screen as GameState['screen'] }));
  }, []);

  // Floating text effect (used via animation system)
  useCallback((text: string, x: number, y: number, color: string) => {
    const id = ++floatTextId;
    setFloatingTexts(prev => [...prev, { id, text, x, y, color, startTime: Date.now() }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1200);
  }, []);

  // Auto-save
  useEffect(() => {
    if (gameState.settings.autoSave && gameState.screen !== 'title' && gameState.screen !== 'character_creation') {
      saveInterval.current = setInterval(() => {
        setGameState(prev => {
          saveGame(prev);
          return prev;
        });
      }, 30000);
    }
    return () => {
      if (saveInterval.current) clearInterval(saveInterval.current);
    };
  }, [gameState.settings.autoSave, gameState.screen]);

  // ═══ TITLE SCREEN ═══
  if (gameState.screen === 'title') {
    return (
      <div className="screen title-screen">
        <div className="title-bg" style={{ backgroundImage: 'url(/assets/bg-mountdoom.jpg)' }} />
        <div className="title-overlay" />
        <div className="title-content">
          <h1 className="game-title">The One Ring</h1>
          <h2 className="game-subtitle">Chronicles</h2>
          <p className="title-tagline">A Middle-earth RPG Adventure</p>
          <div className="title-buttons">
            {hasSave() && (
              <button className="btn btn-primary btn-large" onClick={() => { const s = loadGame(); if (s) { s.screen = 'town_hub'; setGameState(s); } }}>
                Continue Journey
              </button>
            )}
            <button className="btn btn-primary btn-large" onClick={() => changeScreen('character_creation')}>
              New Adventure
            </button>
            <button className="btn btn-secondary" onClick={() => setShowHelp(true)}>
              How to Play
            </button>
          </div>
          <p className="title-version">v1.0 - A Middle-earth Epic</p>
        </div>
        {showHelp && (
          <div className="modal-overlay" onClick={() => setShowHelp(false)}>
            <div className="modal help-modal" onClick={e => e.stopPropagation()}>
              <h2>How to Play</h2>
              <div className="help-content">
                <p><strong>The One Ring Chronicles</strong> is an RPG adventure through Middle-earth.</p>
                <h3>Character Stats</h3>
                <p><strong>STR</strong> - Increases Attack damage</p>
                <p><strong>AGI</strong> - Increases Dodge and Accuracy</p>
                <p><strong>INT</strong> - Increases Magic Power and Max Mana</p>
                <p><strong>LUCK</strong> - Increases Crit Rate and Crit Damage</p>
                <p><strong>VIT</strong> - Increases Max HP and Defense</p>
                <h3>Combat</h3>
                <p>Combat is turn-based. You and your followers attack automatically. Use skills for powerful abilities!</p>
                <h3>Equipment</h3>
                <p>Items have rarities: Common (White), Uncommon (Green), Rare (Blue), Epic (Purple), Legendary (Gold), Mythic (Red)</p>
                <h3>Followers</h3>
                <p>Recruit up to 4 followers to aid you in battle. They level with you!</p>
                <h3>Wizards</h3>
                <p>Meet the 5 Istari (Gandalf, Saruman, Radagast, Alatar, Pallando) to learn powerful skills.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowHelp(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══ CHARACTER CREATION ═══
  if (gameState.screen === 'character_creation') {
    const remainingPoints = 15;
    const [distStats, setDistStats] = useState({ STR: 5, AGI: 5, INT: 5, LUCK: 5, VIT: 5 });
    const pointsUsed = Object.values(distStats).reduce((a, b) => a + b, 0) - 25;
    const pointsLeft = remainingPoints - pointsUsed;

    const adjustStat = (stat: keyof typeof distStats, delta: number) => {
      const newVal = distStats[stat] + delta;
      if (newVal < 1 || newVal > 20) return;
      if (delta > 0 && pointsLeft <= 0) return;
      setDistStats(prev => ({ ...prev, [stat]: newVal }));
    };

    const confirmCharacter = () => {
      if (!playerName.trim()) { showMsg('Enter a name!'); return; }
      const newPlayer = createNewPlayer(playerName.trim());
      newPlayer.baseStats = { ...distStats };
      newPlayer.totalStats = calculateTotalStats(newPlayer);
      newPlayer.totalStats.currentHp = newPlayer.totalStats.maxHp;
      newPlayer.totalStats.currentMana = newPlayer.totalStats.maxMana;
      setGameState(prev => ({ ...prev, player: newPlayer, screen: 'town_hub' }));
      saveGame({ ...gameState, player: newPlayer, screen: 'town_hub' });
    };

    return (
      <div className="screen creation-screen">
        <div className="creation-bg" style={{ backgroundImage: 'url(/assets/bg-greyhavens.jpg)' }} />
        <div className="creation-overlay" />
        <div className="creation-content">
          <h2>Create Your Hero</h2>
          <div className="name-input">
            <label>Hero Name:</label>
            <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Enter your name" maxLength={20} />
          </div>
          <div className="stat-distribution">
            <h3>Distribute Points <span className="points-left">({pointsLeft} left)</span></h3>
            {(['STR', 'AGI', 'INT', 'LUCK', 'VIT'] as const).map(stat => (
              <div key={stat} className="stat-row">
                <span className="stat-name">{stat}</span>
                <button className="btn-stat" onClick={() => adjustStat(stat, -1)} disabled={distStats[stat] <= 1}>-</button>
                <span className="stat-value">{distStats[stat]}</span>
                <button className="btn-stat" onClick={() => adjustStat(stat, 1)} disabled={pointsLeft <= 0 || distStats[stat] >= 20}>+</button>
                <span className="stat-desc">
                  {stat === 'STR' && 'Attack Power'}
                  {stat === 'AGI' && 'Dodge & Accuracy'}
                  {stat === 'INT' && 'Magic & Mana'}
                  {stat === 'LUCK' && 'Crit & Luck'}
                  {stat === 'VIT' && 'HP & Defense'}
                </span>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-large" onClick={confirmCharacter} disabled={!playerName.trim() || pointsLeft > 0}>
            Begin Adventure
          </button>
        </div>
        {showMessage && <div className="toast-message">{message}</div>}
      </div>
    );
  }

  // ═══ TOWN HUB ═══
  if (gameState.screen === 'town_hub') {
    return (
      <div className="screen town-screen">
        <div className="town-bg" style={{ backgroundImage: 'url(/assets/bg-shire.jpg)' }} />
        <div className="town-overlay" />
        <div className="town-content">
          <div className="town-header">
            <h2>Rivendell - Last Homely House</h2>
            <p className="town-subtitle">A sanctuary in dark times</p>
          </div>

          <div className="hero-panel">
            <img src="/assets/hero-portrait.jpg" alt="Hero" className="hero-avatar" />
            <div className="hero-info">
              <h3>{player.name} <span className="level-badge">Lv.{player.level}</span></h3>
              <div className="hero-bars">
                <div className="bar"><div className="bar-fill hp-fill" style={{ width: `${(totalStats.currentHp / totalStats.maxHp) * 100}%` }} /></div>
                <div className="bar"><div className="bar-fill mana-fill" style={{ width: `${(totalStats.currentMana / totalStats.maxMana) * 100}%` }} /></div>
              </div>
              <p className="hero-gold">💰 {player.gold} Gold</p>
            </div>
          </div>

          <div className="town-menu">
            <button className="town-btn town-btn-emphasis" onClick={() => changeScreen('map_select')}>
              <span className="town-btn-icon">🗺️</span>
              <span className="town-btn-text">Embark on Quest</span>
            </button>
            <button className="town-btn" onClick={() => changeScreen('inventory')}>
              <span className="town-btn-icon">🎒</span>
              <span className="town-btn-text">Inventory</span>
            </button>
            <button className="town-btn" onClick={() => changeScreen('skills')}>
              <span className="town-btn-icon">📜</span>
              <span className="town-btn-text">Skills ({player.skills.filter((s: Skill) => s.learned).length})</span>
            </button>
            <button className="town-btn" onClick={() => changeScreen('followers')}>
              <span className="town-btn-icon">👥</span>
              <span className="town-btn-text">Followers ({player.followers.length}/4)</span>
            </button>
            <button className="town-btn" onClick={() => { reviveFollowers(player); updatePlayer({ ...player, totalStats: { ...totalStats, currentHp: totalStats.maxHp, currentMana: totalStats.maxMana } }); showMsg('Restored at House of Elrond!'); }}>
              <span className="town-btn-icon">🏥</span>
              <span className="town-btn-text">Rest & Heal</span>
            </button>
            <button className="town-btn" onClick={() => setShowSettings(true)}>
              <span className="town-btn-icon">⚙️</span>
              <span className="town-btn-text">Settings</span>
            </button>
          </div>

          <div className="town-stats">
            <h4>Hero Stats</h4>
            <div className="town-stat-grid">
              <span>ATK: {totalStats.atk}</span>
              <span>DEF: {totalStats.def}</span>
              <span>HP: {totalStats.maxHp}</span>
              <span>MP: {totalStats.maxMana}</span>
              <span>MAG: {totalStats.magicPower}</span>
              <span>Crit: {totalStats.critRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="modal-overlay" onClick={() => setShowSettings(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Settings</h2>
              <div className="settings-list">
                <label><input type="checkbox" checked={gameState.settings.autoSave} onChange={e => setGameState(p => ({ ...p, settings: { ...p.settings, autoSave: e.target.checked } }))} /> Auto Save</label>
                <label><input type="checkbox" checked={gameState.settings.soundEnabled} onChange={e => setGameState(p => ({ ...p, settings: { ...p.settings, soundEnabled: e.target.checked } }))} /> Sound Effects</label>
              </div>
              <button className="btn btn-danger" onClick={() => { if (confirm('Delete all save data?')) { deleteSave(); setGameState({ screen: 'title', player: createNewPlayer('Hero'), combat: gameState.combat, currentEvent: null, currentMapProgress: 0, settings: gameState.settings }); } }}>
                Delete Save
              </button>
              <button className="btn btn-primary" onClick={() => setShowSettings(false)}>Close</button>
            </div>
          </div>
        )}
        {showMessage && <div className="toast-message">{message}</div>}
      </div>
    );
  }

  // ═══ MAP SELECT ═══
  if (gameState.screen === 'map_select') {
    return (
      <div className="screen map-select-screen">
        <div className="map-select-bg" style={{ backgroundImage: 'url(/assets/bg-mirkwood.jpg)' }} />
        <div className="map-select-overlay" />
        <div className="map-select-content">
          <h2>Choose Your Destination</h2>
          <div className="map-list">
            {MAPS.map(map => {
              const unlocked = map.id <= player.mapsUnlocked;
              return (
                <button
                  key={map.id}
                  className={`map-card ${unlocked ? 'map-unlocked' : 'map-locked'} ${map.id === player.currentMap ? 'map-current' : ''}`}
                  disabled={!unlocked}
                  onClick={() => {
                    updatePlayer({ currentMap: map.id });
                    setGameState(p => ({ ...p, currentMapProgress: 0, screen: 'exploration' }));
                  }}
                >
                  <div className="map-card-bg" style={{ backgroundImage: `url(${map.background})` }} />
                  <div className="map-card-overlay" />
                  <div className="map-card-content">
                    <span className="map-number">Map {map.id}</span>
                    <h3>{map.name}</h3>
                    <p className="map-race">{map.race.charAt(0).toUpperCase() + map.race.slice(1)} | Lv.{map.levelRange[0]}-{map.levelRange[1]}</p>
                    <p className="map-boss">Boss: {map.bossName}</p>
                    {!unlocked && <span className="map-lock">🔒 Locked</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <button className="btn btn-secondary back-btn" onClick={() => changeScreen('town_hub')}>Back to Town</button>
        </div>
      </div>
    );
  }

  // ═══ EXPLORATION ═══
  if (gameState.screen === 'exploration') {
    const progress = gameState.currentMapProgress;
    const totalEncounters = currentMap.encountersToBoss;

    const explore = () => {
      const event = generateMapEvent(currentMap, progress);
      setGameState(p => ({ ...p, currentEvent: event }));

      if (event.type === 'combat' || event.type === 'boss') {
        const enemies = event.data as Enemy[];
        setGameState(p => ({
          ...p,
          screen: 'combat',
          combat: {
            isActive: true,
            enemies,
            currentTurn: 0,
            combatLog: [`${event.message}`],
            playerActionPending: true,
            selectedSkill: null,
            lootDropped: [],
            expGained: 0,
            goldGained: 0,
          },
        }));
      } else if (event.type === 'wizard') {
        setGameState(p => ({ ...p, screen: 'wizard_event' }));
      } else if (event.type === 'loot') {
        const item = event.data as Equipment;
        updatePlayer({ inventory: [...player.inventory, item] });
        showMsg(`Found: ${item.name}!`);
        setGameState(p => ({ ...p, currentMapProgress: p.currentMapProgress + 1 }));
      } else if (event.type === 'follower') {
        const follower = event.data as Follower;
        if (player.followers.length < GAME_CONFIG.MAX_FOLLOWERS) {
          updatePlayer({ followers: [...player.followers, follower] });
          showMsg(`${follower.name} joined your fellowship!`);
        } else {
          showMsg('Your fellowship is full!');
        }
        setGameState(p => ({ ...p, currentMapProgress: p.currentMapProgress + 1 }));
      }
    };

    return (
      <div className="screen exploration-screen">
        <div className="explore-bg" style={{ backgroundImage: `url(${currentMap.background})` }} />
        <div className="explore-overlay" />
        <div className="explore-content">
          <div className="explore-header">
            <h2>{currentMap.name}</h2>
            <p>{currentMap.description}</p>
          </div>

          <div className="progress-track">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(progress / totalEncounters) * 100}%` }} />
            </div>
            <p>Progress: {progress}/{totalEncounters} - {totalEncounters - progress} until Boss</p>
          </div>

          <div className="explore-actions">
            <button className="btn btn-primary btn-explore" onClick={explore}>
              🔍 Explore
            </button>
            <button className="btn btn-secondary" onClick={() => changeScreen('town_hub')}>
              🏠 Return to Town
            </button>
          </div>

          <div className="explore-party">
            <h4>Your Fellowship</h4>
            <div className="party-list">
              <div className="party-member">
                <img src="/assets/hero-portrait.jpg" alt="Hero" />
                <span>{player.name}</span>
              </div>
              {player.followers.map((f: Follower, i: number) => (
                <div key={i} className={`party-member ${!f.isAlive ? 'dead' : ''}`}>
                  <img src={f.portrait} alt={f.name} />
                  <span>{f.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {showMessage && <div className="toast-message">{message}</div>}
      </div>
    );
  }

  // ═══ WIZARD EVENT ═══
  if (gameState.screen === 'wizard_event' && gameState.currentEvent?.data) {
    const wizard = gameState.currentEvent.data as { name: string; title: string; color: string; portrait: string; dialogue: string[]; skills: Skill[] };
    const [dialogueIndex, setDialogueIndex] = useState(0);

    const learnSkill = (skill: Skill) => {
      if (player.skills.find((s: Skill) => s.id === skill.id)) {
        showMsg('You already know this skill!');
        return;
      }
      if (player.gold < 50) {
        showMsg('Not enough gold! (50 required)');
        return;
      }
      const updatedSkills = [...player.skills, { ...skill, learned: true }];
      updatePlayer({ gold: player.gold - 50, skills: updatedSkills });
      showMsg(`Learned: ${skill.name}!`);
    };

    return (
      <div className="screen wizard-screen">
        <div className="wizard-bg" style={{ backgroundImage: `url(${currentMap.background})` }} />
        <div className="wizard-overlay" />
        <div className="wizard-content">
          <div className="wizard-panel">
            <img src={wizard.portrait} alt={wizard.name} className="wizard-portrait" />
            <h2 style={{ color: wizard.color }}>{wizard.name} <span>{wizard.title}</span></h2>
            <p className="wizard-dialogue">"{wizard.dialogue[dialogueIndex % wizard.dialogue.length]}"</p>

            <div className="wizard-skills">
              <h3>Teachable Skills</h3>
              {wizard.skills.map((skill: Skill) => (
                <div key={skill.id} className="wizard-skill">
                  <div className="skill-info">
                    <h4>{skill.name}</h4>
                    <p>{skill.description}</p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => learnSkill(skill)}
                    disabled={player.skills.find((s: Skill) => s.id === skill.id) !== undefined}
                  >
                    {player.skills.find((s: Skill) => s.id === skill.id) ? 'Learned' : 'Learn (50g)'}
                  </button>
                </div>
              ))}
            </div>

            <div className="wizard-actions">
              <button className="btn btn-secondary" onClick={() => setDialogueIndex(d => d + 1)}>More Wisdom</button>
              <button className="btn btn-primary" onClick={() => {
                setGameState(p => ({ ...p, screen: 'exploration', currentMapProgress: p.currentMapProgress + 1, currentEvent: null }));
              }}>Continue Journey</button>
            </div>
          </div>
        </div>
        {showMessage && <div className="toast-message">{message}</div>}
      </div>
    );
  }

  // ═══ COMBAT ═══
  if (gameState.screen === 'combat') {
    const performAttack = useCallback((isPlayer: boolean, skillId?: string) => {
      setGameState(prev => {
        const newState = { ...prev };
        const newCombat = { ...newState.combat };
        const newPlayer = { ...newState.player };
        let newTotalStats = calculateTotalStats(newPlayer);

        if (isPlayer) {
          const targetIndex = newCombat.enemies.findIndex((e: Enemy) => e.hp > 0);
          if (targetIndex === -1) return prev;

          const target = newCombat.enemies[targetIndex];
          let skillMultiplier = 1;
          let isMagic = false;
          let manaCost = 0;

          if (skillId) {
            const skill = newPlayer.skills.find((s: Skill) => s.id === skillId);
            if (skill && skill.effect.manaCost && newTotalStats.currentMana >= skill.effect.manaCost) {
              skillMultiplier = skill.effect.damageMultiplier || 1;
              isMagic = skill.effect.type === 'active_damage';
              manaCost = skill.effect.manaCost;
            }
          }

          const result = calculateDamage(
            { atk: newTotalStats.atk, accuracy: newTotalStats.accuracy, critRate: newTotalStats.critRate, critDamage: newTotalStats.critDamage, killChance: newTotalStats.killChance, magicPower: newTotalStats.magicPower },
            { def: target.def, dodgeChance: 5, blockChance: 0, isBoss: target.isBoss },
            skillMultiplier,
            isMagic
          );

          if (result.isKill) {
            target.hp = 0;
            newCombat.combatLog = [...newCombat.combatLog, `💀 Insta-kill on ${target.name}!`];
          } else if (result.isDodged) {
            newCombat.combatLog = [...newCombat.combatLog, `${target.name} dodged!`];
          } else if (result.isBlocked) {
            newCombat.combatLog = [...newCombat.combatLog, `${target.name} blocked!`];
          } else {
            target.hp = Math.max(0, target.hp - result.damage);
            const critText = result.isCrit ? ' CRITICAL!' : '';
            newCombat.combatLog = [...newCombat.combatLog, `You hit ${target.name} for ${result.damage}${critText}!`];

            if (newTotalStats.lifeSteal > 0) {
              const heal = Math.floor(result.damage * newTotalStats.lifeSteal / 100);
              newTotalStats.currentHp = Math.min(newTotalStats.maxHp, newTotalStats.currentHp + heal);
            }
            if (newTotalStats.manaSteal > 0) {
              const mana = Math.floor(result.damage * newTotalStats.manaSteal / 100);
              newTotalStats.currentMana = Math.min(newTotalStats.maxMana, newTotalStats.currentMana + mana);
            }
          }

          newTotalStats.currentMana = Math.max(0, newTotalStats.currentMana - manaCost);
          newCombat.enemies = newCombat.enemies.map((e: Enemy, i: number) => i === targetIndex ? { ...target } : e);
        }

        // Follower attacks
        for (let i = 0; i < newPlayer.followers.length; i++) {
          const follower = newPlayer.followers[i];
          if (!follower.isAlive) continue;

          const fStats = follower.stats;
          const fTargetIndex = newCombat.enemies.findIndex((e: Enemy) => e.hp > 0);
          if (fTargetIndex === -1) break;

          const fTarget = newCombat.enemies[fTargetIndex];
          const fResult = calculateDamage(
            { atk: fStats.atk, accuracy: 90, critRate: fStats.critRate, critDamage: fStats.critDamage, killChance: 0, magicPower: fStats.magicPower },
            { def: fTarget.def, dodgeChance: 3, blockChance: 0, isBoss: fTarget.isBoss }
          );

          if (!fResult.isDodged && !fResult.isBlocked) {
            fTarget.hp = Math.max(0, fTarget.hp - fResult.damage);
            newCombat.combatLog = [...newCombat.combatLog, `${follower.name} hits ${fTarget.name} for ${fResult.damage}!`];
          }
          newCombat.enemies = newCombat.enemies.map((e: Enemy, idx: number) => idx === fTargetIndex ? { ...fTarget } : e);
        }

        // Check victory
        const allDead = newCombat.enemies.every((e: Enemy) => e.hp <= 0);
        if (allDead) {
          let totalExp = 0;
          let totalGold = 0;
          for (const e of newCombat.enemies) {
            totalExp += e.expReward;
            totalGold += e.goldReward;
          }
          newCombat.expGained = totalExp;
          newCombat.goldGained = totalGold;
          newPlayer.exp += totalExp;
          newPlayer.gold += totalGold;
          newPlayer.totalKills += newCombat.enemies.filter((e: Enemy) => !e.isBoss).length;
          if (newCombat.enemies.some((e: Enemy) => e.isBoss)) {
            newPlayer.bossesDefeated += 1;
            if (newPlayer.currentMap === newPlayer.mapsUnlocked && newPlayer.currentMap < 12) {
              newPlayer.mapsUnlocked += 1;
            }
          }

          newCombat.lootDropped = generateCombatLoot(newCombat.enemies);
          for (const item of newCombat.lootDropped) {
            if (newPlayer.inventory.length < GAME_CONFIG.INVENTORY_SIZE) {
              newPlayer.inventory.push(item);
            }
          }

          const levelResult = checkLevelUp(newPlayer);
          if (levelResult.leveled) {
            setLevelUpAnim(true);
            setTimeout(() => setLevelUpAnim(false), 3000);
          }

          newCombat.combatLog = [...newCombat.combatLog, `Victory! +${totalExp} EXP, +${totalGold} Gold`];
          if (newCombat.lootDropped.length > 0) {
            newCombat.combatLog = [...newCombat.combatLog, `Loot: ${newCombat.lootDropped.map((l: Equipment) => l.name).join(', ')}`];
          }

          newTotalStats = calculateTotalStats(newPlayer);
          newPlayer.totalStats = newTotalStats;
          newState.player = newPlayer;
          newState.combat = newCombat;

          setTimeout(() => {
            setGameState(p => ({ ...p, screen: 'loot_screen' }));
          }, 1500);

          return newState;
        }

        // Enemy attacks
        for (const enemy of newCombat.enemies) {
          if (enemy.hp <= 0) continue;

          const followerTargets = newPlayer.followers
            .map((f: Follower, idx: number) => ({ type: 'follower' as const, index: idx, hp: f.stats.currentHp, alive: f.isAlive }))
            .filter((t: { alive: boolean; hp: number }) => t.alive && t.hp > 0);

          const targets = [
            { type: 'player' as const, hp: newTotalStats.currentHp },
            ...followerTargets
          ].filter((t: { hp: number }) => t.hp > 0);

          if (targets.length === 0) {
            newCombat.combatLog = [...newCombat.combatLog, 'You have fallen...'];
            newState.player = newPlayer;
            newState.combat = newCombat;
            setTimeout(() => setGameState(p => ({ ...p, screen: 'game_over' })), 1500);
            return newState;
          }

          const chosenTarget = targets[Math.floor(Math.random() * targets.length)];
          const eResult = calculateDamage(
            { atk: enemy.atk, accuracy: 90, critRate: 5, critDamage: 150, killChance: 0 },
            { def: newTotalStats.def, dodgeChance: newTotalStats.dodgeChance, blockChance: newTotalStats.blockChance, isBoss: false }
          );

          if (chosenTarget.type === 'player') {
            if (!eResult.isDodged && !eResult.isBlocked) {
              newTotalStats.currentHp = Math.max(0, newTotalStats.currentHp - eResult.damage);
              triggerShake();
              newCombat.combatLog = [...newCombat.combatLog, `${enemy.name} hits you for ${eResult.damage}!`];
            } else if (eResult.isDodged) {
              newCombat.combatLog = [...newCombat.combatLog, `You dodged ${enemy.name}'s attack!`];
            } else {
              newCombat.combatLog = [...newCombat.combatLog, `You blocked ${enemy.name}'s attack!`];
            }
          } else if (chosenTarget.type === 'follower') {
            const f = newPlayer.followers[chosenTarget.index];
            if (f && !eResult.isDodged && !eResult.isBlocked) {
              f.stats.currentHp = Math.max(0, f.stats.currentHp - eResult.damage);
              if (f.stats.currentHp <= 0) f.isAlive = false;
              newCombat.combatLog = [...newCombat.combatLog, `${enemy.name} hits ${f.name} for ${eResult.damage}!`];
            }
          }
        }

        if (newTotalStats.currentHp <= 0) {
          newCombat.combatLog = [...newCombat.combatLog, 'You have fallen in battle...'];
          newPlayer.totalStats = newTotalStats;
          newState.player = newPlayer;
          newState.combat = newCombat;
          setTimeout(() => setGameState(p => ({ ...p, screen: 'game_over' })), 1500);
          return newState;
        }

        newPlayer.totalStats = newTotalStats;
        newState.player = newPlayer;
        newState.combat = newCombat;
        return newState;
      });
    }, []);

    useEffect(() => {
      if (!combat.isActive) return;
      combatInterval.current = setInterval(() => {
        performAttack(true);
      }, 2000);
      return () => { if (combatInterval.current) clearInterval(combatInterval.current); };
    }, [combat.isActive, performAttack]);

    const useSkill = (skillId: string) => {
      performAttack(true, skillId);
    };

    const flee = () => {
      if (combat.enemies.some((e: Enemy) => e.isBoss)) {
        showMsg('Cannot flee from a boss!');
        return;
      }
      showMsg('You fled from battle!');
      setGameState(p => ({ ...p, screen: 'exploration', combat: { ...p.combat, isActive: false } }));
    };

    return (
      <div className={`screen combat-screen ${shakeScreen ? 'screen-shake' : ''}`}>
        <div className="combat-bg" style={{ backgroundImage: `url(${currentMap.background})` }} />
        <div className="combat-overlay" />

        {floatingTexts.map(ft => (
          <div key={ft.id} className="floating-text" style={{ left: ft.x, top: ft.y, color: ft.color }}>
            {ft.text}
          </div>
        ))}

        <div className="combat-content">
          <div className="enemy-area">
            {combat.enemies.map((enemy: Enemy) => (
              <div key={enemy.id} className={`enemy-card ${enemy.hp <= 0 ? 'enemy-dead' : ''}`}>
                <img src={enemy.portrait} alt={enemy.name} className="enemy-portrait" />
                <div className="enemy-info">
                  <h4>{enemy.name} {enemy.isBoss && '👑'}</h4>
                  <span className="enemy-level">Lv.{enemy.level}</span>
                  <div className="bar enemy-bar">
                    <div className="bar-fill enemy-hp-fill" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
                  </div>
                  <span className="hp-text">{enemy.hp}/{enemy.maxHp}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="player-combat-area">
            <div className="combat-hero">
              <img src="/assets/hero-portrait.jpg" alt="Hero" className="combat-hero-img" />
              <div className="combat-hero-stats">
                <h4>{player.name}</h4>
                <div className="bar"><div className="bar-fill hp-fill" style={{ width: `${(totalStats.currentHp / totalStats.maxHp) * 100}%` }} /></div>
                <span className="hp-text">{totalStats.currentHp}/{totalStats.maxHp}</span>
                <div className="bar"><div className="bar-fill mana-fill" style={{ width: `${(totalStats.currentMana / totalStats.maxMana) * 100}%` }} /></div>
                <span className="hp-text">{totalStats.currentMana}/{totalStats.maxMana}</span>
              </div>
            </div>

            <div className="combat-followers">
              {player.followers.map((f: Follower, i: number) => (
                <div key={i} className={`combat-follower ${!f.isAlive ? 'dead' : ''}`}>
                  <img src={f.portrait} alt={f.name} />
                  <span>{f.name}</span>
                  <div className="bar small-bar"><div className="bar-fill hp-fill" style={{ width: `${(f.stats.currentHp / f.stats.maxHp) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="combat-log">
            {combat.combatLog.slice(-5).map((log: string, i: number) => (
              <p key={i} className="log-entry">{log}</p>
            ))}
          </div>

          <div className="action-bar">
            <button className="btn-action btn-attack" onClick={() => performAttack(true)}>⚔️ Attack</button>
            {player.skills.filter((s: Skill) => s.learned && s.effect.type === 'active_damage').map((skill: Skill) => (
              <button
                key={skill.id}
                className="btn-action btn-skill"
                onClick={() => useSkill(skill.id)}
                disabled={totalStats.currentMana < (skill.effect.manaCost || 0)}
              >
                🔥 {skill.name}
                <span className="skill-cost">{skill.effect.manaCost}MP</span>
              </button>
            ))}
            {player.skills.filter((s: Skill) => s.learned && s.effect.type === 'active_heal').map((skill: Skill) => (
              <button
                key={skill.id}
                className="btn-action btn-heal"
                onClick={() => useSkill(skill.id)}
                disabled={totalStats.currentMana < (skill.effect.manaCost || 0)}
              >
                💚 {skill.name}
                <span className="skill-cost">{skill.effect.manaCost}MP</span>
              </button>
            ))}
            <button className="btn-action btn-flee" onClick={flee}>🏃 Flee</button>
          </div>
        </div>

        {levelUpAnim && (
          <div className="level-up-overlay">
            <h1 className="level-up-text">LEVEL UP!</h1>
            <p>You are now level {player.level}!</p>
            <p>+{GAME_CONFIG.STAT_POINTS_PER_LEVEL} Stat Points</p>
          </div>
        )}
        {showMessage && <div className="toast-message">{message}</div>}
      </div>
    );
  }

  // ═══ LOOT SCREEN ═══
  if (gameState.screen === 'loot_screen') {
    return (
      <div className="screen loot-screen">
        <div className="loot-bg" style={{ backgroundImage: 'url(/assets/bg-lothlorien.jpg)' }} />
        <div className="loot-overlay" />
        <div className="loot-content">
          <h2 className="loot-title">Victory!</h2>
          <p className="loot-rewards">+{combat.expGained} EXP | +{combat.goldGained} Gold</p>

          {combat.lootDropped.length > 0 ? (
            <div className="loot-items">
              <h3>Loot Obtained</h3>
              {combat.lootDropped.map((item: Equipment, idx: number) => (
                <div key={idx} className="loot-item-card" style={{ borderColor: RARITY_COLORS[item.rarity] }}>
                  <span className="loot-icon">{item.icon}</span>
                  <div className="loot-item-info">
                    <h4 style={{ color: RARITY_COLORS[item.rarity] }}>{item.name}</h4>
                    <p className="loot-rarity">{RARITY_NAMES[item.rarity]} | iLv.{item.itemLevel}</p>
                    <p className="loot-stat">+{item.baseStat} {SLOT_BASE_STAT[item.slot]}</p>
                    {item.bonusStats.map((bs, j) => (
                      <p key={j} className="loot-bonus">+{bs.value} {bs.statName}</p>
                    ))}
                    {item.isEasterEgg && <p className="easter-egg-tag">🌟 LEGENDARY ARTIFACT 🌟</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-loot">No items dropped this time.</p>
          )}

          <button className="btn btn-primary btn-large" onClick={() => {
            setGameState(p => ({
              ...p,
              screen: 'exploration',
              currentMapProgress: p.currentMapProgress + 1,
              combat: { ...p.combat, isActive: false },
            }));
          }}>
            Continue Exploring
          </button>
        </div>
      </div>
    );
  }

  // ═══ INVENTORY ═══
  if (gameState.screen === 'inventory') {
    const [invTab, setInvTab] = useState<'player' | 'followers'>('player');
    const [selFollower, setSelFollower] = useState(0);

    const equipFromInventory = (item: Equipment) => {
      if (invTab === 'player') {
        const oldItem = equipItem(player, item);
        const newInv = player.inventory.filter(i => i.id !== item.id);
        if (oldItem) newInv.push(oldItem);
        updatePlayer({
          equipment: { ...player.equipment, [item.slot]: item },
          inventory: newInv,
        });
        showMsg(`Equipped ${item.name}`);
      } else if (player.followers[selFollower]) {
        const oldItem = equipItem(player, item, true, selFollower);
        const newInv = player.inventory.filter(i => i.id !== item.id);
        if (oldItem) newInv.push(oldItem);
        player.followers[selFollower].equipment[item.slot] = item;
        updatePlayer({
          inventory: newInv,
          followers: [...player.followers],
        });
        showMsg(`${player.followers[selFollower].name} equipped ${item.name}`);
      }
      setSelectedItem(null);
    };

    const salvageItem = (item: Equipment) => {
      const goldGain = item.itemLevel * (item.rarity === 'mythic' ? 50 : item.rarity === 'legendary' ? 30 : item.rarity === 'epic' ? 15 : item.rarity === 'rare' ? 8 : item.rarity === 'uncommon' ? 4 : 2);
      updatePlayer({
        inventory: player.inventory.filter(i => i.id !== item.id),
        gold: player.gold + goldGain,
      });
      showMsg(`Salvaged for ${goldGain} gold`);
      setSelectedItem(null);
    };

    return (
      <div className="screen inventory-screen">
        <div className="inv-header">
          <h2>Inventory</h2>
          <button className="btn btn-secondary btn-back" onClick={() => changeScreen('town_hub')}>🏠 Town</button>
        </div>

        <div className="inv-tabs">
          <button className={`inv-tab ${invTab === 'player' ? 'active' : ''}`} onClick={() => setInvTab('player')}>Hero</button>
          <button className={`inv-tab ${invTab === 'followers' ? 'active' : ''}`} onClick={() => setInvTab('followers')}>Followers</button>
        </div>

        <div className="equipped-gear">
          <h4>Equipped</h4>
          <div className="gear-slots">
            {(['weapon', 'shield', 'armor', 'accessory'] as EquipmentSlot[]).map(slot => {
              const item = invTab === 'player' ? player.equipment[slot] : (player.followers[selFollower]?.equipment[slot] || null);
              return (
                <div key={slot} className="gear-slot" onClick={() => item && setSelectedItem(item)}>
                  <span className="gear-slot-label">{slot}</span>
                  {item ? (
                    <div className="gear-item" style={{ borderColor: RARITY_COLORS[item.rarity] }}>
                      <span className="gear-icon">{item.icon}</span>
                      <span className="gear-name" style={{ color: RARITY_COLORS[item.rarity] }}>{item.name}</span>
                    </div>
                  ) : (
                    <span className="gear-empty">Empty</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {invTab === 'followers' && (
          <div className="follower-select">
            {player.followers.map((f: Follower, i: number) => (
              <button key={i} className={`follower-tab ${selFollower === i ? 'active' : ''} ${!f.isAlive ? 'dead' : ''}`} onClick={() => setSelFollower(i)}>
                <img src={f.portrait} alt={f.name} />
                <span>{f.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="inventory-grid">
          <h4>Backpack ({player.inventory.length}/{GAME_CONFIG.INVENTORY_SIZE})</h4>
          <div className="inv-items">
            {player.inventory.map((item: Equipment) => (
              <div
                key={item.id}
                className={`inv-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
                style={{ borderColor: RARITY_COLORS[item.rarity] }}
                onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
              >
                <span className="inv-icon">{item.icon}</span>
                <span className="inv-name" style={{ color: RARITY_COLORS[item.rarity] }}>{item.name}</span>
                <span className="inv-ilvl">iLv.{item.itemLevel}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedItem && (
          <div className="item-detail">
            <h3 style={{ color: RARITY_COLORS[selectedItem.rarity] }}>{selectedItem.icon} {selectedItem.name}</h3>
            <p>{RARITY_NAMES[selectedItem.rarity]} | iLv.{selectedItem.itemLevel} | {selectedItem.slot}</p>
            <p className="detail-base">+{selectedItem.baseStat} {SLOT_BASE_STAT[selectedItem.slot]}</p>
            {selectedItem.bonusStats.map((bs, i) => (
              <p key={i} className="detail-bonus">+{bs.value} {bs.statName}</p>
            ))}
            {selectedItem.description && <p className="detail-desc">{selectedItem.description}</p>}
            {selectedItem.isEasterEgg && <p className="easter-egg-tag">🌟 LEGENDARY ARTIFACT 🌟</p>}
            <div className="item-actions">
              <button className="btn btn-primary" onClick={() => equipFromInventory(selectedItem)}>Equip</button>
              <button className="btn btn-secondary" onClick={() => salvageItem(selectedItem)}>Salvage</button>
            </div>
          </div>
        )}
        {showMessage && <div className="toast-message">{message}</div>}
      </div>
    );
  }

  // ═══ SKILLS SCREEN ═══
  if (gameState.screen === 'skills') {
    return (
      <div className="screen skills-screen">
        <div className="skills-bg" style={{ backgroundImage: 'url(/assets/bg-lothlorien.jpg)' }} />
        <div className="skills-overlay" />
        <div className="skills-content">
          <div className="skills-header">
            <h2>Skills & Abilities</h2>
            <button className="btn btn-secondary btn-back" onClick={() => changeScreen('town_hub')}>🏠 Town</button>
          </div>

          {player.statPoints > 0 && (
            <div className="stat-points-section">
              <h3>Stat Points Available: {player.statPoints}</h3>
              <div className="stat-alloc">
                {(['STR', 'AGI', 'INT', 'LUCK', 'VIT'] as const).map(stat => (
                  <div key={stat} className="stat-alloc-row">
                    <span>{stat}: {player.baseStats[stat]}</span>
                    <button
                      className="btn-stat"
                      onClick={() => {
                        if (player.statPoints <= 0) return;
                        const newStats = { ...player.baseStats, [stat]: player.baseStats[stat] + 1 };
                        updatePlayer({
                          baseStats: newStats,
                          statPoints: player.statPoints - 1,
                        });
                        showMsg(`${stat} increased!`);
                      }}
                      disabled={player.statPoints <= 0}
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="skills-section">
            <h3>Learned Skills ({player.skills.filter((s: Skill) => s.learned).length})</h3>
            {player.skills.length === 0 && <p>No skills learned yet. Meet the Istari to learn!</p>}
            {player.skills.filter((s: Skill) => s.learned).map((skill: Skill) => (
              <div key={skill.id} className="skill-card">
                <h4>{skill.name}</h4>
                <p>{skill.description}</p>
                {skill.wizardName && <p className="skill-source">Taught by {skill.wizardName}</p>}
              </div>
            ))}
          </div>

          <div className="skills-stats">
            <h3>Character Stats</h3>
            <div className="stats-grid">
              <div className="stat-block">
                <h4>Core Stats</h4>
                <p>STR: {player.baseStats.STR} (ATK +{player.baseStats.STR})</p>
                <p>AGI: {player.baseStats.AGI} (Dodge +{(player.baseStats.AGI * 0.5).toFixed(1)}%)</p>
                <p>INT: {player.baseStats.INT} (MP +{player.baseStats.INT * 5})</p>
                <p>LUCK: {player.baseStats.LUCK} (Crit +{(player.baseStats.LUCK * 0.3).toFixed(1)}%)</p>
                <p>VIT: {player.baseStats.VIT} (HP +{player.baseStats.VIT * 10})</p>
              </div>
              <div className="stat-block">
                <h4>Derived Stats</h4>
                <p>ATK: {totalStats.atk}</p>
                <p>DEF: {totalStats.def}</p>
                <p>HP: {totalStats.currentHp}/{totalStats.maxHp}</p>
                <p>MP: {totalStats.currentMana}/{totalStats.maxMana}</p>
                <p>Magic: {totalStats.magicPower}</p>
              </div>
              <div className="stat-block">
                <h4>Combat Stats</h4>
                <p>Dodge: {totalStats.dodgeChance.toFixed(1)}%</p>
                <p>Accuracy: {totalStats.accuracy.toFixed(1)}%</p>
                <p>Crit Rate: {totalStats.critRate.toFixed(1)}%</p>
                <p>Crit Dmg: {totalStats.critDamage.toFixed(0)}%</p>
              </div>
              <div className="stat-block">
                <h4>Bonus Stats</h4>
                <p>ATK%: +{totalStats.atkPercent}%</p>
                <p>DEF%: +{totalStats.defPercent}%</p>
                <p>Life Steal: {totalStats.lifeSteal}%</p>
                <p>Mana Steal: {totalStats.manaSteal}%</p>
                <p>Kill Chance: {totalStats.killChance}%</p>
                <p>Block: {totalStats.blockChance}%</p>
              </div>
            </div>
          </div>
        </div>
        {showMessage && <div className="toast-message">{message}</div>}
      </div>
    );
  }

  // ═══ FOLLOWERS SCREEN ═══
  if (gameState.screen === 'followers') {
    return (
      <div className="screen followers-screen">
        <div className="followers-bg" style={{ backgroundImage: 'url(/assets/bg-rohan.jpg)' }} />
        <div className="followers-overlay" />
        <div className="followers-content">
          <div className="followers-header">
            <h2>Your Fellowship</h2>
            <button className="btn btn-secondary btn-back" onClick={() => changeScreen('town_hub')}>🏠 Town</button>
          </div>

          {player.followers.length === 0 && (
            <div className="no-followers">
              <p>No followers yet. Explore maps to find companions!</p>
              <p>Tip: You can recruit up to 4 followers.</p>
            </div>
          )}

          <div className="followers-list">
            {player.followers.map((follower: Follower, i: number) => (
              <div key={follower.id} className={`follower-card ${!follower.isAlive ? 'dead' : ''}`}>
                <img src={follower.portrait} alt={follower.name} className="follower-img" />
                <div className="follower-info">
                  <h3>{follower.name} <span>{follower.title}</span></h3>
                  <p className="follower-level">Level {follower.level}</p>
                  <div className="follower-bars">
                    <div className="bar"><div className="bar-fill hp-fill" style={{ width: `${(follower.stats.currentHp / follower.stats.maxHp) * 100}%` }} /></div>
                    <span className="hp-text">{follower.stats.currentHp}/{follower.stats.maxHp}</span>
                  </div>
                  <div className="follower-gear">
                    {(['weapon', 'shield', 'armor', 'accessory'] as EquipmentSlot[]).map(slot => {
                      const item = follower.equipment[slot];
                      return (
                        <div key={slot} className="follower-gear-slot">
                          <span className="gear-slot-label">{slot}</span>
                          {item ? (
                            <span style={{ color: RARITY_COLORS[item.rarity] }}>{item.icon} {item.name}</span>
                          ) : (
                            <span className="empty">Empty</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => {
                    const newFollowers = player.followers.filter((_: Follower, idx: number) => idx !== i);
                    updatePlayer({ followers: newFollowers });
                    showMsg(`${follower.name} has left the fellowship.`);
                  }}
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
        {showMessage && <div className="toast-message">{message}</div>}
      </div>
    );
  }

  // ═══ GAME OVER ═══
  if (gameState.screen === 'game_over') {
    return (
      <div className="screen gameover-screen">
        <div className="gameover-bg" style={{ backgroundImage: 'url(/assets/bg-mountdoom.jpg)' }} />
        <div className="gameover-overlay" />
        <div className="gameover-content">
          <h1>You Have Fallen</h1>
          <p className="gameover-sub">Even the bravest heroes meet their end...</p>
          <div className="gameover-stats">
            <p>Level Reached: {player.level}</p>
            <p>Enemies Defeated: {player.totalKills}</p>
            <p>Bosses Slain: {player.bossesDefeated}</p>
            <p>Maps Cleared: {player.mapsUnlocked - 1}/12</p>
          </div>
          <div className="gameover-actions">
            <button className="btn btn-primary btn-large" onClick={() => {
              const healedStats = { ...totalStats, currentHp: totalStats.maxHp, currentMana: totalStats.maxMana };
              reviveFollowers(player);
              updatePlayer({ totalStats: healedStats });
              changeScreen('town_hub');
            }}>
              Revive at House of Elrond
            </button>
            <button className="btn btn-danger" onClick={() => {
              if (confirm('Start a new adventure? All progress will be lost!')) {
                deleteSave();
                setGameState({
                  screen: 'title',
                  player: createNewPlayer('Hero'),
                  combat: { isActive: false, enemies: [], currentTurn: 0, combatLog: [], playerActionPending: false, selectedSkill: null, lootDropped: [], expGained: 0, goldGained: 0 },
                  currentEvent: null,
                  currentMapProgress: 0,
                  settings: gameState.settings,
                });
              }
            }}>
              New Adventure
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ VICTORY (Game Complete) ═══
  if (gameState.screen === 'victory') {
    return (
      <div className="screen victory-screen">
        <div className="victory-bg" style={{ backgroundImage: 'url(/assets/bg-greyhavens.jpg)' }} />
        <div className="victory-overlay" />
        <div className="victory-content">
          <h1>The Ring is Destroyed!</h1>
          <h2>Middle-earth is Saved</h2>
          <p className="victory-desc">You have completed the epic journey through all 12 maps of Middle-earth!</p>
          <div className="victory-stats">
            <p>Final Level: {player.level}</p>
            <p>Total Kills: {player.totalKills}</p>
            <p>Bosses Defeated: {player.bossesDefeated}</p>
          </div>
          <button className="btn btn-primary btn-large" onClick={() => changeScreen('town_hub')}>
            Continue Playing
          </button>
        </div>
      </div>
    );
  }

  // ═══ DEFAULT ═══
  return (
    <div className="screen">
      <div className="loading">
        <h2>Loading Middle-earth...</h2>
        <button className="btn btn-primary" onClick={() => changeScreen('title')}>Return to Title</button>
      </div>
    </div>
  );
}

export default App;
