import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { getZodiacAnimal, getHourName } from '@/services/astrology';
import StarChart from '@/components/chart/StarChart';
import { ArrowLeft, Sparkles, User, Calendar, Clock, Brain, ChevronRight, Star as StarIcon } from 'lucide-react';

export default function ResultPage() {
  const navigate = useNavigate();
  const { userInput, starChart, setLoading } = useAppStore();
  
  if (!userInput || !starChart) {
    navigate('/');
    return null;
  }
  
  const zodiac = getZodiacAnimal(userInput.birthYear);
  const hourName = getHourName(userInput.birthHour);
  
  const handleViewAnalysis = () => {
    setLoading(true);
    navigate('/analysis');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1f] via-[#1a0f3a] to-[#0f0a1f] text-white py-6 px-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">重新输入</span>
        </button>
        
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/30">
              <StarIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
            {userInput.name}的星盘
          </h1>
          <p className="text-purple-300/70 text-sm mt-2">
            命宫：{starChart.palaces[starChart.mingGong]?.name || '命宫'}
          </p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="bg-purple-950/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-5 shadow-lg">
            <h2 className="text-purple-300 text-sm font-medium mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              基本信息
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-purple-900/30 rounded-xl p-3">
                <span className="text-purple-400/70 text-xs block mb-1">姓名</span>
                <span className="text-white font-medium">{userInput.name}</span>
              </div>
              <div className="bg-purple-900/30 rounded-xl p-3">
                <span className="text-purple-400/70 text-xs block mb-1">性别</span>
                <span className="text-white font-medium">{userInput.gender === 'male' ? '男' : '女'}</span>
              </div>
              <div className="bg-purple-900/30 rounded-xl p-3">
                <span className="text-purple-400/70 text-xs block mb-1">MBTI</span>
                <span className="text-white font-medium">{userInput.mbti}</span>
              </div>
              <div className="bg-purple-900/30 rounded-xl p-3">
                <span className="text-purple-400/70 text-xs block mb-1">属相</span>
                <span className="text-white font-medium">{zodiac}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-950/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-5 shadow-lg">
            <h2 className="text-purple-300 text-sm font-medium mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              出生信息
            </h2>
            <div className="space-y-3 text-sm">
              <div className="bg-purple-900/30 rounded-xl p-3">
                <span className="text-purple-400/70 text-xs block mb-1">公历</span>
                <span className="text-white font-medium">
                  {userInput.birthYear}年{userInput.birthMonth}月{userInput.birthDay}日
                </span>
              </div>
              <div className="bg-purple-900/30 rounded-xl p-3">
                <span className="text-purple-400/70 text-xs block mb-1">时辰</span>
                <span className="text-white font-medium">{hourName}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-950/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-5 shadow-lg">
            <h2 className="text-purple-300 text-sm font-medium mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              四柱八字
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-amber-600/20 to-amber-500/10 rounded-xl p-4 text-center border border-amber-500/20">
                <div className="text-purple-400/70 text-xs mb-2">年柱</div>
                <div className="text-amber-400 font-bold text-xl">
                  {starChart.tianganDizhi.tiangan.year}{starChart.tianganDizhi.dizhi.year}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-500/10 rounded-xl p-4 text-center border border-purple-500/20">
                <div className="text-purple-400/70 text-xs mb-2">月柱</div>
                <div className="text-purple-300 font-bold text-xl">
                  {starChart.tianganDizhi.tiangan.month}{starChart.tianganDizhi.dizhi.month}
                </div>
              </div>
              <div className="bg-gradient-to-br from-pink-600/20 to-pink-500/10 rounded-xl p-4 text-center border border-pink-500/20">
                <div className="text-purple-400/70 text-xs mb-2">日柱</div>
                <div className="text-pink-300 font-bold text-xl">
                  {starChart.tianganDizhi.tiangan.day}{starChart.tianganDizhi.dizhi.day}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/10 rounded-xl p-4 text-center border border-blue-500/20">
                <div className="text-purple-400/70 text-xs mb-2">时柱</div>
                <div className="text-blue-300 font-bold text-xl">
                  {starChart.tianganDizhi.tiangan.hour}{starChart.tianganDizhi.dizhi.hour}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-950/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-5 shadow-lg">
            <h2 className="text-purple-300 text-sm font-medium mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              整体星盘
            </h2>
            <StarChart
              palaces={starChart.palaces}
              mingGongIndex={starChart.mingGong}
              shenGongIndex={starChart.shenGong}
            />
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <span className="text-xs text-purple-300/70 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                ★ 命宫
              </span>
              <span className="text-xs text-purple-300/70 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                ◆ 身宫
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleViewAnalysis}
          className="w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 text-white font-semibold shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98] duration-300"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-base">查看详细运势解读</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
        
        <div className="mt-8 text-center">
          <div className="bg-purple-950/20 rounded-xl p-4 border border-purple-500/10">
            <p className="text-purple-400/40 text-xs">
              星盘已生成，点击上方按钮获取AI运势解读
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
