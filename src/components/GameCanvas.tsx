import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Ball, Paddle, Brick, BrickType, PowerUp, Laser, Particle, FloatingText, 
  GameMode, GameState, PowerUpType, ActivePowerUp, StageConfig 
} from '../types/game';
import { CAMPAIGN_STAGES, generateEndlessRow, getBrickDetails } from '../utils/stages';
import { sound } from '../utils/audio';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const INITIAL_PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 16;
const BALL_RADIUS = 7;
const BASE_BALL_SPEED = 6.5;

interface GameCanvasProps {
  mode: GameMode;
  stageId: number;
  gameState: GameState;
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
  onComboUpdate: (combo: number) => void;
  onActivePowerUpsChange: (powerUps: ActivePowerUp[]) => void;
  onStageClear: (stats: { score: number; maxCombo: number; livesRemaining: number }) => void;
  onGameOver: (finalScore: number) => void;
  onNextStage?: () => void;
  timeRemaining?: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  mode,
  stageId,
  gameState,
  onScoreUpdate,
  onLivesUpdate,
  onComboUpdate,
  onActivePowerUpsChange,
  onStageClear,
  onGameOver
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable Game References for 60fps Loop
  const scoreRef = useRef<number>(0);
  const livesRef = useRef<number>(3);
  const comboRef = useRef<number>(0);
  const maxComboRef = useRef<number>(0);
  const ballAttachedRef = useRef<boolean>(true);
  const shakeTimeRef = useRef<number>(0);
  const endlessWaveRef = useRef<number>(1);
  const endlessTimerRef = useRef<number>(0);

  // Entities
  const paddleRef = useRef<Paddle>({
    x: (CANVAS_WIDTH - INITIAL_PADDLE_WIDTH) / 2,
    y: CANVAS_HEIGHT - 38,
    width: INITIAL_PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 9,
    hasLaser: false,
    laserCooldown: 0
  });

  const ballsRef = useRef<Ball[]>([]);
  const bricksRef = useRef<Brick[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const lasersRef = useRef<Laser[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const activePowerUpsRef = useRef<Map<PowerUpType, { remaining: number; max: number; label: string; color: string }>>(new Map());
  const hasShieldRef = useRef<boolean>(false);

  // Keys tracking
  const keysRef = useRef<{ left: boolean; right: boolean; space: boolean }>({
    left: false,
    right: false,
    space: false
  });

  // UI state for screen shake css or effects
  const [isReady, setIsReady] = useState(false);

  // Helper to add floating score/text
  const addFloatingText = (x: number, y: number, text: string, color: string = '#38bdf8') => {
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      alpha: 1.0,
      dy: -1.5
    });
  };

  // Helper to trigger screen shake
  const triggerShake = (duration: number = 0.2) => {
    shakeTimeRef.current = duration;
  };

