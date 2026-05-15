import { StarChart, UserInput, Palace, GONGWEI_NAMES } from '@/types';

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const ZHENGYAO = [
  '紫微', '天机', '太阳', '武曲', '天同', '廉贞',
  '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'
];

const SIX_HARMONIOUS = ['文昌', '文曲', '左辅', '右弼', '天魁', '天钺'];
const SIX_MALEFIC = ['擎羊', '陀罗', '火星', '铃星', '天空', '地劫'];

function getDaysSinceBaseDate(year: number, month: number, day: number): number {
  const baseDate = new Date(1900, 0, 30);
  const targetDate = new Date(year, month - 1, day);
  return Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
}

function getYearGanZhi(year: number): { gan: string; zhi: string } {
  const baseYearGan = 0;
  const baseYearZhi = 4;
  const yearOffset = year - 1900;

  let ganIndex = (baseYearGan + yearOffset) % 10;
  if (ganIndex < 0) ganIndex += 10;

  let zhiIndex = (baseYearZhi + yearOffset) % 12;
  if (zhiIndex < 0) zhiIndex += 12;

  return {
    gan: TIANGAN[ganIndex],
    zhi: DIZHI[zhiIndex]
  };
}

function getMonthGan(yearGan: string, month: number): string {
  const ganMapping: { [key: string]: number } = {
    '甲': 0, '乙': 2, '丙': 4, '丁': 6, '戊': 8,
    '己': 0, '庚': 2, '辛': 4, '壬': 6, '癸': 8
  };
  const baseGan = ganMapping[yearGan] ?? 0;
  return TIANGAN[(baseGan + month) % 10];
}

function getDayGanZhi(daysSinceBase: number): { gan: string; zhi: string } {
  const ganBase = 0;
  const zhiBase = 5;

  let ganIndex = (ganBase + daysSinceBase) % 10;
  if (ganIndex < 0) ganIndex += 10;

  let zhiIndex = (zhiBase + daysSinceBase) % 12;
  if (zhiIndex < 0) zhiIndex += 12;

  return {
    gan: TIANGAN[ganIndex],
    zhi: DIZHI[zhiIndex]
  };
}

function getHourGan(dayGan: string, hour: number): string {
  const zhiIndex = Math.floor(hour / 2) % 12;

  const ganMapping: { [key: string]: number } = {
    '甲': 0, '乙': 2, '丙': 4, '丁': 6, '戊': 8,
    '己': 0, '庚': 2, '辛': 4, '壬': 6, '癸': 8
  };
  const baseGan = ganMapping[dayGan] ?? 0;

  return TIANGAN[(baseGan + zhiIndex) % 10];
}

function getHourZhi(hour: number): string {
  const zhiIndex = Math.floor(hour / 2) % 12;
  return DIZHI[zhiIndex];
}

function getMingGong(yearZhi: string, month: number, dayGan: string, hourZhi: string): number {
  const yearZhiIndex = DIZHI.indexOf(yearZhi);
  const hourZhiIndex = DIZHI.indexOf(hourZhi);
  const monthZhiIndex = (yearZhiIndex + month - 1) % 12;

  const mingGongZhi = (2 * monthZhiIndex - hourZhiIndex + 12) % 12;
  return mingGongZhi;
}

function calculateStarPositions(yearZhi: string, month: number, dayGan: string, hourZhi: string): string[] {
  const positions: string[] = Array(12).fill('');
  const yearZhiIndex = DIZHI.indexOf(yearZhi);

  positions[0] = '紫微';

  const xuanwuTable: { [key: string]: number } = {
    '子': 8, '丑': 8, '寅': 2, '卯': 2, '辰': 2, '巳': 4,
    '午': 4, '未': 4, '申': 6, '酉': 6, '戌': 6, '亥': 0
  };
  const xuanwuIndex = xuanwuTable[yearZhi] ?? 0;
  positions[xuanwuIndex] = '玄武';

  const shouyinTable: { [key: string]: number } = {
    '子': 6, '丑': 5, '寅': 8, '卯': 9, '辰': 10, '巳': 11,
    '午': 0, '未': 1, '申': 2, '酉': 3, '戌': 4, '亥': 5
  };
  const shouyinIndex = shouyinTable[yearZhi] ?? 0;
  positions[shouyinIndex] = '守命';

  const tiangangTable: { [key: string]: number } = {
    '子': 10, '丑': 9, '寅': 8, '卯': 7, '辰': 6, '巳': 5,
    '午': 4, '未': 3, '申': 2, '酉': 1, '戌': 0, '亥': 11
  };
  const tiangangIndex = tiangangTable[yearZhi] ?? 0;
  positions[tiangangIndex] = '天纲';

  const monthZhiIndex = (yearZhiIndex + month - 1) % 12;

  positions[(monthZhiIndex + 5) % 12] = '天机';
  positions[(monthZhiIndex + 7) % 12] = '太阳';
  positions[(monthZhiIndex + 1) % 12] = '武曲';
  positions[(monthZhiIndex + 3) % 12] = '天同';
  positions[(monthZhiIndex + 9) % 12] = '廉贞';

  positions[(monthZhiIndex + 4) % 12] = '天府';
  positions[(monthZhiIndex + 6) % 12] = '太阴';
  positions[(monthZhiIndex + 2) % 12] = '贪狼';
  positions[(monthZhiIndex + 8) % 12] = '巨门';
  positions[(monthZhiIndex + 10) % 12] = '天相';
  positions[(monthZhiIndex + 11) % 12] = '天梁';
  positions[(monthZhiIndex + 0) % 12] = '七杀';
  positions[(monthZhiIndex + 1) % 12] = '破军';

  return positions;
}

