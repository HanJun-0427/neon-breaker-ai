import { BrickType, StageConfig } from '../types/game';

// Shorthands for cleaner layout mapping
const N: BrickType = 'NORMAL';
const A2: BrickType = 'ARMORED_2';
const A3: BrickType = 'ARMORED_3';
const EX: BrickType = 'EXPLOSIVE';
const PR: BrickType = 'PRISM';
const MY: BrickType = 'MYSTERY';
const GD: BrickType = 'GOLD';
const __ = null;

export const CAMPAIGN_STAGES: StageConfig[] = [
  {
    id: 1,
    name: "01. 퍼스트 콘택트",
    subtitle: "네온 아케이드의 시작",
    rows: 5,
    cols: 8,
    targetScore: 2500,
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
    targetScore: 3800,
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
    targetScore: 4500,
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
    targetScore: 5200,
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
    targetScore: 6000,
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
    targetScore: 6800,
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
    targetScore: 7500,
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
    targetScore: 8200,
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
    targetScore: 9000,
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
    targetScore: 9800,
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
    targetScore: 11000,
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
    targetScore: 13500,
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

// Endless Mode dynamic row generator
export function generateEndlessRow(wave: number, cols: number = 8): (BrickType | null)[] {
  const row: (BrickType | null)[] = [];
  const armorChance = Math.min(0.15 + wave * 0.04, 0.6);
  const explosiveChance = 0.12;
  const mysteryChance = 0.10;
  const prismChance = 0.08;
  const goldChance = 0.08;

  for (let c = 0; c < cols; c++) {
    // 15% empty space for paths
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

  // Ensure at least 3 bricks exist per generated row
  const activeCount = row.filter(r => r !== null).length;
  if (activeCount < 3) {
    row[0] = 'NORMAL';
    row[Math.floor(cols / 2)] = 'MYSTERY';
    row[cols - 1] = 'NORMAL';
  }

  return row;
}

export function getBrickDetails(type: BrickType): {
  hp: number;
  maxHp: number;
  color: string;
  glowColor: string;
  points: number;
} {
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
  }
}
