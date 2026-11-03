import React from 'react';
import { GameMode, ActivePowerUp } from '../types/game';
import { Heart, Volume2, VolumeX, Pause, Play, RotateCcw, Zap } from 'lucide-react';

interface HUDProps {
  mode: GameMode;
  stageName: string;
  score: number;
  highScore: number;
  lives: number;
  combo: number;
  activePowerUps: ActivePowerUp[];
  isPaused: boolean;
  isMuted: boolean;
  timeRemaining?: number;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onRestart: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  mode,
  stageName,
  score,
  highScore,
  lives,
  combo,
  activePowerUps,
  isPaused,
  isMuted,
  timeRemaining,
  onTogglePause,
  onToggleMute,
  onRestart
}) => {
  const comboMultiplier = Math.min(1 + Math.floor(combo / 2) * 0.5, 5);

  return (
    <div className="w-full max-w-[800px] mb-3 flex flex-col gap-2.5">
      {/* Top Primary Stats Strip */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-lg">
        {/* Left: Mode/Stage & Lives */}
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
              {mode === 'CAMPAIGN' ? stageName : mode === 'ENDLESS' ? 'ENDLESS SURVIVAL' : 'TIME ATTACK'}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <Heart
                  key={i}
                  size={16}
                  className={`transition-all duration-300 ${
                    i < lives
                      ? 'text-rose-500 fill-rose-500 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]'
                      : 'text-slate-700/60'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Time remaining if Time Attack */}
          {mode === 'TIME_ATTACK' && timeRemaining !== undefined && (
            <div className="pl-3 border-l border-slate-800">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">남은 시간</div>
              <div className={`font-mono-numbers text-sm font-bold ${timeRemaining <= 15 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </div>
            </div>
          )}
        </div>

        {/* Center: Score & Combo Multiplier */}
        <div className="flex flex-col items-center">
          <div className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">SCORE</div>
          <div className="font-mono-numbers text-2xl font-black text-cyan-400 tracking-tight drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            {score.toLocaleString()}
          </div>
          {combo > 1 && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 animate-bounce">
              <Zap size={12} className="fill-amber-400" />
              <span>{combo} COMBO (x{comboMultiplier})</span>
            </div>
          )}
        </div>

        {/* Right: High Score & Action Buttons */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">BEST</div>
            <div className="font-mono-numbers text-base font-bold text-slate-200">
              {Math.max(score, highScore).toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            <button
              onClick={onToggleMute}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isMuted ? '음소거 해제' : '음소거'}
            >
              {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
            <button
              onClick={onRestart}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="현재 판 재시작"
            >
              <RotateCcw size={17} />
            </button>
            <button
              onClick={onTogglePause}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isPaused ? '계속하기' : '일시정지'}
            >
              {isPaused ? <Play size={17} /> : <Pause size={17} />}
            </button>
          </div>
        </div>
      </div>

      {/* Active Power-ups Bar (shows only if items are active) */}
      {activePowerUps.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-slate-900/60 backdrop-blur-sm rounded-lg border border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium mr-1">활성 버프:</span>
          {activePowerUps.map(pu => (
            <div
              key={pu.type}
              className="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold border"
              style={{
                borderColor: `${pu.color}66`,
                backgroundColor: `${pu.color}15`,
                color: pu.color
              }}
            >
              <span>{pu.label}</span>
              <span className="font-mono-numbers text-[10px] opacity-80">
                {Math.ceil(pu.remaining)}s
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
