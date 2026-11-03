/**
 * Neon Breaker DX - Pure Vanilla JS Edition
 * Zero-build, GitHub Pages compatible, 100% offline arcade block breaker.
 */

// --- CONFIGURATION & CONSTANTS ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const INITIAL_PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 16;
const BALL_RADIUS = 7;
const BASE_BALL_SPEED = 6.5;
const STORAGE_KEY = 'neon_breaker_dx_save_v1';

// --- AUDIO ENGINE (Web Audio API Synthesizer) ---
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setEnabled(val) {
    this.enabled = val;
  }

  playPaddleBounce() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {}
  }

  playBrickHit(combo = 1) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      const noteIdx = Math.min(Math.max(combo - 1, 0), scale.length - 1);
      const freq = scale[noteIdx];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = combo > 4 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    } catch {}
  }

  playExplosion() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.3);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.3);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }

  playPowerup() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.04 + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.04);
        osc.stop(this.ctx.currentTime + idx * 0.04 + 0.12);
      });
    } catch {}
  }

  playLaser() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {}
  }

  playShieldBounce() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(360, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch {}
  }

  playLifeLost() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch {}
  }

  playStageClear() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const notes = [
        { f: 523.25, d: 0.12 },
        { f: 659.25, d: 0.12 },
        { f: 783.99, d: 0.12 },
        { f: 1046.50, d: 0.28 }
      ];
      let t = this.ctx.currentTime;
      notes.forEach((n) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + n.d);
        t += n.d * 0.9;
      });
    } catch {}
  }

  playGameOver() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const notes = [
        { f: 392.00, d: 0.18 },
        { f: 369.99, d: 0.18 },
        { f: 349.23, d: 0.18 },
        { f: 311.13, d: 0.45 }
      ];
      let t = this.ctx.currentTime;
      notes.forEach((n) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.f, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + n.d);
        t += n.d * 0.85;
      });
    } catch {}
  }
}

const sound = new SoundEffects();

// --- STAGE DEFINITIONS ---
const N = 'NORMAL';
const A2 = 'ARMORED_2';
const A3 = 'ARMORED_3';
const EX = 'EXPLOSIVE';
const PR = 'PRISM';
const MY = 'MYSTERY';
const GD = 'GOLD';
const __ = null;

const CAMPAIGN_STAGES = [
  {
    id: 1,
    name: "01. 퍼스트 콘택트",
    subtitle: "네온 아케이드의 시작",
    rows: 5,
    cols: 8,
    layout: [
      [N, N, N, N, N, N, N, N],
      [N, N, MY, N, N, MY, N, N],
      [N, N, N, N, N, N, N, N],
      [__, N, N, GD, GD, N, N, __],
      [__, __, N, N, N, N, __, __]
    ]
  },
  {
    id: 2,
    name: "02. 셰브론 윙",
    subtitle: "대칭형 날개 구조",
    rows: 6,
    cols: 8,
    layout: [
      [N, __, __, __, __, __, __, N],
      [N, N, __, __, __, __, N, N],
      [N, A2, N, __, __, N, A2, N],
      [N, N, MY, EX, EX, MY, N, N],
      [__, N, N, GD, GD, N, N, __],
      [__, __, N, N, N, N, __, __]
    ]
  },
  {
    id: 3,
    name: "03. 네온 피라미드",
    subtitle: "정점에 도달하라",
    rows: 6,
    cols: 8,
    layout: [
      [__, __, __, GD, GD, __, __, __],
      [__, __, MY, A2, A2, MY, __, __],
      [__, N, A2, EX, EX, A2, N, __],
      [N, N, N, PR, PR, N, N, N],
      [N, A2, N, N, N, N, A2, N],
      [N, N, N, N, N, N, N, N]
    ]
  },
  {
    id: 4,
    name: "04. 마인 필드",
    subtitle: "연쇄 폭발의 쾌감",
    rows: 6,
    cols: 8,
    layout: [
      [EX, N, EX, N, N, EX, N, EX],
      [N, A2, N, MY, MY, N, A2, N],
      [EX, N, GD, EX, EX, GD, N, EX],
      [N, A2, N, N, N, N, A2, N],
      [EX, N, EX, N, N, EX, N, EX],
      [__, N, N, PR, PR, N, N, __]
    ]
  },
  {
    id: 5,
    name: "05. 다이아몬드 코어",
    subtitle: "중앙 에너지 핵 돌파",
    rows: 7,
    cols: 8,
    layout: [
      [__, __, __, A3, A3, __, __, __],
      [__, __, A2, GD, GD, A2, __, __],
      [__, A2, N, MY, MY, N, A2, __],
      [A3, GD, MY, EX, EX, MY, GD, A3],
      [__, A2, N, PR, PR, N, A2, __],
      [__, __, A2, GD, GD, A2, __, __],
      [__, __, __, A3, A3, __, __, __]
    ]
  },
  {
    id: 6,
    name: "06. 아머드 포트리스",
    subtitle: "삼중 장갑 방어선",
    rows: 6,
    cols: 8,
    layout: [
      [A3, A3, A3, A3, A3, A3, A3, A3],
      [A2, MY, A2, GD, GD, A2, MY, A2],
      [A2, A2, A2, A2, A2, A2, A2, A2],
      [N, EX, N, PR, PR, N, EX, N],
      [N, N, N, N, N, N, N, N],
      [__, N, N, GD, GD, N, N, __]
    ]
  },
  {
    id: 7,
    name: "07. 프리즘 스톰",
    subtitle: "다분할 멀티볼의 폭풍",
    rows: 6,
    cols: 8,
    layout: [
      [PR, N, PR, N, N, PR, N, PR],
      [N, MY, N, A2, A2, N, MY, N],
      [PR, GD, EX, N, N, EX, GD, PR],
      [N, A2, N, PR, PR, N, A2, N],
      [PR, N, MY, N, N, MY, N, PR],
      [N, N, N, GD, GD, N, N, N]
    ]
  },
  {
    id: 8,
    name: "08. 스페이스 인베이더",
    subtitle: "레트로 외계 함선",
    rows: 7,
    cols: 8,
    layout: [
      [__, N, __, __, __, __, N, __],
      [__, __, N, __, __, N, __, __],
      [__, N, A2, A2, A2, A2, N, __],
      [N, N, GD, A3, A3, GD, N, N],
      [N, MY, EX, A2, A2, EX, MY, N],
      [N, __, N, PR, PR, N, __, N],
      [__, N, __, __, __, __, N, __]
    ]
  },
  {
    id: 9,
    name: "09. 더블 헬릭스",
    subtitle: "교차하는 네온 나선",
    rows: 7,
    cols: 8,
    layout: [
      [A2, N, __, __, __, __, N, A2],
      [__, A2, N, __, __, N, A2, __],
      [__, __, A3, MY, MY, A3, __, __],
      [__, __, EX, GD, GD, EX, __, __],
      [__, __, A3, PR, PR, A3, __, __],
      [__, A2, N, __, __, N, A2, __],
      [A2, N, __, __, __, __, N, A2]
    ]
  },
  {
    id: 10,
    name: "10. 사이버 미로",
    subtitle: "정밀 궤적 사격",
    rows: 7,
    cols: 8,
    layout: [
      [A3, A3, A3, __, __, A3, A3, A3],
      [A3, MY, __, N, N, __, MY, A3],
      [A3, __, A2, GD, GD, A2, __, A3],
      [__, N, A2, EX, EX, A2, N, __],
      [A3, __, A2, PR, PR, A2, __, A3],
      [A3, MY, __, N, N, __, MY, A3],
      [A3, A3, A3, __, __, A3, A3, A3]
    ]
  },
  {
    id: 11,
    name: "11. 퀀텀 리액터",
    subtitle: "고농도 에너지 반응로",
    rows: 7,
    cols: 8,
    layout: [
      [EX, A3, PR, GD, GD, PR, A3, EX],
      [A3, MY, A2, A2, A2, A2, MY, A3],
      [PR, A2, EX, N, N, EX, A2, PR],
      [GD, A2, N, A3, A3, N, A2, GD],
      [PR, A2, EX, N, N, EX, A2, PR],
      [A3, MY, A2, A2, A2, A2, MY, A3],
      [EX, A3, PR, GD, GD, PR, A3, EX]
    ]
  },
  {
    id: 12,
    name: "12. 네온 오버로드",
    subtitle: "최후의 결전",
    rows: 8,
    cols: 8,
    layout: [
      [A3, A3, A3, GD, GD, A3, A3, A3],
      [A3, MY, EX, A3, A3, EX, MY, A3],
      [A2, A3, PR, A2, A2, PR, A3, A2],
      [A2, GD, A2, EX, EX, A2, GD, A2],
      [N, A2, MY, PR, PR, MY, A2, N],
      [N, N, A2, GD, GD, A2, N, N],
      [N, EX, N, A2, A2, N, EX, N],
      [PR, N, N, N, N, N, N, PR]
    ]
  }
];

