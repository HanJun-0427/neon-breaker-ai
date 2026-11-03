/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameMode, GameState, ActivePowerUp, GameSaveData } from './types/game';
import { CAMPAIGN_STAGES } from './utils/stages';
import { sound } from './utils/audio';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { 
  MainMenuModal, 
  StageSelectModal, 
  PauseModal, 
  StageClearModal, 
  GameOverModal, 
  HowToPlayModal 
} from './components/Modals';

const STORAGE_KEY = 'neon_breaker_dx_save_v1';

const defaultSaveData: GameSaveData = {
  highScore: 0,
  endlessHighScore: 0,
  timeAttackHighScore: 0,
  highestUnlockedStage: 1,
  stageStars: {},
  totalBricksDestroyed: 0,
  maxComboAchieved: 0,
  soundEnabled: true
};

export default function App() {
  // Game Configuration State
  const [mode, setMode] = useState<GameMode>('CAMPAIGN');
  const [currentStageId, setCurrentStageId] = useState<number>(1);
  const [gameState, setGameState] = useState<GameState>('MENU');

  // Real-time Gameplay State
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(120);

  // Modals & Overlays State
  const [showStageSelect, setShowStageSelect] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [stageClearStats, setStageClearStats] = useState<{
    score: number;
    maxCombo: number;
    livesRemaining: number;
  } | null>(null);
  const [gameOverScore, setGameOverScore] = useState<number | null>(null);
  const [isNewHighRecord, setIsNewHighRecord] = useState<boolean>(false);

  // Persistent Save Data
  const [saveData, setSaveData] = useState<GameSaveData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultSaveData, ...JSON.parse(saved) };
      }
    } catch {
      // fallback to default
    }
    return defaultSaveData;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(saveData.soundEnabled);

  // Synchronize audio setting
  useEffect(() => {
    sound.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Persist Save Data
  const updateSave = useCallback((updater: (prev: GameSaveData) => GameSaveData) => {
    setSaveData(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage quota error safeguard
      }
      return next;
    });
  }, []);

  // Time Attack Timer loop
  useEffect(() => {
    if (mode !== 'TIME_ATTACK' || gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time expired! Trigger Game Over with score
          handleGameOver(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, gameState, score]);

  // Start Game handler
  const handleStartGame = (selectedMode: GameMode, stageId: number = 1) => {
    setMode(selectedMode);
    setCurrentStageId(stageId);
    setScore(0);
    setLives(3);
    setCombo(0);
    setActivePowerUps([]);
    setTimeRemaining(120);
    setStageClearStats(null);
    setGameOverScore(null);
    setIsNewHighRecord(false);
    setShowStageSelect(false);
    setShowHowToPlay(false);
    setGameState('PLAYING');
  };

  // Restart current round
  const handleRestart = () => {
    setScore(0);
    setLives(3);
    setCombo(0);
    setActivePowerUps([]);
    setTimeRemaining(120);
    setStageClearStats(null);
    setGameOverScore(null);
    setIsNewHighRecord(false);
    setGameState('PLAYING');
  };

  // Stage Clear callback from GameCanvas
  const handleStageClear = (stats: { score: number; maxCombo: number; livesRemaining: number }) => {
    setGameState('STAGE_CLEAR');
    setStageClearStats(stats);

    // Calculate stars
    const stars = stats.livesRemaining >= 3 ? 3 : stats.livesRemaining >= 2 ? 2 : 1;

    updateSave(prev => {
      const newHigh = Math.max(prev.highScore, stats.score);
      const nextUnlocked = Math.max(prev.highestUnlockedStage, Math.min(currentStageId + 1, 12));
      const currentStar = prev.stageStars[currentStageId] || 0;
      return {
        ...prev,
        highScore: newHigh,
        highestUnlockedStage: nextUnlocked,
        stageStars: {
          ...prev.stageStars,
          [currentStageId]: Math.max(currentStar, stars)
        },
        maxComboAchieved: Math.max(prev.maxComboAchieved, stats.maxCombo)
      };
    });
  };

  // Game Over callback from GameCanvas
  const handleGameOver = (finalScore: number) => {
    setGameState('GAME_OVER');
    setGameOverScore(finalScore);

    let isNewRecord = false;
    updateSave(prev => {
      if (mode === 'CAMPAIGN' && finalScore > prev.highScore) {
        isNewRecord = true;
        return { ...prev, highScore: finalScore };
      } else if (mode === 'ENDLESS' && finalScore > prev.endlessHighScore) {
        isNewRecord = true;
        return { ...prev, endlessHighScore: finalScore };
      } else if (mode === 'TIME_ATTACK' && finalScore > prev.timeAttackHighScore) {
        isNewRecord = true;
        return { ...prev, timeAttackHighScore: finalScore };
      }
      return prev;
    });

    setIsNewHighRecord(isNewRecord);
  };

  // Advance to Next Stage
  const handleNextStage = () => {
    const nextId = currentStageId + 1;
    if (nextId <= CAMPAIGN_STAGES.length) {
      setCurrentStageId(nextId);
      setStageClearStats(null);
      setGameState('PLAYING');
    } else {
      setGameState('MENU');
    }
  };

  // Toggle Pause
  const handleTogglePause = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      updateSave(s => ({ ...s, soundEnabled: next }));
      return next;
    });
  };

  // Current stage metadata
  const currentStage = CAMPAIGN_STAGES.find(s => s.id === currentStageId) || CAMPAIGN_STAGES[0];

  const currentModeHighScore = 
    mode === 'CAMPAIGN' ? saveData.highScore :
    mode === 'ENDLESS' ? saveData.endlessHighScore :
    saveData.timeAttackHighScore;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center">
      {/* Top Bar Contract: Zone 1 (Brand) - Zone 2 (4-5 Nav links) - Zone 3 (1 Primary Action) */}
      <header className="w-full flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-20">
        {/* Zone 1: Single text element wordmark */}
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); setGameState('MENU'); }}
          className="text-lg font-black tracking-tight text-white whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors"
        >
          Neon Breaker <span className="text-cyan-400">DX</span>
        </a>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => handleStartGame('CAMPAIGN', saveData.highestUnlockedStage || 1)}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            캠페인
          </button>
          <button
            onClick={() => handleStartGame('ENDLESS', 1)}
            className="hover:text-purple-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            무한 모드
          </button>
          <button
            onClick={() => setShowStageSelect(true)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            스테이지 맵
          </button>
          <button
            onClick={() => setShowHowToPlay(true)}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            게임 규칙
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleStartGame('CAMPAIGN', 1)}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            새 게임 시작
          </button>
        </div>
      </header>

      {/* Main Game Stage Area */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-4 py-4 max-w-5xl">
        {/* HUD Meter Strip */}
        <HUD
          mode={mode}
          stageName={currentStage.name}
          score={score}
          highScore={currentModeHighScore}
          lives={lives}
          combo={combo}
          activePowerUps={activePowerUps}
          isPaused={gameState === 'PAUSED'}
          isMuted={!soundEnabled}
          timeRemaining={timeRemaining}
          onTogglePause={handleTogglePause}
          onToggleMute={handleToggleMute}
          onRestart={handleRestart}
        />

        {/* Game Canvas Container */}
        <div className="relative w-full max-w-[800px] flex items-center justify-center">
          <GameCanvas
            mode={mode}
            stageId={currentStageId}
            gameState={gameState}
            onScoreUpdate={setScore}
            onLivesUpdate={setLives}
            onComboUpdate={setCombo}
            onActivePowerUpsChange={setActivePowerUps}
            onStageClear={handleStageClear}
            onGameOver={handleGameOver}
            timeRemaining={timeRemaining}
          />

          {/* Modal Layers */}
          {gameState === 'MENU' && (
            <MainMenuModal
              onStartGame={handleStartGame}
              onOpenStageSelect={() => setShowStageSelect(true)}
              onOpenHowToPlay={() => setShowHowToPlay(true)}
              saveData={saveData}
            />
          )}

          {gameState === 'PAUSED' && (
            <PauseModal
              onResume={() => setGameState('PLAYING')}
              onRestart={handleRestart}
              onMainMenu={() => setGameState('MENU')}
            />
          )}

          {gameState === 'STAGE_CLEAR' && stageClearStats && (
            <StageClearModal
              stageId={currentStageId}
              score={stageClearStats.score}
              maxCombo={stageClearStats.maxCombo}
              livesRemaining={stageClearStats.livesRemaining}
              isLastStage={currentStageId >= CAMPAIGN_STAGES.length}
              onNextStage={handleNextStage}
              onRestart={handleRestart}
              onMainMenu={() => setGameState('MENU')}
            />
          )}

          {gameState === 'GAME_OVER' && gameOverScore !== null && (
            <GameOverModal
              score={gameOverScore}
              highScore={currentModeHighScore}
              isNewHigh={isNewHighRecord}
              onRestart={handleRestart}
              onMainMenu={() => setGameState('MENU')}
            />
          )}

          {showStageSelect && (
            <StageSelectModal
              highestUnlocked={saveData.highestUnlockedStage}
              stageStars={saveData.stageStars}
              onSelectStage={(id) => handleStartGame('CAMPAIGN', id)}
              onClose={() => setShowStageSelect(false)}
            />
          )}

          {showHowToPlay && (
            <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
          )}
        </div>

        {/* Quick Key Guide Below Canvas */}
        <div className="w-full max-w-[800px] mt-3 px-3 py-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-900">
          <div className="flex items-center gap-3">
            <span>조작: <span className="text-slate-400 font-medium">마우스 / 터치 / ← → / A D</span></span>
            <span aria-hidden="true">·</span>
            <span>발사 & 레이저: <span className="text-slate-400 font-medium">Space / 클릭</span></span>
            <span aria-hidden="true">·</span>
            <span>일시정지: <span className="text-slate-400 font-medium">P / ESC</span></span>
          </div>
          <div className="text-slate-400 font-medium">
            100% 로컬 오프라인 실행 · API 무연결
          </div>
        </div>
      </main>
    </div>
  );
}