  // Helper to spawn explosion particles
  const spawnParticles = (x: number, y: number, color: string, count: number = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      particlesRef.current.push({
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
  };

  // Reset ball attached to paddle
  const resetBallOnPaddle = () => {
    ballAttachedRef.current = true;
    const p = paddleRef.current;
    ballsRef.current = [
      {
        id: 1,
        x: p.x + p.width / 2,
        y: p.y - BALL_RADIUS - 1,
        dx: 0,
        dy: 0,
        radius: BALL_RADIUS,
        speed: BASE_BALL_SPEED,
        isFireball: false,
        trail: []
      }
    ];
  };

  // Launch ball
  const launchBall = () => {
    if (!ballAttachedRef.current) return;
    ballAttachedRef.current = false;
    if (ballsRef.current.length > 0) {
      const ball = ballsRef.current[0];
      const initialAngle = (Math.random() * 0.4 - 0.2) - Math.PI / 2; // mostly upwards
      ball.dx = ball.speed * Math.cos(initialAngle);
      ball.dy = ball.speed * Math.sin(initialAngle);
    }
    sound.playPaddleBounce();
  };

  // Initialize Bricks for Stage
  const loadStage = useCallback((sId: number) => {
    const stage = CAMPAIGN_STAGES.find(s => s.id === sId) || CAMPAIGN_STAGES[0];
    const newBricks: Brick[] = [];
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
    bricksRef.current = newBricks;
  }, []);

  // Initialize Endless Mode Bricks
  const initEndlessBricks = useCallback(() => {
    const newBricks: Brick[] = [];
    const paddingX = 40;
    const paddingTop = 60;
    const availableWidth = CANVAS_WIDTH - paddingX * 2;
    const cols = 8;
    const brickGap = 8;
    const brickWidth = (availableWidth - (cols - 1) * brickGap) / cols;
    const brickHeight = 24;

    endlessWaveRef.current = 1;
    endlessTimerRef.current = 0;

    // Start with 4 rows
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
    bricksRef.current = newBricks;
  }, []);

  // Drop New Row for Endless Mode
  const dropEndlessRow = () => {
    endlessWaveRef.current += 1;
    const paddingX = 40;
    const paddingTop = 60;
    const availableWidth = CANVAS_WIDTH - paddingX * 2;
    const cols = 8;
    const brickGap = 8;
    const brickWidth = (availableWidth - (cols - 1) * brickGap) / cols;
    const brickHeight = 24;

    // Shift all existing bricks down
    let reachedBottom = false;
    bricksRef.current.forEach(b => {
      b.y += brickHeight + brickGap;
      if (b.y + b.height >= paddleRef.current.y - 15) {
        reachedBottom = true;
      }
    });

    if (reachedBottom) {
      // Game over if bricks breach player zone
      sound.playGameOver();
      onGameOver(scoreRef.current);
      return;
    }

    // Add new top row
    const rowTypes = generateEndlessRow(endlessWaveRef.current, cols);
    for (let c = 0; c < cols; c++) {
      const type = rowTypes[c];
      if (!type) continue;
      const details = getBrickDetails(type);
      bricksRef.current.push({
        id: `endless-${endlessWaveRef.current}-${c}-${Date.now()}`,
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

    addFloatingText(CANVAS_WIDTH / 2, 40, `WAVE ${endlessWaveRef.current}!`, '#a855f7');
  };

  // Full reset for stage or new game
  const resetGame = useCallback(() => {
    scoreRef.current = 0;
    livesRef.current = 3;
    comboRef.current = 0;
    maxComboRef.current = 0;
    hasShieldRef.current = false;
    activePowerUpsRef.current.clear();
    powerUpsRef.current = [];
    lasersRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];

    paddleRef.current = {
      x: (CANVAS_WIDTH - INITIAL_PADDLE_WIDTH) / 2,
      y: CANVAS_HEIGHT - 38,
      width: INITIAL_PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: 9,
      hasLaser: false,
      laserCooldown: 0
    };

    if (mode === 'ENDLESS') {
      initEndlessBricks();
    } else {
      loadStage(stageId);
    }

    resetBallOnPaddle();
    onScoreUpdate(0);
    onLivesUpdate(3);
    onComboUpdate(0);
    onActivePowerUpsChange([]);
  }, [mode, stageId, loadStage, initEndlessBricks, onScoreUpdate, onLivesUpdate, onComboUpdate, onActivePowerUpsChange]);

  // Handle stage change or initial mount
  useEffect(() => {
    resetGame();
    setIsReady(true);
  }, [stageId, mode, resetGame]);

  // Shoot Laser function
  const shootLaser = () => {
    if (!paddleRef.current.hasLaser || paddleRef.current.laserCooldown > 0) return;
    const p = paddleRef.current;
    paddleRef.current.laserCooldown = 0.22; // cooldown in seconds

    // Two laser beams from paddle edges
    lasersRef.current.push(
      { id: Math.random().toString(), x: p.x + 8, y: p.y - 12, dy: -12, width: 4, height: 16 },
      { id: Math.random().toString(), x: p.x + p.width - 12, y: p.y - 12, dy: -12, width: 4, height: 16 }
    );

    sound.playLaser();
  };

  // Apply PowerUp
  const applyPowerUp = (type: PowerUpType) => {
    sound.playPowerup();
    const map = activePowerUpsRef.current;

    switch (type) {
      case 'MULTI_BALL': {
        const curBalls = [...ballsRef.current];
        curBalls.forEach(b => {
          // Clone 2 extra balls at diverging angles
          ballsRef.current.push(
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
        addFloatingText(paddleRef.current.x + paddleRef.current.width / 2, paddleRef.current.y - 30, 'MULTI-BALL!', '#10b981');
        break;
      }
      case 'WIDE_PADDLE': {
        paddleRef.current.width = INITIAL_PADDLE_WIDTH * 1.5;
        map.set('WIDE_PADDLE', { remaining: 15, max: 15, label: '와이드 패들', color: '#38bdf8' });
        addFloatingText(paddleRef.current.x + paddleRef.current.width / 2, paddleRef.current.y - 30, 'WIDE PADDLE!', '#38bdf8');
        break;
      }
      case 'LASER': {
        paddleRef.current.hasLaser = true;
        map.set('LASER', { remaining: 14, max: 14, label: '레이저 캐논', color: '#f43f5e' });
        addFloatingText(paddleRef.current.x + paddleRef.current.width / 2, paddleRef.current.y - 30, 'LASER CANNON!', '#f43f5e');
        break;
      }
      case 'FIREBALL': {
        ballsRef.current.forEach(b => { b.isFireball = true; });
        map.set('FIREBALL', { remaining: 12, max: 12, label: '파이어볼 관통', color: '#f97316' });
        addFloatingText(paddleRef.current.x + paddleRef.current.width / 2, paddleRef.current.y - 30, 'FIREBALL!', '#f97316');
        break;
      }
      case 'SHIELD': {
        hasShieldRef.current = true;
        map.set('SHIELD', { remaining: 20, max: 20, label: '에너지 쉴드', color: '#a855f7' });
        addFloatingText(paddleRef.current.x + paddleRef.current.width / 2, paddleRef.current.y - 30, 'SHIELD ACTIVE!', '#a855f7');
        break;
      }
      case 'SLOW_MO': {
        ballsRef.current.forEach(b => {
          b.speed = BASE_BALL_SPEED * 0.7;
          const mag = Math.hypot(b.dx, b.dy);
          if (mag > 0) {
            b.dx = (b.dx / mag) * b.speed;
            b.dy = (b.dy / mag) * b.speed;
          }
        });
        map.set('SLOW_MO', { remaining: 10, max: 10, label: '슬로우 모션', color: '#06b6d4' });
        addFloatingText(paddleRef.current.x + paddleRef.current.width / 2, paddleRef.current.y - 30, 'SLOW-MO!', '#06b6d4');
        break;
      }
      case 'LIFE': {
        livesRef.current = Math.min(livesRef.current + 1, 5);
        onLivesUpdate(livesRef.current);
        addFloatingText(paddleRef.current.x + paddleRef.current.width / 2, paddleRef.current.y - 30, '+1 LIFE!', '#ec4899');
        break;
      }
    }

    // Sync active powerups to parent HUD
    syncActivePowerUps();
  };

  const syncActivePowerUps = () => {
    const list: ActivePowerUp[] = [];
    activePowerUpsRef.current.forEach((val, key) => {
      list.push({
        type: key,
        label: val.label,
        color: val.color,
        duration: val.max,
        remaining: val.remaining
      });
    });
    onActivePowerUpsChange(list);
  };

  // Drop powerup from brick
  const maybeDropPowerUp = (x: number, y: number, brickType: BrickType) => {
    let shouldDrop = false;
    let chosenType: PowerUpType = 'MULTI_BALL';

    const types: PowerUpType[] = ['MULTI_BALL', 'LASER', 'WIDE_PADDLE', 'FIREBALL', 'SHIELD', 'SLOW_MO', 'LIFE'];

    if (brickType === 'MYSTERY') {
      shouldDrop = true;
      chosenType = types[Math.floor(Math.random() * types.length)];
    } else {
      // 16% base chance for normal bricks
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

    powerUpsRef.current.push({
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
  };

  // Trigger explosive brick explosion
  const triggerBrickExplosion = (target: Brick) => {
    triggerShake(0.35);
    sound.playExplosion();
    spawnParticles(target.x + target.width / 2, target.y + target.height / 2, '#ef4444', 28);
    addFloatingText(target.x + target.width / 2, target.y, 'BOOM!', '#ef4444');

    // Destroy bricks within ~100px radius
    const centerX = target.x + target.width / 2;
    const centerY = target.y + target.height / 2;
    const radius = 95;

    bricksRef.current.forEach(b => {
      if (b.id === target.id) return;
      const bCenterX = b.x + b.width / 2;
      const bCenterY = b.y + b.height / 2;
      const dist = Math.hypot(bCenterX - centerX, bCenterY - centerY);

      if (dist <= radius) {
        b.hp = 0; // instantly destroy
        scoreRef.current += b.points * 2;
        spawnParticles(bCenterX, bCenterY, b.color, 10);
        maybeDropPowerUp(b.x, b.y, b.type);
      }
    });
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      }
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        keysRef.current.space = true;
        if (ballAttachedRef.current) {
          launchBall();
        } else if (paddleRef.current.hasLaser) {
          shootLaser();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      }
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
      if (e.code === 'Space') {
        keysRef.current.space = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse & Touch Controls
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;

    const p = paddleRef.current;
    p.x = Math.max(0, Math.min(CANVAS_WIDTH - p.width, mouseX - p.width / 2));

    // If ball is attached, move it along with paddle
    if (ballAttachedRef.current && ballsRef.current.length > 0) {
      ballsRef.current[0].x = p.x + p.width / 2;
      ballsRef.current[0].y = p.y - BALL_RADIUS - 1;
    }
  };

  const handlePointerDown = () => {
    if (ballAttachedRef.current) {
      launchBall();
    } else if (paddleRef.current.hasLaser) {
      shootLaser();
    }
  };

  // Main 60FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (canvas && gameState === 'PLAYING') {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 1. UPDATE GAME STATE
          updatePhysics(dt);

          // 2. RENDER SCENE
          renderScene(ctx);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]);

  // Update Game Physics
  const updatePhysics = (dt: number) => {
    const paddle = paddleRef.current;

    // Keyboard paddle movement
    if (keysRef.current.left) {
      paddle.x = Math.max(0, paddle.x - paddle.speed * 60 * dt);
    }
    if (keysRef.current.right) {
      paddle.x = Math.min(CANVAS_WIDTH - paddle.width, paddle.x + paddle.speed * 60 * dt);
    }

    // Laser cooldown tick
    if (paddle.laserCooldown > 0) {
      paddle.laserCooldown -= dt;
    }

    // Screen shake tick
    if (shakeTimeRef.current > 0) {
      shakeTimeRef.current -= dt;
    }

    // Endless Mode row spawn timer (every 18 seconds)
    if (mode === 'ENDLESS') {
      endlessTimerRef.current += dt;
      if (endlessTimerRef.current >= 18) {
        endlessTimerRef.current = 0;
        dropEndlessRow();
      }
    }

    // Active power-up countdowns
    const activeMap = activePowerUpsRef.current;
    let powerUpsChanged = false;

    activeMap.forEach((val, key) => {
      val.remaining -= dt;
      if (val.remaining <= 0) {
        // Expired!
        activeMap.delete(key);
        powerUpsChanged = true;

        if (key === 'WIDE_PADDLE') {
          paddle.width = INITIAL_PADDLE_WIDTH;
        } else if (key === 'LASER') {
          paddle.hasLaser = false;
        } else if (key === 'FIREBALL') {
          ballsRef.current.forEach(b => { b.isFireball = false; });
        } else if (key === 'SHIELD') {
          hasShieldRef.current = false;
        } else if (key === 'SLOW_MO') {
          ballsRef.current.forEach(b => {
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
      syncActivePowerUps();
    }

    // If ball is attached, pin it to paddle
    if (ballAttachedRef.current && ballsRef.current.length > 0) {
      ballsRef.current[0].x = paddle.x + paddle.width / 2;
      ballsRef.current[0].y = paddle.y - BALL_RADIUS - 1;
    }

    // Update Balls
    for (let i = ballsRef.current.length - 1; i >= 0; i--) {
      const ball = ballsRef.current[i];
      if (ballAttachedRef.current) continue;

      // Ball trail
      ball.trail.unshift({ x: ball.x, y: ball.y, alpha: 0.6 });
      if (ball.trail.length > 7) ball.trail.pop();
      ball.trail.forEach(t => { t.alpha *= 0.82; });

      // Move ball
      ball.x += ball.dx * (60 * dt);
      ball.y += ball.dy * (60 * dt);

      // Wall bounce: Left and Right
      if (ball.x - ball.radius <= 0) {
        ball.x = ball.radius;
        ball.dx = Math.abs(ball.dx);
        sound.playPaddleBounce();
      } else if (ball.x + ball.radius >= CANVAS_WIDTH) {
        ball.x = CANVAS_WIDTH - ball.radius;
        ball.dx = -Math.abs(ball.dx);
        sound.playPaddleBounce();
      }

      // Wall bounce: Top
      if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius;
        ball.dy = Math.abs(ball.dy);
        sound.playPaddleBounce();
      }

      // Bottom boundary / Shield collision
      if (ball.y + ball.radius >= CANVAS_HEIGHT - 6) {
        if (hasShieldRef.current) {
          // Bounce off shield!
          ball.y = CANVAS_HEIGHT - 6 - ball.radius;
          ball.dy = -Math.abs(ball.dy);
          hasShieldRef.current = false;
          activeMap.delete('SHIELD');
          syncActivePowerUps();
          sound.playShieldBounce();
          triggerShake(0.15);
          spawnParticles(ball.x, CANVAS_HEIGHT - 6, '#a855f7', 18);
          addFloatingText(ball.x, CANVAS_HEIGHT - 25, 'SHIELD SAVED!', '#a855f7');
        } else {
          // Ball lost
          ballsRef.current.splice(i, 1);
          continue;
        }
      }

      // Paddle collision
      if (
        ball.y + ball.radius >= paddle.y &&
        ball.y - ball.radius <= paddle.y + paddle.height &&
        ball.x >= paddle.x - ball.radius &&
        ball.x <= paddle.x + paddle.width + ball.radius &&
        ball.dy > 0
      ) {
        // Reset combo counter when hitting paddle
        comboRef.current = 0;
        onComboUpdate(0);

        // Angle deflection based on hit location relative to paddle center
        const hitOffset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        const maxAngle = (70 * Math.PI) / 180; // 70 degrees
        const angle = Math.max(-maxAngle, Math.min(maxAngle, hitOffset * maxAngle));

        const speed = ball.speed;
        ball.dx = speed * Math.sin(angle);
        ball.dy = -speed * Math.cos(angle);
        ball.y = paddle.y - ball.radius - 1;

        sound.playPaddleBounce();
        spawnParticles(ball.x, paddle.y, '#38bdf8', 6);
      }

      // Brick collisions
      for (let bIdx = bricksRef.current.length - 1; bIdx >= 0; bIdx--) {
        const brick = bricksRef.current[bIdx];

        // AABB check
        if (
          ball.x + ball.radius > brick.x &&
          ball.x - ball.radius < brick.x + brick.width &&
          ball.y + ball.radius > brick.y &&
          ball.y - ball.radius < brick.y + brick.height
        ) {
          // Hit detected!
          if (!ball.isFireball) {
            // Determine collision edge to bounce realistically
            const prevX = ball.x - ball.dx * (60 * dt);
            const prevY = ball.y - ball.dy * (60 * dt);

            if (prevX + ball.radius <= brick.x || prevX - ball.radius >= brick.x + brick.width) {
              ball.dx = -ball.dx;
            } else {
              ball.dy = -ball.dy;
            }
          }

          // Damage brick
          brick.hp -= 1;

          // Increment combo
          comboRef.current += 1;
          if (comboRef.current > maxComboRef.current) {
            maxComboRef.current = comboRef.current;
          }
          onComboUpdate(comboRef.current);

          // Audio
          sound.playBrickHit(comboRef.current);

          // Points with combo multiplier
          const multiplier = Math.min(1 + Math.floor(comboRef.current / 2) * 0.5, 5);
          const earned = Math.round(brick.points * multiplier);
          scoreRef.current += earned;
          onScoreUpdate(scoreRef.current);

          // Floating score text
          if (comboRef.current > 2) {
            addFloatingText(brick.x + brick.width / 2, brick.y, `+${earned} (x${multiplier})`, '#f59e0b');
          } else {
            addFloatingText(brick.x + brick.width / 2, brick.y, `+${earned}`, brick.color);
          }

          // Prism brick effect: duplicates the ball!
          if (brick.type === 'PRISM') {
            sound.playPowerup();
            ballsRef.current.push({
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
            addFloatingText(brick.x + brick.width / 2, brick.y, 'PRISM SPLIT!', '#ec4899');
          }

          // If brick destroyed
          if (brick.hp <= 0) {
            spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 14);

            if (brick.type === 'EXPLOSIVE') {
              triggerBrickExplosion(brick);
            } else {
              maybeDropPowerUp(brick.x, brick.y, brick.type);
            }

            bricksRef.current.splice(bIdx, 1);
          } else {
            // Hit spark
            spawnParticles(ball.x, ball.y, '#ffffff', 5);
          }

          // Check Stage Victory in Campaign Mode
          if (mode === 'CAMPAIGN' && bricksRef.current.length === 0) {
            sound.playStageClear();
            onStageClear({
              score: scoreRef.current,
              maxCombo: maxComboRef.current,
              livesRemaining: livesRef.current
            });
            return;
          }

          // If not fireball, break after first brick collision per frame
          if (!ball.isFireball) break;
        }
      }
    }

    // Check if all balls were lost
    if (ballsRef.current.length === 0 && !ballAttachedRef.current) {
      livesRef.current -= 1;
      onLivesUpdate(livesRef.current);
      comboRef.current = 0;
      onComboUpdate(0);

      if (livesRef.current <= 0) {
        sound.playGameOver();
        onGameOver(scoreRef.current);
      } else {
        sound.playLifeLost();
        triggerShake(0.2);
        resetBallOnPaddle();
      }
    }

    // Update Lasers
    for (let lIdx = lasersRef.current.length - 1; lIdx >= 0; lIdx--) {
      const laser = lasersRef.current[lIdx];
      laser.y += laser.dy * (60 * dt);

      if (laser.y < 0) {
        lasersRef.current.splice(lIdx, 1);
        continue;
      }

      // Check laser vs bricks
      for (let bIdx = bricksRef.current.length - 1; bIdx >= 0; bIdx--) {
        const brick = bricksRef.current[bIdx];
        if (
          laser.x >= brick.x &&
          laser.x <= brick.x + brick.width &&
          laser.y >= brick.y &&
          laser.y <= brick.y + brick.height
        ) {
          // Hit brick
          brick.hp -= 1;
          scoreRef.current += Math.round(brick.points * 0.8);
          onScoreUpdate(scoreRef.current);
          spawnParticles(laser.x, laser.y, '#f43f5e', 8);

          if (brick.hp <= 0) {
            spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 12);
            if (brick.type === 'EXPLOSIVE') {
              triggerBrickExplosion(brick);
            } else {
              maybeDropPowerUp(brick.x, brick.y, brick.type);
            }
            bricksRef.current.splice(bIdx, 1);
          }

          lasersRef.current.splice(lIdx, 1);
          break;
        }
      }
    }

    // Update PowerUps Falling
    for (let pIdx = powerUpsRef.current.length - 1; pIdx >= 0; pIdx--) {
      const p = powerUpsRef.current[pIdx];
      p.y += p.dy * (60 * dt);

      // Catch by paddle
      if (
        p.y + p.height >= paddle.y &&
        p.y <= paddle.y + paddle.height &&
        p.x + p.width >= paddle.x &&
        p.x <= paddle.x + paddle.width
      ) {
        applyPowerUp(p.type);
        powerUpsRef.current.splice(pIdx, 1);
        continue;
      }

      // Fall off screen
      if (p.y > CANVAS_HEIGHT) {
        powerUpsRef.current.splice(pIdx, 1);
      }
    }

    // Update Particles
    for (let ptIdx = particlesRef.current.length - 1; ptIdx >= 0; ptIdx--) {
      const pt = particlesRef.current[ptIdx];
      pt.x += pt.dx * (60 * dt);
      pt.y += pt.dy * (60 * dt);
      pt.alpha -= pt.decay * (60 * dt);

      if (pt.alpha <= 0) {
        particlesRef.current.splice(ptIdx, 1);
      }
    }

    // Update Floating Texts
    for (let ftIdx = floatingTextsRef.current.length - 1; ftIdx >= 0; ftIdx--) {
      const ft = floatingTextsRef.current[ftIdx];
      ft.y += ft.dy * (60 * dt);
      ft.alpha -= 0.02 * (60 * dt);

      if (ft.alpha <= 0) {
        floatingTextsRef.current.splice(ftIdx, 1);
      }
    }
  };

  // Render Scene onto Canvas
  const renderScene = (ctx: CanvasRenderingContext2D) => {
    ctx.save();

    // Screen Shake Offset
    if (shakeTimeRef.current > 0) {
      const shakeAmt = shakeTimeRef.current * 18;
      const offsetX = (Math.random() - 0.5) * shakeAmt;
      const offsetY = (Math.random() - 0.5) * shakeAmt;
      ctx.translate(offsetX, offsetY);
    }

    // Clear Canvas
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle Arcade Grid Pattern
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

    // Render Bottom Energy Shield
    if (hasShieldRef.current) {
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

    // Render Bricks
    bricksRef.current.forEach(brick => {
      ctx.save();
      ctx.fillStyle = brick.color;
      ctx.shadowColor = brick.color;
      ctx.shadowBlur = 8;

      // Rounded rectangle brick
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

      // Inner bevel / shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(brick.x + 2, brick.y + 2, brick.width - 4, 3);

      // Armored brick crack pattern
      if (brick.maxHp > 1 && brick.hp < brick.maxHp) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(brick.x + brick.width * 0.3, brick.y + 2);
        ctx.lineTo(brick.x + brick.width * 0.5, brick.y + brick.height * 0.6);
        ctx.lineTo(brick.x + brick.width * 0.75, brick.y + brick.height - 2);
        ctx.stroke();
      }

      // Mystery / Explosive / Prism badge icon
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

    // Render Lasers
    lasersRef.current.forEach(laser => {
      ctx.save();
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#fb7185';
      ctx.shadowBlur = 10;
      ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
      ctx.restore();
    });

    // Render PowerUps
    powerUpsRef.current.forEach(pu => {
      ctx.save();
      ctx.fillStyle = pu.color;
      ctx.shadowColor = pu.color;
      ctx.shadowBlur = 10;

      // Circle capsule
      ctx.beginPath();
      ctx.arc(pu.x + pu.width / 2, pu.y + pu.height / 2, pu.width / 2, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pu.label, pu.x + pu.width / 2, pu.y + pu.height / 2);
      ctx.restore();
    });

    // Render Paddle
    const paddle = paddleRef.current;
    ctx.save();
    // Paddle glow
    ctx.fillStyle = paddle.hasLaser ? '#f43f5e' : '#38bdf8';
    ctx.shadowColor = paddle.hasLaser ? '#fb7185' : '#38bdf8';
    ctx.shadowBlur = 14;

    const pr = 8;
    ctx.beginPath();
    ctx.moveTo(paddle.x + pr, paddle.y);
    ctx.lineTo(paddle.x + paddle.width - pr, paddle.y);
    ctx.quadraticCurveTo(paddle.x + paddle.width, paddle.y, paddle.x + paddle.width, paddle.y + pr);
    ctx.lineTo(paddle.x + paddle.width, paddle.y + paddle.height - pr);
    ctx.quadraticCurveTo(paddle.x + paddle.width, paddle.y + paddle.height, paddle.x + paddle.width - pr, paddle.y + paddle.height);
    ctx.lineTo(paddle.x + pr, paddle.y + paddle.height);
    ctx.quadraticCurveTo(paddle.x, paddle.y + paddle.height, paddle.x, paddle.y + paddle.height - pr);
    ctx.lineTo(paddle.x, paddle.y + pr);
    ctx.quadraticCurveTo(paddle.x, paddle.y, paddle.x + pr, paddle.y);
    ctx.closePath();
    ctx.fill();

    // Center jewel indicator
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(paddle.x + paddle.width / 2, paddle.y + paddle.height / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Laser cannons mounts
    if (paddle.hasLaser) {
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(paddle.x + 6, paddle.y - 6, 6, 6);
      ctx.fillRect(paddle.x + paddle.width - 12, paddle.y - 6, 6, 6);
    }
    ctx.restore();

    // Render Ball Trails & Balls
    ballsRef.current.forEach(ball => {
      // Trail
      ball.trail.forEach(t => {
        ctx.fillStyle = ball.isFireball 
          ? `rgba(249, 115, 22, ${t.alpha * 0.7})` 
          : `rgba(56, 189, 248, ${t.alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, ball.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ball body
      ctx.save();
      ctx.fillStyle = ball.isFireball ? '#f97316' : '#ffffff';
      ctx.shadowColor = ball.isFireball ? '#ea580c' : '#38bdf8';
      ctx.shadowBlur = ball.isFireball ? 18 : 12;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Render Particles
    particlesRef.current.forEach(pt => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.alpha);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Render Floating Text
    floatingTextsRef.current.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // Ball Launch Prompt if Attached
    if (ballAttachedRef.current && gameState === 'PLAYING') {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '600 15px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('스페이스바 또는 클릭하여 공 발사!', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 65);
      ctx.restore();
    }

    ctx.restore();
  };

  return (
    <div className="relative w-full max-w-[800px] aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800 bg-[#090d16] shadow-2xl flex items-center justify-center select-none">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full cursor-pointer touch-none block"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
      />
    </div>
  );
};