function generateEndlessRow(wave, cols = 8) {
  const row = [];
  const armorChance = Math.min(0.15 + wave * 0.04, 0.6);
  const explosiveChance = 0.12;
  const mysteryChance = 0.10;
  const prismChance = 0.08;
  const goldChance = 0.08;

  for (let c = 0; c < cols; c++) {
    if (Math.random() < 0.15) {
      row.push(null);
      continue;
    }
    const rand = Math.random();
    if (rand < explosiveChance) {
      row.push('EXPLOSIVE');
    } else if (rand < explosiveChance + mysteryChance) {
      row.push('MYSTERY');
    } else if (rand < explosiveChance + mysteryChance + prismChance) {
      row.push('PRISM');
    } else if (rand < explosiveChance + mysteryChance + prismChance + goldChance) {
      row.push('GOLD');
    } else if (Math.random() < armorChance) {
      row.push(wave > 4 && Math.random() < 0.4 ? 'ARMORED_3' : 'ARMORED_2');
    } else {
      row.push('NORMAL');
    }
  }

  const activeCount = row.filter(r => r !== null).length;
  if (activeCount < 3) {
    row[0] = 'NORMAL';
    row[Math.floor(cols / 2)] = 'MYSTERY';
    row[cols - 1] = 'NORMAL';
  }
  return row;
}

function getBrickDetails(type) {
  switch (type) {
    case 'NORMAL':
      return { hp: 1, maxHp: 1, color: '#06b6d4', glowColor: 'rgba(6, 182, 212, 0.6)', points: 100 };
    case 'ARMORED_2':
      return { hp: 2, maxHp: 2, color: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.6)', points: 250 };
    case 'ARMORED_3':
      return { hp: 3, maxHp: 3, color: '#8b5cf6', glowColor: 'rgba(139, 92, 246, 0.7)', points: 400 };
    case 'EXPLOSIVE':
      return { hp: 1, maxHp: 1, color: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.8)', points: 150 };
    case 'PRISM':
      return { hp: 1, maxHp: 1, color: '#ec4899', glowColor: 'rgba(236, 72, 153, 0.8)', points: 200 };
    case 'MYSTERY':
      return { hp: 1, maxHp: 1, color: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.8)', points: 150 };
    case 'GOLD':
      return { hp: 1, maxHp: 1, color: '#eab308', glowColor: 'rgba(234, 179, 8, 0.9)', points: 500 };
    default:
      return { hp: 1, maxHp: 1, color: '#06b6d4', glowColor: 'rgba(6, 182, 212, 0.6)', points: 100 };
  }
}

