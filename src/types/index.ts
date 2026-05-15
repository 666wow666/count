export interface UserInput {
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  mbti: string;
}

export interface TianganDizhi {
  tiangan: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  dizhi: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}

export interface Palace {
  name: string;
  mainStars: string[];
  assistantStars: string[];
  maleficStars: string[];
}

export interface DaYun {
  ageRange: string;
  mainStars: string[];
}

export interface StarChart {
  tianganDizhi: TianganDizhi;
  mingGong: number;
  shenGong: number;
  palaces: Palace[];
  daYun: DaYun[];
}

export interface FortuneAnalysis {
  content: string;
  timestamp: number;
  type: string;
}

export interface FortuneRecord {
  id: string;
  timestamp: number;
  userInput: UserInput;
  starChart: StarChart;
  analysisContent: string;
}

export const GONGWEI_NAMES = [
  '命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫',
  '迁移宫', '仆役宫', '官禄宫', '田宅宫', '福德宫', '父母宫'
] as const;

export const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
] as const;