function buildPalaces(starPositions: string[]): Palace[] {
  return GONGWEI_NAMES.map((name, index) => {
    const stars: string[] = [];

    if (starPositions[index]) {
      stars.push(starPositions[index]);
    }

    if (index === 0 && stars.length === 0) {
      stars.push('紫微');
    }

    return {
      name,
      mainStars: stars.filter(s => ZHENGYAO.includes(s)),
      assistantStars: stars.filter(s => SIX_HARMONIOUS.includes(s)),
      maleficStars: stars.filter(s => SIX_MALEFIC.includes(s))
    };
  });
}

function generateDaYun(year: number): Array<{ ageRange: string; mainStars: string[] }> {
  const cycles = [];
  for (let i = 0; i < 5; i++) {
    cycles.push({
      ageRange: `${10 + i * 10}-${19 + i * 10}岁`,
      mainStars: [ZHENGYAO[i * 3 % 14], ZHENGYAO[(i * 3 + 1) % 14]]
    });
  }
  return cycles;
}

export function calculateStarChart(userInput: UserInput): StarChart {
  const daysSinceBase = getDaysSinceBaseDate(
    userInput.birthYear,
    userInput.birthMonth,
    userInput.birthDay
  );

  const yearGanZhi = getYearGanZhi(userInput.birthYear);
  const monthGan = getMonthGan(yearGanZhi.gan, userInput.birthMonth);
  const dayGanZhi = getDayGanZhi(daysSinceBase);
  const hourZhi = getHourZhi(userInput.birthHour);
  const hourGan = getHourGan(dayGanZhi.gan, userInput.birthHour);

  const mingGongIndex = getMingGong(
    yearGanZhi.zhi,
    userInput.birthMonth,
    dayGanZhi.gan,
    hourZhi
  );

  const hourZhiIndex = DIZHI.indexOf(hourZhi);
  const shenGongIndex = (hourZhiIndex + userInput.birthMonth - 1) % 12;

  const starPositions = calculateStarPositions(
    yearGanZhi.zhi,
    userInput.birthMonth,
    dayGanZhi.gan,
    hourZhi
  );

  const palaces = buildPalaces(starPositions);

  return {
    tianganDizhi: {
      tiangan: {
        year: yearGanZhi.gan,
        month: monthGan,
        day: dayGanZhi.gan,
        hour: hourGan
      },
      dizhi: {
        year: yearGanZhi.zhi,
        month: DIZHI[(DIZHI.indexOf(yearGanZhi.zhi) + userInput.birthMonth - 1) % 12],
        day: dayGanZhi.zhi,
        hour: hourZhi
      }
    },
    mingGong: mingGongIndex,
    shenGong: shenGongIndex,
    palaces,
    daYun: generateDaYun(userInput.birthYear)
  };
}

export function getZodiacAnimal(year: number): string {
  const animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const offset = (year - 1900) % 12;
  return animals[offset >= 0 ? offset : offset + 12];
}

export function getHourName(hour: number): string {
  const hourNames = [
    '子时', '丑时', '寅时', '卯时', '辰时', '巳时',
    '午时', '未时', '申时', '酉时', '戌时', '亥时'
  ];
  return hourNames[Math.floor(hour / 2) % 12];
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function isValidDate(year: number, month: number, day: number): boolean {
  const daysInMonth = getDaysInMonth(year, month);
  return day >= 1 && day <= daysInMonth;
}