// --- GAME ENGINE STATE ---
class NeonBreakerGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Persistence
    this.saveData = this.loadSaveData();
    sound.setEnabled(this.saveData.soundEnabled);

    // Game Mode & State
    this.mode = 'CAMPAIGN'; // 'CAMPAIGN' | 'ENDLESS' | 'TIME_ATTACK'
    this.gameState = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'STAGE_CLEAR' | 'GAME_OVER'
    this.currentStageId = this.saveData.highestUnlockedStage || 1;

    // Numerical State
    this.score = 0;
    this.lives = 3;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeRemaining = 120;
    this.timeAttackTimer = null;

    // Physics Entities
    this.paddle = {
      x: (CANVAS_WIDTH - INITIAL_PADDLE_WIDTH) / 2,
      y: CANVAS_HEIGHT - 38,
      width: INITIAL_PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: 9,
      hasLaser: false,
      laserCooldown: 0
    };

    this.balls = [];
    this.bricks = [];
    this.powerUps = [];
    this.lasers = [];
    this.particles = [];
    this.floatingTexts = [];
    this.activePowerUps = new Map();

    this.ballAttached = true;
    this.hasShield = false;
    this.shakeTime = 0;
    this.endlessWave = 1;
    this.endlessTimer = 0;

    // Input Tracking
    this.keys = { left: false, right: false, space: false };

    // Bind Event Listeners
    this.setupEventListeners();

    // Render Initial UI Elements
    this.updateHUD();
    this.renderStageSelectModal();
    this.showModal('menuModal');

    // Start 60fps Loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  loadSaveData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return Object.assign({
          highScore: 0,
          endlessHighScore: 0,
          timeAttackHighScore: 0,
          highestUnlockedStage: 1,
          stageStars: {},
          soundEnabled: true
        }, JSON.parse(saved));
      }
    } catch {}
    return {
      highScore: 0,
      endlessHighScore: 0,
      timeAttackHighScore: 0,
      highestUnlockedStage: 1,
      stageStars: {},
      soundEnabled: true
    };
  }

  saveGame() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.saveData));
    } catch {}
    this.updateMenuScores();
  }

  // --- CONTROLS SETUP ---
  setupEventListeners() {
    // Window Resize / Pointer movement
    this.canvas.addEventListener('pointermove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const mouseX = (e.clientX - rect.left) * scaleX;

      this.paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - this.paddle.width, mouseX - this.paddle.width / 2));

      if (this.ballAttached && this.balls.length > 0) {
        this.balls[0].x = this.paddle.x + this.paddle.width / 2;
        this.balls[0].y = this.paddle.y - BALL_RADIUS - 1;
      }
    });

    this.canvas.addEventListener('pointerdown', () => {
      if (this.gameState === 'PLAYING') {
        if (this.ballAttached) {
          this.launchBall();
        } else if (this.paddle.hasLaser) {
          this.shootLaser();
        }
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.keys.left = true;
      }
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keys.right = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        this.keys.space = true;
        if (this.gameState === 'PLAYING') {
          if (this.ballAttached) {
            this.launchBall();
          } else if (this.paddle.hasLaser) {
            this.shootLaser();
          }
        }
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.gameState === 'PLAYING') {
          this.pauseGame();
        } else if (this.gameState === 'PAUSED') {
          this.resumeGame();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.keys.left = false;
      }
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keys.right = false;
      }
      if (e.code === 'Space') {
        this.keys.space = false;
      }
    });

    // Top Bar & Modal Buttons
    document.getElementById('btnStartCampaign').addEventListener('click', () => {
      this.startGame('CAMPAIGN', this.saveData.highestUnlockedStage || 1);
    });
    document.getElementById('btnStartEndless').addEventListener('click', () => {
      this.startGame('ENDLESS', 1);
    });
    document.getElementById('btnStartTimeAttack').addEventListener('click', () => {
      this.startGame('TIME_ATTACK', 1);
    });
    document.getElementById('btnNewGameHeader').addEventListener('click', () => {
      this.startGame('CAMPAIGN', 1);
    });

    // Nav Links
    document.getElementById('navCampaign').addEventListener('click', () => {
      this.startGame('CAMPAIGN', this.saveData.highestUnlockedStage || 1);
    });
    document.getElementById('navEndless').addEventListener('click', () => {
      this.startGame('ENDLESS', 1);
    });
    document.getElementById('navStages').addEventListener('click', () => {
      this.showModal('stageSelectModal');
    });
    document.getElementById('navRules').addEventListener('click', () => {
      this.showModal('howToPlayModal');
    });

    // In-Menu Extra Buttons
    document.getElementById('btnOpenStagesMenu').addEventListener('click', () => {
      this.showModal('stageSelectModal');
    });
    document.getElementById('btnOpenRulesMenu').addEventListener('click', () => {
      this.showModal('howToPlayModal');
    });

    // HUD Action Buttons
    document.getElementById('btnToggleMute').addEventListener('click', () => {
      this.toggleMute();
    });
    document.getElementById('btnRestartHUD').addEventListener('click', () => {
      this.restartRound();
    });
    document.getElementById('btnPauseHUD').addEventListener('click', () => {
      if (this.gameState === 'PLAYING') this.pauseGame();
      else if (this.gameState === 'PAUSED') this.resumeGame();
    });

    // Pause Modal Buttons
    document.getElementById('btnResumePause').addEventListener('click', () => {
      this.resumeGame();
    });
    document.getElementById('btnRestartPause').addEventListener('click', () => {
      this.restartRound();
      this.hideAllModals();
    });
    document.getElementById('btnMainMenuPause').addEventListener('click', () => {
      this.returnToMenu();
    });

    // Stage Clear Modal Buttons
    document.getElementById('btnNextStage').addEventListener('click', () => {
      this.nextStage();
    });
    document.getElementById('btnRestartClear').addEventListener('click', () => {
      this.restartRound();
      this.hideAllModals();
    });
    document.getElementById('btnMainMenuClear').addEventListener('click', () => {
      this.returnToMenu();
    });

    // Game Over Modal Buttons
    document.getElementById('btnRetryGameOver').addEventListener('click', () => {
      this.restartRound();
      this.hideAllModals();
    });
    document.getElementById('btnMainMenuGameOver').addEventListener('click', () => {
      this.returnToMenu();
    });

    // Modal Close Buttons
    document.getElementById('btnCloseStageSelect').addEventListener('click', () => {
      this.closeStageSelect();
    });
    document.getElementById('btnCloseHowToPlay').addEventListener('click', () => {
      this.closeHowToPlay();
    });
    document.getElementById('btnConfirmRules').addEventListener('click', () => {
      this.closeHowToPlay();
    });
  }

  // --- MODAL MANAGEMENT ---
  showModal(id) {
    this.hideAllModals();
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');

    if (id === 'menuModal') {
      this.updateMenuScores();
    }
  }

  hideAllModals() {
    ['menuModal', 'stageSelectModal', 'pauseModal', 'stageClearModal', 'gameOverModal', 'howToPlayModal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
  }

  closeStageSelect() {
    document.getElementById('stageSelectModal').classList.add('hidden');
    if (this.gameState === 'MENU') {
      document.getElementById('menuModal').classList.remove('hidden');
    }
  }

  closeHowToPlay() {
    document.getElementById('howToPlayModal').classList.add('hidden');
    if (this.gameState === 'MENU') {
      document.getElementById('menuModal').classList.remove('hidden');
    }
  }

  updateMenuScores() {
    document.getElementById('menuHighScore').textContent = this.saveData.highScore.toLocaleString();
    document.getElementById('menuEndlessScore').textContent = this.saveData.endlessHighScore.toLocaleString();
    document.getElementById('menuTimeAttackScore').textContent = this.saveData.timeAttackHighScore.toLocaleString();
    document.getElementById('menuCampaignSubtitle').textContent = `스테이지 ${this.saveData.highestUnlockedStage || 1} 도전`;
  }

  renderStageSelectModal() {
    const container = document.getElementById('stageGridContainer');
    if (!container) return;
    container.innerHTML = '';

    CAMPAIGN_STAGES.forEach(st => {
      const isUnlocked = st.id <= this.saveData.highestUnlockedStage;
      const stars = this.saveData.stageStars[st.id] || 0;

      const btn = document.createElement('button');
      btn.className = `p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
        isUnlocked
          ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-cyan-500 cursor-pointer shadow-md'
          : 'bg-slate-950/40 border-slate-800/50 opacity-40 cursor-not-allowed'
      }`;
      btn.disabled = !isUnlocked;

      let starsHtml = '';
      for (let s = 1; s <= 3; s++) {
        starsHtml += `<span class="${s <= stars ? 'text-amber-400' : 'text-slate-700'}">★</span>`;
      }

      btn.innerHTML = `
        <div class="text-xs font-bold text-cyan-400">STAGE ${st.id}</div>
        <div class="text-xs font-semibold text-slate-200 mt-0.5 truncate w-full">${st.name.replace(/^\d+\.\s*/, '')}</div>
        <div class="flex items-center gap-0.5 mt-2 text-sm">${starsHtml}</div>
      `;

      if (isUnlocked) {
        btn.addEventListener('click', () => {
          this.closeStageSelect();
          this.startGame('CAMPAIGN', st.id);
        });
      }

      container.appendChild(btn);
    });
  }

  // --- GAME LIFECYCLE ---
  startGame(selectedMode, stageId = 1) {
    this.mode = selectedMode;
    this.currentStageId = stageId;
    this.score = 0;
    this.lives = 3;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeRemaining = 120;
    this.hasShield = false;
    this.activePowerUps.clear();
    this.powerUps = [];
    this.lasers = [];
    this.particles = [];
    this.floatingTexts = [];

    this.paddle.x = (CANVAS_WIDTH - INITIAL_PADDLE_WIDTH) / 2;
    this.paddle.y = CANVAS_HEIGHT - 38;
    this.paddle.width = INITIAL_PADDLE_WIDTH;
    this.paddle.hasLaser = false;
    this.paddle.laserCooldown = 0;

    if (this.mode === 'ENDLESS') {
      this.initEndlessBricks();
    } else {
      this.loadStage(this.currentStageId);
    }

    this.resetBallOnPaddle();
    this.hideAllModals();
    this.gameState = 'PLAYING';

    // Time Attack Timer
    if (this.timeAttackTimer) clearInterval(this.timeAttackTimer);
    if (this.mode === 'TIME_ATTACK') {
      this.timeAttackTimer = setInterval(() => {
        if (this.gameState === 'PLAYING') {
          this.timeRemaining -= 1;
          this.updateHUD();
          if (this.timeRemaining <= 0) {
            clearInterval(this.timeAttackTimer);
            this.handleGameOver();
          }
        }
      }, 1000);
    }

    this.updateHUD();
  }

  restartRound() {
    this.startGame(this.mode, this.currentStageId);
  }

  pauseGame() {
    if (this.gameState !== 'PLAYING') return;
    this.gameState = 'PAUSED';
    this.showModal('pauseModal');
    document.getElementById('pauseIcon').innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
  }

  resumeGame() {
    if (this.gameState !== 'PAUSED') return;
    this.hideAllModals();
    this.gameState = 'PLAYING';
    document.getElementById('pauseIcon').innerHTML = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;
  }

  returnToMenu() {
    this.gameState = 'MENU';
    if (this.timeAttackTimer) clearInterval(this.timeAttackTimer);
    this.showModal('menuModal');
  }

  toggleMute() {
    this.saveData.soundEnabled = !this.saveData.soundEnabled;
    sound.setEnabled(this.saveData.soundEnabled);
    this.saveGame();
    this.updateHUD();
  }

  // --- ENTITY MANAGEMENT ---
  loadStage(sId) {
    const stage = CAMPAIGN_STAGES.find(s => s.id === sId) || CAMPAIGN_STAGES[0];
    const newBricks = [];
    const paddingX = 40;
    const paddingTop = 60;
    const availableWidth = CANVAS_WIDTH - paddingX * 2;
    const brickGap = 8;
    const brickWidth = (availableWidth - (stage.cols - 1) * brickGap) / stage.cols;
    const brickHeight = 24;

    for (let r = 0; r < stage.layout.length; r++) {
      for (let c = 0; c < stage.layout[r].length; c++) {
        const type = stage.layout[r][c];
        if (!type) continue;
        const details = getBrickDetails(type);
        newBricks.push({
          id: `brick-${r}-${c}`,
          row: r,
          col: c,
          x: paddingX + c * (brickWidth + brickGap),
          y: paddingTop + r * (brickHeight + brickGap),
          width: brickWidth,
          height: brickHeight,
          type,
          hp: details.hp,
          maxHp: details.maxHp,
          color: details.color,
          points: details.points
        });
      }
    }
    this.bricks = newBricks;
  }

  initEndlessBricks() {
    const newBricks = [];
    const paddingX = 40;
    const paddingTop = 60;
    const availableWidth = CANVAS_WIDTH - paddingX * 2;
    const cols = 8;
    const brickGap = 8;
    const brickWidth = (availableWidth - (cols - 1) * brickGap) / cols;
    const brickHeight = 24;

    this.endlessWave = 1;
    this.endlessTimer = 0;

    for (let r = 0; r < 4; r++) {
      const rowTypes = generateEndlessRow(1, cols);
      for (let c = 0; c < cols; c++) {
        const type = rowTypes[c];
        if (!type) continue;
        const details = getBrickDetails(type);
        newBricks.push({
          id: `endless-${r}-${c}-${Math.random()}`,
          row: r,
          col: c,
          x: paddingX + c * (brickWidth + brickGap),
          y: paddingTop + r * (brickHeight + brickGap),
          width: brickWidth,
          height: brickHeight,
          type,
          hp: details.hp,
          maxHp: details.maxHp,
          color: details.color,
          points: details.points
        });
      }
    }
    this.bricks = newBricks;
  }

  dropEndlessRow() {
    this.endlessWave += 1;
    const paddingX = 40;
    const paddingTop = 60;
    const availableWidth = CANVAS_WIDTH - paddingX * 2;
    const cols = 8;
    const brickGap = 8;
    const brickWidth = (availableWidth - (cols - 1) * brickGap) / cols;
    const brickHeight = 24;

    let reachedBottom = false;
    this.bricks.forEach(b => {
      b.y += brickHeight + brickGap;
      if (b.y + b.height >= this.paddle.y - 15) {
        reachedBottom = true;
      }
    });

    if (reachedBottom) {
      sound.playGameOver();
      this.handleGameOver();
      return;
    }

    const rowTypes = generateEndlessRow(this.endlessWave, cols);
    for (let c = 0; c < cols; c++) {
      const type = rowTypes[c];
      if (!type) continue;
      const details = getBrickDetails(type);
      this.bricks.push({
        id: `endless-${this.endlessWave}-${c}-${Date.now()}`,
        row: 0,
        col: c,
        x: paddingX + c * (brickWidth + brickGap),
        y: paddingTop,
        width: brickWidth,
        height: brickHeight,
        type,
        hp: details.hp,
        maxHp: details.maxHp,
        color: details.color,
        points: details.points
      });
    }

    this.addFloatingText(CANVAS_WIDTH / 2, 40, `WAVE ${this.endlessWave}!`, '#a855f7');
  }

  resetBallOnPaddle() {
    this.ballAttached = true;
    this.balls = [
      {
        id: 1,
        x: this.paddle.x + this.paddle.width / 2,
        y: this.paddle.y - BALL_RADIUS - 1,
        dx: 0,
        dy: 0,
        radius: BALL_RADIUS,
        speed: BASE_BALL_SPEED,
        isFireball: false,
        trail: []
      }
    ];
  }

  launchBall() {
    if (!this.ballAttached) return;
    this.ballAttached = false;
    if (this.balls.length > 0) {
      const ball = this.balls[0];
      const initialAngle = (Math.random() * 0.4 - 0.2) - Math.PI / 2;
      ball.dx = ball.speed * Math.cos(initialAngle);
      ball.dy = ball.speed * Math.sin(initialAngle);
    }
    sound.playPaddleBounce();
  }

  shootLaser() {
    if (!this.paddle.hasLaser || this.paddle.laserCooldown > 0) return;
    this.paddle.laserCooldown = 0.22;

    this.lasers.push(
      { id: Math.random().toString(), x: this.paddle.x + 8, y: this.paddle.y - 12, dy: -12, width: 4, height: 16 },
      { id: Math.random().toString(), x: this.paddle.x + this.paddle.width - 12, y: this.paddle.y - 12, dy: -12, width: 4, height: 16 }
    );
    sound.playLaser();
  }

  applyPowerUp(type) {
    sound.playPowerup();
    const map = this.activePowerUps;

    switch (type) {
      case 'MULTI_BALL': {
        const curBalls = [...this.balls];
        curBalls.forEach(b => {
          this.balls.push(
            {
              id: Math.random(),
              x: b.x,
              y: b.y,
              dx: b.dx * 0.8 - b.dy * 0.5,
              dy: b.dy * 0.8 + b.dx * 0.5,
              radius: BALL_RADIUS,
              speed: b.speed,
              isFireball: b.isFireball,
              trail: []
            },
            {
              id: Math.random(),
              x: b.x,
              y: b.y,
              dx: b.dx * 0.8 + b.dy * 0.5,
              dy: b.dy * 0.8 - b.dx * 0.5,
              radius: BALL_RADIUS,
              speed: b.speed,
              isFireball: b.isFireball,
              trail: []
            }
          );
        });
        this.addFloatingText(this.paddle.x + this.paddle.width / 2, this.paddle.y - 30, 'MULTI-BALL!', '#10b981');
        break;
      }
      case 'WIDE_PADDLE': {
        this.paddle.width = INITIAL_PADDLE_WIDTH * 1.5;
        map.set('WIDE_PADDLE', { remaining: 15, max: 15, label: '와이드 패들', color: '#38bdf8' });
        this.addFloatingText(this.paddle.x + this.paddle.width / 2, this.paddle.y - 30, 'WIDE PADDLE!', '#38bdf8');
        break;
      }
      case 'LASER': {
        this.paddle.hasLaser = true;
        map.set('LASER', { remaining: 14, max: 14, label: '레이저 캐논', color: '#f43f5e' });
        this.addFloatingText(this.paddle.x + this.paddle.width / 2, this.paddle.y - 30, 'LASER CANNON!', '#f43f5e');
        break;
      }
      case 'FIREBALL': {
        this.balls.forEach(b => { b.isFireball = true; });
        map.set('FIREBALL', { remaining: 12, max: 12, label: '파이어볼 관통', color: '#f97316' });
        this.addFloatingText(this.paddle.x + this.paddle.width / 2, this.paddle.y - 30, 'FIREBALL!', '#f97316');
        break;
      }
      case 'SHIELD': {
        this.hasShield = true;
        map.set('SHIELD', { remaining: 20, max: 20, label: '에너지 쉴드', color: '#a855f7' });
        this.addFloatingText(this.paddle.x + this.paddle.width / 2, this.paddle.y - 30, 'SHIELD ACTIVE!', '#a855f7');
        break;
      }
      case 'SLOW_MO': {
        this.balls.forEach(b => {
          b.speed = BASE_BALL_SPEED * 0.7;
          const mag = Math.hypot(b.dx, b.dy);
          if (mag > 0) {
            b.dx = (b.dx / mag) * b.speed;
            b.dy = (b.dy / mag) * b.speed;
          }
        });
        map.set('SLOW_MO', { remaining: 10, max: 10, label: '슬로우 모션', color: '#06b6d4' });
        this.addFloatingText(this.paddle.x + this.paddle.width / 2, this.paddle.y - 30, 'SLOW-MO!', '#06b6d4');
        break;
      }
      case 'LIFE': {
        this.lives = Math.min(this.lives + 1, 5);
        this.addFloatingText(this.paddle.x + this.paddle.width / 2, this.paddle.y - 30, '+1 LIFE!', '#ec4899');
        break;
      }
    }

    this.updateHUD();
  }

  maybeDropPowerUp(x, y, brickType) {
    let shouldDrop = false;
    let chosenType = 'MULTI_BALL';
    const types = ['MULTI_BALL', 'LASER', 'WIDE_PADDLE', 'FIREBALL', 'SHIELD', 'SLOW_MO', 'LIFE'];

    if (brickType === 'MYSTERY') {
      shouldDrop = true;
      chosenType = types[Math.floor(Math.random() * types.length)];
    } else {
      if (Math.random() < 0.16) {
        shouldDrop = true;
        chosenType = types[Math.floor(Math.random() * types.length)];
      }
    }

    if (!shouldDrop) return;

    let color = '#38bdf8';
    let label = 'P';
    switch (chosenType) {
      case 'MULTI_BALL': color = '#10b981'; label = 'M'; break;
      case 'LASER': color = '#f43f5e'; label = 'L'; break;
      case 'WIDE_PADDLE': color = '#38bdf8'; label = 'W'; break;
      case 'FIREBALL': color = '#f97316'; label = 'F'; break;
      case 'SHIELD': color = '#a855f7'; label = 'S'; break;
      case 'SLOW_MO': color = '#06b6d4'; label = 'T'; break;
      case 'LIFE': color = '#ec4899'; label = '+'; break;
    }

    this.powerUps.push({
      id: Math.random().toString(),
      x: x + 15,
      y: y + 5,
      dy: 2.2,
      type: chosenType,
      width: 26,
      height: 26,
      color,
      label
    });
  }

  triggerBrickExplosion(target) {
    this.shakeTime = 0.35;
    sound.playExplosion();
    this.spawnParticles(target.x + target.width / 2, target.y + target.height / 2, '#ef4444', 28);
    this.addFloatingText(target.x + target.width / 2, target.y, 'BOOM!', '#ef4444');

    const centerX = target.x + target.width / 2;
    const centerY = target.y + target.height / 2;
    const radius = 95;

    this.bricks.forEach(b => {
      if (b.id === target.id) return;
      const bCenterX = b.x + b.width / 2;
      const bCenterY = b.y + b.height / 2;
      const dist = Math.hypot(bCenterX - centerX, bCenterY - centerY);

      if (dist <= radius) {
        b.hp = 0;
        this.score += b.points * 2;
        this.spawnParticles(bCenterX, bCenterY, b.color, 10);
        this.maybeDropPowerUp(b.x, b.y, b.type);
      }
    });
  }

  addFloatingText(x, y, text, color = '#38bdf8') {
    this.floatingTexts.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      alpha: 1.0,
      dy: -1.5
    });
  }

  spawnParticles(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3,
        color,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03
      });
    }
  }

  // --- VICTORY & GAME OVER ---
  handleStageClear() {
    this.gameState = 'STAGE_CLEAR';
    sound.playStageClear();

    const stars = this.lives >= 3 ? 3 : this.lives >= 2 ? 2 : 1;
    const newHigh = Math.max(this.saveData.highScore, this.score);
    const nextUnlocked = Math.max(this.saveData.highestUnlockedStage, Math.min(this.currentStageId + 1, 12));
    const currentStar = this.saveData.stageStars[this.currentStageId] || 0;

    this.saveData.highScore = newHigh;
    this.saveData.highestUnlockedStage = nextUnlocked;
    this.saveData.stageStars[this.currentStageId] = Math.max(currentStar, stars);
    this.saveGame();
    this.renderStageSelectModal();

    // Render Stage Clear Modal Details
    document.getElementById('clearStageTitle').textContent = `STAGE ${this.currentStageId} COMPLETED`;
    document.getElementById('clearScore').textContent = this.score.toLocaleString();
    document.getElementById('clearCombo').textContent = `${this.maxCombo} COMBO`;
    document.getElementById('clearLives').textContent = `${this.lives} / 5`;

    let starsHtml = '';
    for (let s = 1; s <= 3; s++) {
      starsHtml += `<span class="${s <= stars ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'text-slate-700'} text-4xl transition-all">★</span>`;
    }
    document.getElementById('clearStarsContainer').innerHTML = starsHtml;

    const nextBtn = document.getElementById('btnNextStage');
    const isLastStage = this.currentStageId >= CAMPAIGN_STAGES.length;
    if (isLastStage) {
      nextBtn.classList.add('hidden');
    } else {
      nextBtn.classList.remove('hidden');
      nextBtn.textContent = `다음 스테이지 (${this.currentStageId + 1})`;
    }

    this.showModal('stageClearModal');
  }

  nextStage() {
    const nextId = this.currentStageId + 1;
    if (nextId <= CAMPAIGN_STAGES.length) {
      this.startGame('CAMPAIGN', nextId);
    } else {
      this.returnToMenu();
    }
  }

  handleGameOver() {
    this.gameState = 'GAME_OVER';
    sound.playGameOver();

    let isNewRecord = false;
    let prevBest = 0;

    if (this.mode === 'CAMPAIGN') {
      prevBest = this.saveData.highScore;
      if (this.score > this.saveData.highScore) {
        isNewRecord = true;
        this.saveData.highScore = this.score;
      }
    } else if (this.mode === 'ENDLESS') {
      prevBest = this.saveData.endlessHighScore;
      if (this.score > this.saveData.endlessHighScore) {
        isNewRecord = true;
        this.saveData.endlessHighScore = this.score;
      }
    } else if (this.mode === 'TIME_ATTACK') {
      prevBest = this.saveData.timeAttackHighScore;
      if (this.score > this.saveData.timeAttackHighScore) {
        isNewRecord = true;
        this.saveData.timeAttackHighScore = this.score;
      }
    }

    this.saveGame();

    document.getElementById('gameOverFinalScore').textContent = this.score.toLocaleString();
    document.getElementById('gameOverBestScore').textContent = prevBest.toLocaleString();
    const newRecordBadge = document.getElementById('gameOverNewRecordBadge');
    if (isNewRecord) {
      newRecordBadge.classList.remove('hidden');
    } else {
      newRecordBadge.classList.add('hidden');
    }

    this.showModal('gameOverModal');
  }

  // --- HUD UPDATER ---
  updateHUD() {
    // Mode title
    const stage = CAMPAIGN_STAGES.find(s => s.id === this.currentStageId) || CAMPAIGN_STAGES[0];
    const modeName = this.mode === 'CAMPAIGN' ? stage.name : this.mode === 'ENDLESS' ? 'ENDLESS SURVIVAL' : 'TIME ATTACK';
    document.getElementById('hudModeStage').textContent = modeName;

    // Time Attack HUD
    const timeBox = document.getElementById('hudTimeBox');
    if (this.mode === 'TIME_ATTACK') {
      timeBox.classList.remove('hidden');
      const timeVal = document.getElementById('hudTimeVal');
      const mins = Math.floor(this.timeRemaining / 60);
      const secs = (this.timeRemaining % 60).toString().padStart(2, '0');
      timeVal.textContent = `${mins}:${secs}`;
      if (this.timeRemaining <= 15) {
        timeVal.className = 'font-mono-numbers text-sm font-bold text-rose-400 animate-pulse';
      } else {
        timeVal.className = 'font-mono-numbers text-sm font-bold text-slate-200';
      }
    } else {
      timeBox.classList.add('hidden');
    }

    // Hearts (Lives)
    const heartsContainer = document.getElementById('hudHeartsContainer');
    heartsContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement('span');
      heart.className = `text-base transition-all ${
        i < this.lives
          ? 'text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]'
          : 'text-slate-700/60'
      }`;
      heart.textContent = '♥';
      heartsContainer.appendChild(heart);
    }

    // Score & Best
    document.getElementById('hudScoreVal').textContent = this.score.toLocaleString();
    const curBest = this.mode === 'CAMPAIGN' ? this.saveData.highScore : this.mode === 'ENDLESS' ? this.saveData.endlessHighScore : this.saveData.timeAttackHighScore;
    document.getElementById('hudBestVal').textContent = Math.max(this.score, curBest).toLocaleString();

    // Combo badge
    const comboBadge = document.getElementById('hudComboBadge');
    if (this.combo > 1) {
      const mult = Math.min(1 + Math.floor(this.combo / 2) * 0.5, 5);
      comboBadge.classList.remove('hidden');
      comboBadge.textContent = `${this.combo} COMBO (x${mult})`;
    } else {
      comboBadge.classList.add('hidden');
    }

    // Audio icon
    const muteIcon = document.getElementById('muteIcon');
    if (this.saveData.soundEnabled) {
      muteIcon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>`;
    } else {
      muteIcon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>`;
    }

    // Active power-up buffs
    const buffsBar = document.getElementById('hudBuffsBar');
    const buffsContainer = document.getElementById('hudBuffsContainer');
    if (this.activePowerUps.size > 0) {
      buffsBar.classList.remove('hidden');
      buffsContainer.innerHTML = '';
      this.activePowerUps.forEach((val, key) => {
        const item = document.createElement('div');
        item.className = 'flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold border';
        item.style.borderColor = `${val.color}66`;
        item.style.backgroundColor = `${val.color}15`;
        item.style.color = val.color;
        item.innerHTML = `<span>${val.label}</span><span class="font-mono-numbers text-[10px] opacity-80">${Math.ceil(val.remaining)}s</span>`;
        buffsContainer.appendChild(item);
      });
    } else {
      buffsBar.classList.add('hidden');
    }
  }

  // --- PHYSICS ENGINE TICK ---
  updatePhysics(dt) {
    // Keyboard paddle move
    if (this.keys.left) {
      this.paddle.x = Math.max(0, this.paddle.x - this.paddle.speed * 60 * dt);
    }
    if (this.keys.right) {
      this.paddle.x = Math.min(CANVAS_WIDTH - this.paddle.width, this.paddle.x + this.paddle.speed * 60 * dt);
    }

    if (this.paddle.laserCooldown > 0) {
      this.paddle.laserCooldown -= dt;
    }
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
    }

    // Endless mode wave trigger
    if (this.mode === 'ENDLESS') {
      this.endlessTimer += dt;
      if (this.endlessTimer >= 18) {
        this.endlessTimer = 0;
        this.dropEndlessRow();
      }
    }

    // Power-up durations
    let powerUpsChanged = false;
    this.activePowerUps.forEach((val, key) => {
      val.remaining -= dt;
      if (val.remaining <= 0) {
        this.activePowerUps.delete(key);
        powerUpsChanged = true;

        if (key === 'WIDE_PADDLE') {
          this.paddle.width = INITIAL_PADDLE_WIDTH;
        } else if (key === 'LASER') {
          this.paddle.hasLaser = false;
        } else if (key === 'FIREBALL') {
          this.balls.forEach(b => { b.isFireball = false; });
        } else if (key === 'SHIELD') {
          this.hasShield = false;
        } else if (key === 'SLOW_MO') {
          this.balls.forEach(b => {
            b.speed = BASE_BALL_SPEED;
            const mag = Math.hypot(b.dx, b.dy);
            if (mag > 0) {
              b.dx = (b.dx / mag) * b.speed;
              b.dy = (b.dy / mag) * b.speed;
            }
          });
        }
      }
    });

    if (powerUpsChanged) {
      this.updateHUD();
    }

    // If ball is attached, pin to paddle
    if (this.ballAttached && this.balls.length > 0) {
      this.balls[0].x = this.paddle.x + this.paddle.width / 2;
      this.balls[0].y = this.paddle.y - BALL_RADIUS - 1;
    }

    // Balls loop
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      if (this.ballAttached) continue;

      ball.trail.unshift({ x: ball.x, y: ball.y, alpha: 0.6 });
      if (ball.trail.length > 7) ball.trail.pop();
      ball.trail.forEach(t => { t.alpha *= 0.82; });

      ball.x += ball.dx * (60 * dt);
      ball.y += ball.dy * (60 * dt);

      // Left & Right
      if (ball.x - ball.radius <= 0) {
        ball.x = ball.radius;
        ball.dx = Math.abs(ball.dx);
        sound.playPaddleBounce();
      } else if (ball.x + ball.radius >= CANVAS_WIDTH) {
        ball.x = CANVAS_WIDTH - ball.radius;
        ball.dx = -Math.abs(ball.dx);
        sound.playPaddleBounce();
      }

      // Top
      if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius;
        ball.dy = Math.abs(ball.dy);
        sound.playPaddleBounce();
      }

      // Bottom / Shield
      if (ball.y + ball.radius >= CANVAS_HEIGHT - 6) {
        if (this.hasShield) {
          ball.y = CANVAS_HEIGHT - 6 - ball.radius;
          ball.dy = -Math.abs(ball.dy);
          this.hasShield = false;
          this.activePowerUps.delete('SHIELD');
          this.updateHUD();
          sound.playShieldBounce();
          this.shakeTime = 0.15;
          this.spawnParticles(ball.x, CANVAS_HEIGHT - 6, '#a855f7', 18);
          this.addFloatingText(ball.x, CANVAS_HEIGHT - 25, 'SHIELD SAVED!', '#a855f7');
        } else {
          this.balls.splice(i, 1);
          continue;
        }
      }

      // Paddle collision
      if (
        ball.y + ball.radius >= this.paddle.y &&
        ball.y - ball.radius <= this.paddle.y + this.paddle.height &&
        ball.x >= this.paddle.x - ball.radius &&
        ball.x <= this.paddle.x + this.paddle.width + ball.radius &&
        ball.dy > 0
      ) {
        this.combo = 0;
        this.updateHUD();

        const hitOffset = (ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
        const maxAngle = (70 * Math.PI) / 180;
        const angle = Math.max(-maxAngle, Math.min(maxAngle, hitOffset * maxAngle));

        const speed = ball.speed;
        ball.dx = speed * Math.sin(angle);
        ball.dy = -speed * Math.cos(angle);
        ball.y = this.paddle.y - ball.radius - 1;

        sound.playPaddleBounce();
        this.spawnParticles(ball.x, this.paddle.y, '#38bdf8', 6);
      }

      // Bricks collision
      for (let bIdx = this.bricks.length - 1; bIdx >= 0; bIdx--) {
        const brick = this.bricks[bIdx];

        if (
          ball.x + ball.radius > brick.x &&
          ball.x - ball.radius < brick.x + brick.width &&
          ball.y + ball.radius > brick.y &&
          ball.y - ball.radius < brick.y + brick.height
        ) {
          if (!ball.isFireball) {
            const prevX = ball.x - ball.dx * (60 * dt);
            const prevY = ball.y - ball.dy * (60 * dt);

            if (prevX + ball.radius <= brick.x || prevX - ball.radius >= brick.x + brick.width) {
              ball.dx = -ball.dx;
            } else {
              ball.dy = -ball.dy;
            }
          }

          brick.hp -= 1;
          this.combo += 1;
          if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
          }

          sound.playBrickHit(this.combo);

          const multiplier = Math.min(1 + Math.floor(this.combo / 2) * 0.5, 5);
          const earned = Math.round(brick.points * multiplier);
          this.score += earned;
          this.updateHUD();

          if (this.combo > 2) {
            this.addFloatingText(brick.x + brick.width / 2, brick.y, `+${earned} (x${multiplier})`, '#f59e0b');
          } else {
            this.addFloatingText(brick.x + brick.width / 2, brick.y, `+${earned}`, brick.color);
          }

          // Prism brick
          if (brick.type === 'PRISM') {
            sound.playPowerup();
            this.balls.push({
              id: Math.random(),
              x: ball.x,
              y: ball.y,
              dx: -ball.dx * 1.1,
              dy: ball.dy * 0.9,
              radius: BALL_RADIUS,
              speed: ball.speed,
              isFireball: ball.isFireball,
              trail: []
            });
            this.addFloatingText(brick.x + brick.width / 2, brick.y, 'PRISM SPLIT!', '#ec4899');
          }

          if (brick.hp <= 0) {
            this.spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 14);

            if (brick.type === 'EXPLOSIVE') {
              this.triggerBrickExplosion(brick);
            } else {
              this.maybeDropPowerUp(brick.x, brick.y, brick.type);
            }

            this.bricks.splice(bIdx, 1);
          } else {
            this.spawnParticles(ball.x, ball.y, '#ffffff', 5);
          }

          if (this.mode === 'CAMPAIGN' && this.bricks.length === 0) {
            this.handleStageClear();
            return;
          }

          if (!ball.isFireball) break;
        }
      }
    }

    // All balls lost
    if (this.balls.length === 0 && !this.ballAttached) {
      this.lives -= 1;
      this.combo = 0;
      this.updateHUD();

      if (this.lives <= 0) {
        sound.playGameOver();
        this.handleGameOver();
      } else {
        sound.playLifeLost();
        this.shakeTime = 0.2;
        this.resetBallOnPaddle();
      }
    }

    // Lasers update
    for (let lIdx = this.lasers.length - 1; lIdx >= 0; lIdx--) {
      const laser = this.lasers[lIdx];
      laser.y += laser.dy * (60 * dt);

      if (laser.y < 0) {
        this.lasers.splice(lIdx, 1);
        continue;
      }

      for (let bIdx = this.bricks.length - 1; bIdx >= 0; bIdx--) {
        const brick = this.bricks[bIdx];
        if (
          laser.x >= brick.x &&
          laser.x <= brick.x + brick.width &&
          laser.y >= brick.y &&
          laser.y <= brick.y + brick.height
        ) {
          brick.hp -= 1;
          this.score += Math.round(brick.points * 0.8);
          this.updateHUD();
          this.spawnParticles(laser.x, laser.y, '#f43f5e', 8);

          if (brick.hp <= 0) {
            this.spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 12);
            if (brick.type === 'EXPLOSIVE') {
              this.triggerBrickExplosion(brick);
            } else {
              this.maybeDropPowerUp(brick.x, brick.y, brick.type);
            }
            this.bricks.splice(bIdx, 1);
          }

          this.lasers.splice(lIdx, 1);
          break;
        }
      }
    }

    // Powerups falling
    for (let pIdx = this.powerUps.length - 1; pIdx >= 0; pIdx--) {
      const p = this.powerUps[pIdx];
      p.y += p.dy * (60 * dt);

      if (
        p.y + p.height >= this.paddle.y &&
        p.y <= this.paddle.y + this.paddle.height &&
        p.x + p.width >= this.paddle.x &&
        p.x <= this.paddle.x + this.paddle.width
      ) {
        this.applyPowerUp(p.type);
        this.powerUps.splice(pIdx, 1);
        continue;
      }

      if (p.y > CANVAS_HEIGHT) {
        this.powerUps.splice(pIdx, 1);
      }
    }

    // Particles decay
    for (let ptIdx = this.particles.length - 1; ptIdx >= 0; ptIdx--) {
      const pt = this.particles[ptIdx];
      pt.x += pt.dx * (60 * dt);
      pt.y += pt.dy * (60 * dt);
      pt.alpha -= pt.decay * (60 * dt);
      if (pt.alpha <= 0) {
        this.particles.splice(ptIdx, 1);
      }
    }

    // Floating text decay
    for (let ftIdx = this.floatingTexts.length - 1; ftIdx >= 0; ftIdx--) {
      const ft = this.floatingTexts[ftIdx];
      ft.y += ft.dy * (60 * dt);
      ft.alpha -= 0.02 * (60 * dt);
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(ftIdx, 1);
      }
    }
  }

  // --- RENDER SCENE ---
  render() {
    const ctx = this.ctx;
    ctx.save();

    // Screen Shake
    if (this.shakeTime > 0) {
      const shakeAmt = this.shakeTime * 18;
      const offsetX = (Math.random() - 0.5) * shakeAmt;
      const offsetY = (Math.random() - 0.5) * shakeAmt;
      ctx.translate(offsetX, offsetY);
    }

    // Canvas Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid lines
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Bottom Energy Shield
    if (this.hasShield) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(10, CANVAS_HEIGHT - 6);
      ctx.lineTo(CANVAS_WIDTH - 10, CANVAS_HEIGHT - 6);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Bricks
    this.bricks.forEach(brick => {
      ctx.save();
      ctx.fillStyle = brick.color;
      ctx.shadowColor = brick.color;
      ctx.shadowBlur = 8;

      const r = 4;
      ctx.beginPath();
      ctx.moveTo(brick.x + r, brick.y);
      ctx.lineTo(brick.x + brick.width - r, brick.y);
      ctx.quadraticCurveTo(brick.x + brick.width, brick.y, brick.x + brick.width, brick.y + r);
      ctx.lineTo(brick.x + brick.width, brick.y + brick.height - r);
      ctx.quadraticCurveTo(brick.x + brick.width, brick.y + brick.height, brick.x + brick.width - r, brick.y + brick.height);
      ctx.lineTo(brick.x + r, brick.y + brick.height);
      ctx.quadraticCurveTo(brick.x, brick.y + brick.height, brick.x, brick.y + brick.height - r);
      ctx.lineTo(brick.x, brick.y + r);
      ctx.quadraticCurveTo(brick.x, brick.y, brick.x + r, brick.y);
      ctx.closePath();
      ctx.fill();

      // Inner bevel
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(brick.x + 2, brick.y + 2, brick.width - 4, 3);

      // Armor crack
      if (brick.maxHp > 1 && brick.hp < brick.maxHp) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(brick.x + brick.width * 0.3, brick.y + 2);
        ctx.lineTo(brick.x + brick.width * 0.5, brick.y + brick.height * 0.6);
        ctx.lineTo(brick.x + brick.width * 0.75, brick.y + brick.height - 2);
        ctx.stroke();
      }

      // Special icons
      if (brick.type === 'EXPLOSIVE') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💣', brick.x + brick.width / 2, brick.y + brick.height / 2);
      } else if (brick.type === 'MYSTERY') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', brick.x + brick.width / 2, brick.y + brick.height / 2);
      } else if (brick.type === 'PRISM') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✦', brick.x + brick.width / 2, brick.y + brick.height / 2);
      } else if (brick.type === 'GOLD') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', brick.x + brick.width / 2, brick.y + brick.height / 2);
      }
      ctx.restore();
    });

    // Lasers
    this.lasers.forEach(laser => {
      ctx.save();
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#fb7185';
      ctx.shadowBlur = 10;
      ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
      ctx.restore();
    });

    // PowerUps
    this.powerUps.forEach(pu => {
      ctx.save();
      ctx.fillStyle = pu.color;
      ctx.shadowColor = pu.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(pu.x + pu.width / 2, pu.y + pu.height / 2, pu.width / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pu.label, pu.x + pu.width / 2, pu.y + pu.height / 2);
      ctx.restore();
    });

    // Paddle
    ctx.save();
    ctx.fillStyle = this.paddle.hasLaser ? '#f43f5e' : '#38bdf8';
    ctx.shadowColor = this.paddle.hasLaser ? '#fb7185' : '#38bdf8';
    ctx.shadowBlur = 14;

    const pr = 8;
    ctx.beginPath();
    ctx.moveTo(this.paddle.x + pr, this.paddle.y);
    ctx.lineTo(this.paddle.x + this.paddle.width - pr, this.paddle.y);
    ctx.quadraticCurveTo(this.paddle.x + this.paddle.width, this.paddle.y, this.paddle.x + this.paddle.width, this.paddle.y + pr);
    ctx.lineTo(this.paddle.x + this.paddle.width, this.paddle.y + this.paddle.height - pr);
    ctx.quadraticCurveTo(this.paddle.x + this.paddle.width, this.paddle.y + this.paddle.height, this.paddle.x + this.paddle.width - pr, this.paddle.y + this.paddle.height);
    ctx.lineTo(this.paddle.x + pr, this.paddle.y + this.paddle.height);
    ctx.quadraticCurveTo(this.paddle.x, this.paddle.y + this.paddle.height, this.paddle.x, this.paddle.y + this.paddle.height - pr);
    ctx.lineTo(this.paddle.x, this.paddle.y + pr);
    ctx.quadraticCurveTo(this.paddle.x, this.paddle.y, this.paddle.x + pr, this.paddle.y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.paddle.x + this.paddle.width / 2, this.paddle.y + this.paddle.height / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    if (this.paddle.hasLaser) {
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(this.paddle.x + 6, this.paddle.y - 6, 6, 6);
      ctx.fillRect(this.paddle.x + this.paddle.width - 12, this.paddle.y - 6, 6, 6);
    }
    ctx.restore();

    // Balls & Trails
    this.balls.forEach(ball => {
      ball.trail.forEach(t => {
        ctx.fillStyle = ball.isFireball 
          ? `rgba(249, 115, 22, ${t.alpha * 0.7})` 
          : `rgba(56, 189, 248, ${t.alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, ball.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.save();
      ctx.fillStyle = ball.isFireball ? '#f97316' : '#ffffff';
      ctx.shadowColor = ball.isFireball ? '#ea580c' : '#38bdf8';
      ctx.shadowBlur = ball.isFireball ? 18 : 12;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Particles
    this.particles.forEach(pt => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.alpha);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Floating text
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // Launch prompt
    if (this.ballAttached && this.gameState === 'PLAYING') {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '600 15px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('스페이스바 또는 클릭하여 공 발사!', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 65);
      ctx.restore();
    }

    ctx.restore();
  }

  // --- 60FPS MAIN LOOP ---
  gameLoop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (this.gameState === 'PLAYING') {
      this.updatePhysics(dt);
    }
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Start application on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.neonBreakerGame = new NeonBreakerGame();
});
