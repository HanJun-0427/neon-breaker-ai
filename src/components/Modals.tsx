import React from 'react';
import { GameMode, GameSaveData } from '../types/game';
import { CAMPAIGN_STAGES } from '../utils/stages';
import { 
  Play, 
  RotateCcw, 
  ChevronRight, 
  Star, 
  Trophy, 
  HelpCircle, 
  Flame, 
  Shield, 
  Zap, 
  Crosshair, 
  Clock, 
  Infinity as InfinityIcon,
  X
} from 'lucide-react';

interface MainMenuModalProps {
  onStartGame: (mode: GameMode, stageId: number) => void;
  onOpenStageSelect: () => void;
  onOpenHowToPlay: () => void;
  saveData: GameSaveData;
}

export const MainMenuModal: React.FC<MainMenuModalProps> = ({
  onStartGame,
  onOpenStageSelect,
  onOpenHowToPlay,
  saveData
}) => {
  return (
    <div className="absolute inset-0 bg-[#090d16]/95 backdrop-blur-md z-30 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Title */}
        <div className="mb-2">
          <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-1">
            RETRO ARCADE 2026
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">
            NEON BREAKER <span className="text-cyan-400">DX</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            API 연결 없이 즐기는 100% 로컬 네온 블록 격파
          </p>
        </div>

        {/* High Scores Summary */}
        <div className="w-full grid grid-cols-3 gap-2 my-5 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase">캠페인 최고</div>
            <div className="font-mono-numbers text-sm font-bold text-amber-400">
              {saveData.highScore.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase">무한 서바이벌</div>
            <div className="font-mono-numbers text-sm font-bold text-purple-400">
              {saveData.endlessHighScore.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase">타임 어택</div>
            <div className="font-mono-numbers text-sm font-bold text-emerald-400">
              {saveData.timeAttackHighScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Game Mode Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => onStartGame('CAMPAIGN', saveData.highestUnlockedStage || 1)}
            className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center justify-between transition-all duration-200 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Play size={20} className="fill-slate-950" />
              <div className="text-left">
                <div className="text-sm leading-tight">캠페인 모드 계속하기</div>
                <div className="text-[11px] font-normal opacity-85">스테이지 {saveData.highestUnlockedStage || 1} 도전</div>
              </div>
            </div>
            <ChevronRight size={18} />
          </button>

          <button
            onClick={() => onStartGame('ENDLESS', 1)}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700/80 text-white font-semibold rounded-xl flex items-center justify-between transition-colors border border-slate-700 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <InfinityIcon size={18} className="text-purple-400" />
              <div className="text-left">
                <div className="text-sm">무한 서바이벌 모드</div>
                <div className="text-[11px] text-slate-400">계속 내려오는 블록에서 생존</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>

          <button
            onClick={() => onStartGame('TIME_ATTACK', 1)}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700/80 text-white font-semibold rounded-xl flex items-center justify-between transition-colors border border-slate-700 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-emerald-400" />
              <div className="text-left">
                <div className="text-sm">2분 타임 어택</div>
                <div className="text-[11px] text-slate-400">제한 시간 내 최고 득점 겨루기</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Secondary Buttons */}
        <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800">
          <button
            onClick={onOpenStageSelect}
            className="py-2 px-3 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trophy size={14} className="text-amber-400" />
            <span>스테이지 선택</span>
          </button>
          <button
            onClick={onOpenHowToPlay}
            className="py-2 px-3 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <HelpCircle size={14} className="text-cyan-400" />
            <span>게임 방법 & 팁</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface StageSelectModalProps {
  highestUnlocked: number;
  stageStars: Record<number, number>;
  onSelectStage: (id: number) => void;
  onClose: () => void;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  highestUnlocked,
  stageStars,
  onSelectStage,
  onClose
}) => {
  return (
    <div className="absolute inset-0 bg-[#090d16]/95 backdrop-blur-md z-30 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">스테이지 선택</h2>
            <p className="text-xs text-slate-400">총 12개의 도전적인 캠페인 스테이지</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Grid of stages */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-4 overflow-y-auto pr-1">
          {CAMPAIGN_STAGES.map(stage => {
            const isUnlocked = stage.id <= highestUnlocked;
            const stars = stageStars[stage.id] || 0;

            return (
              <button
                key={stage.id}
                disabled={!isUnlocked}
                onClick={() => onSelectStage(stage.id)}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                  isUnlocked
                    ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-cyan-500 cursor-pointer shadow-md'
                    : 'bg-slate-950/40 border-slate-800/50 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="text-xs font-bold text-cyan-400">STAGE {stage.id}</div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate w-full">
                  {stage.name.replace(/^\d+\.\s*/, '')}
                </div>
                {/* Stars */}
                <div className="flex items-center gap-0.5 mt-2">
                  {[1, 2, 3].map(st => (
                    <Star
                      key={st}
                      size={12}
                      className={
                        st <= stars
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700'
                      }
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onMainMenu
}) => {
  return (
    <div className="absolute inset-0 bg-[#090d16]/85 backdrop-blur-sm z-30 flex items-center justify-center p-6">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-2xl font-black text-white mb-1">일시 정지</h2>
        <p className="text-xs text-slate-400 mb-6">게임이 잠시 중단되었습니다</p>

        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer"
          >
            계속하기 (Resume)
          </button>
          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors border border-slate-700 cursor-pointer"
          >
            현재 판 재시작
          </button>
          <button
            onClick={onMainMenu}
            className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-850 text-slate-300 font-medium rounded-xl transition-colors border border-slate-800 cursor-pointer"
          >
            메인 메뉴로
          </button>
        </div>
      </div>
    </div>
  );
};

interface StageClearModalProps {
  stageId: number;
  score: number;
  maxCombo: number;
  livesRemaining: number;
  isLastStage: boolean;
  onNextStage: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const StageClearModal: React.FC<StageClearModalProps> = ({
  stageId,
  score,
  maxCombo,
  livesRemaining,
  isLastStage,
  onNextStage,
  onRestart,
  onMainMenu
}) => {
  // Stars calculation based on performance
  const stars = livesRemaining >= 3 ? 3 : livesRemaining >= 2 ? 2 : 1;

  return (
    <div className="absolute inset-0 bg-[#090d16]/90 backdrop-blur-md z-30 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        <div className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">
          STAGE {stageId} COMPLETED
        </div>
        <h2 className="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
          스테이지 클리어!
        </h2>

        {/* Star Rating Animation */}
        <div className="flex items-center gap-2 my-5">
          {[1, 2, 3].map(st => (
            <Star
              key={st}
              size={34}
              className={`transition-all duration-500 ${
                st <= stars
                  ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] scale-110'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Score & Combo Stats */}
        <div className="w-full bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 mb-5 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>획득 점수</span>
            <span className="font-mono-numbers text-sm font-bold text-cyan-400">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>최고 콤보</span>
            <span className="font-mono-numbers text-sm font-bold text-amber-400">{maxCombo} COMBO</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>남은 라이프</span>
            <span className="font-mono-numbers text-sm font-bold text-rose-400">{livesRemaining} / 5</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2">
          {!isLastStage ? (
            <button
              onClick={onNextStage}
              className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              다음 스테이지 ({stageId + 1})
            </button>
          ) : (
            <div className="py-2 text-sm font-bold text-emerald-400">
              축하합니다! 모든 캠페인 스테이지를 제패하셨습니다!
            </div>
          )}
          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors border border-slate-700 cursor-pointer"
          >
            이 스테이지 다시하기
          </button>
          <button
            onClick={onMainMenu}
            className="w-full py-2 px-4 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            메인 메뉴로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHigh: boolean;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHigh,
  onRestart,
  onMainMenu
}) => {
  return (
    <div className="absolute inset-0 bg-[#090d16]/90 backdrop-blur-md z-30 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-3xl font-black text-rose-500 mb-1 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">
          GAME OVER
        </h2>
        <p className="text-xs text-slate-400 mb-5">모든 공을 소진하였습니다</p>

        {isNewHigh && (
          <div className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold mb-4 animate-pulse">
            ★ 새로운 최고 기록 달성! ★
          </div>
        )}

        <div className="w-full bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 mb-5 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>최종 점수</span>
            <span className="font-mono-numbers text-lg font-black text-cyan-400">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>이전 최고 점수</span>
            <span className="font-mono-numbers text-sm font-semibold text-slate-300">{highScore.toLocaleString()}</span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onRestart}
            className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={18} />
            <span>다시 도전하기 (Retry)</span>
          </button>
          <button
            onClick={onMainMenu}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium rounded-xl transition-colors border border-slate-700 cursor-pointer"
          >
            메인 메뉴로
          </button>
        </div>
      </div>
    </div>
  );
};

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-[#090d16]/95 backdrop-blur-md z-30 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">게임 방법 & 규칙</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 py-4 overflow-y-auto text-xs text-slate-300 pr-1">
          {/* Controls */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <h3 className="font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
              <Crosshair size={15} /> 조작법
            </h3>
            <ul className="space-y-1 text-slate-400">
              <li>• <strong className="text-slate-200">패들 이동:</strong> 마우스 커서 이동 / 화면 터치 드래그 / 좌우 방향키 (또는 A, D)</li>
              <li>• <strong className="text-slate-200">공 발사 / 레이저 사격:</strong> 마우스 클릭 / 스페이스바</li>
              <li>• <strong className="text-slate-200">일시 정지:</strong> P 키 또는 상단 일시정지 아이콘</li>
              <li>• <strong className="text-slate-200">각도 제어:</strong> 패들 가장자리에 맞출수록 공이 더 날카로운 각도로 튕겨 나갑니다!</li>
            </ul>
          </div>

          {/* Bricks */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <h3 className="font-bold text-amber-400 mb-2 flex items-center gap-1.5">
              <Flame size={15} /> 특수 블록 안내
            </h3>
            <div className="grid grid-cols-2 gap-2 text-slate-400">
              <div><strong className="text-cyan-400">일반 블록:</strong> 1회 타격 파괴 (100점)</div>
              <div><strong className="text-blue-400">장갑 블록:</strong> 2~3회 타격 파괴</div>
              <div><strong className="text-rose-400">💣 폭발 블록:</strong> 주변 3x3 범위 연쇄 폭발</div>
              <div><strong className="text-pink-400">✦ 프리즘 블록:</strong> 공 충돌 시 공 1개 추가 복제</div>
              <div><strong className="text-amber-400">? 미스터리:</strong> 100% 확률로 파워업 드롭</div>
              <div><strong className="text-yellow-400">★ 골드 블록:</strong> 500 보너스 점수</div>
            </div>
          </div>

          {/* PowerUps */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <h3 className="font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
              <Zap size={15} /> 파워업 아이템
            </h3>
            <div className="grid grid-cols-2 gap-2 text-slate-400">
              <div><span className="text-emerald-400 font-bold">[M] 멀티볼:</span> 공 2개 복제 분출</div>
              <div><span className="text-rose-400 font-bold">[L] 레이저:</span> 패들에서 레이저 포 발사</div>
              <div><span className="text-sky-400 font-bold">[W] 와이드:</span> 패들 길이 1.5배 확장</div>
              <div><span className="text-orange-400 font-bold">[F] 파이어볼:</span> 블록을 관통하는 불꽃 공</div>
              <div><span className="text-purple-400 font-bold">[S] 쉴드:</span> 바닥에 1회 방어 세이프티 넷 생성</div>
              <div><span className="text-pink-400 font-bold">[+] 라이프:</span> 하트 +1 회복</div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer"
        >
          확인하고 돌아가기
        </button>
      </div>
    </div>
  );
};
