import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserInput, MBTI_TYPES } from '@/types';
import { calculateStarChart, getDaysInMonth } from '@/services/astrology';
import { useAppStore } from '@/store/useAppStore';
import { Sparkles, User, Calendar, Clock, Brain, ArrowRight, History, Settings, Sparkles as SparklesIcon } from 'lucide-react';

export default function InputPage() {
  const navigate = useNavigate();
  const { setUserInput, setStarChart, setLoading } = useAppStore();
  
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthYear, setBirthYear] = useState(1990);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);
  const [birthHour, setBirthHour] = useState(12);
  const [mbti, setMbti] = useState('INTP');
  
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 100 }, (_, i) => currentYear - i), [currentYear]);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = useMemo(() => {
    const daysInMonth = getDaysInMonth(birthYear, birthMonth);
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [birthYear, birthMonth]);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const handleSubmit = () => {
    if (!name.trim()) {
      return;
    }
    
    const userInput: UserInput = {
      name: name.trim(),
      gender,
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      mbti
    };
    
    try {
      const chart = calculateStarChart(userInput);
      setUserInput(userInput);
      setStarChart(chart);
      navigate('/result');
    } catch (err) {
    }
  };
  
  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };
  
  const getNextHourDisplay = (hour: number) => {
    const next = (hour + 1) % 24;
    return `${next.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1f] via-[#1a0f3a] to-[#0f0a1f] text-white py-6 px-4">
      <div className="max-w-md mx-auto w-full flex flex-col min-h-screen">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/config')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/40 border border-purple-500/20 text-purple-300 hover:bg-purple-900/50 hover:border-purple-500/40 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">配置</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 shadow-2xl shadow-purple-500/40 mb-4">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
            紫微星盘
          </h1>
          <p className="text-purple-300/70 mt-2 text-base">
            探索命运的星辰奥秘
          </p>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="group">
            <label className="flex items-center gap-2 text-purple-300 text-sm mb-3 font-medium">
              <User className="w-4 h-4" />
              <span>姓名</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入您的姓名"
              className="w-full px-4 py-4 rounded-2xl bg-purple-950/40 backdrop-blur-sm border border-purple-500/20 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-base"
            />
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-purple-300 text-sm mb-3 font-medium">
              <SparklesIcon className="w-4 h-4" />
              <span>性别</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-4 px-4 rounded-2xl border transition-all duration-300 ${
                  gender === 'male'
                    ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-purple-950/20 border-purple-500/20 text-purple-300 hover:border-purple-500/40 hover:bg-purple-900/30'
                }`}
              >
                男
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-4 px-4 rounded-2xl border transition-all duration-300 ${
                  gender === 'female'
                    ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-purple-950/20 border-purple-500/20 text-purple-300 hover:border-purple-500/40 hover:bg-purple-900/30'
                }`}
              >
                女
              </button>
            </div>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-purple-300 text-sm mb-3 font-medium">
              <Calendar className="w-4 h-4" />
              <span>出生日期</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <select
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                className="px-4 py-4 rounded-2xl bg-purple-950/40 backdrop-blur-sm border border-purple-500/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer text-base"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-[#1a0f3a]">{y}年</option>
                ))}
              </select>
              <select
                value={birthMonth}
                onChange={(e) => setBirthMonth(Number(e.target.value))}
                className="px-4 py-4 rounded-2xl bg-purple-950/40 backdrop-blur-sm border border-purple-500/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer text-base"
              >
                {months.map((m) => (
                  <option key={m} value={m} className="bg-[#1a0f3a]">{m}月</option>
                ))}
              </select>
              <select
                value={birthDay}
                onChange={(e) => setBirthDay(Number(e.target.value))}
                className="px-4 py-4 rounded-2xl bg-purple-950/40 backdrop-blur-sm border border-purple-500/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer text-base"
              >
                {days.map((d) => (
                  <option key={d} value={d} className="bg-[#1a0f3a]">{d}日</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-purple-300 text-sm mb-3 font-medium">
              <Clock className="w-4 h-4" />
              <span>出生时辰</span>
            </label>
            <select
              value={birthHour}
              onChange={(e) => setBirthHour(Number(e.target.value))}
              className="w-full px-4 py-4 rounded-2xl bg-purple-950/40 backdrop-blur-sm border border-purple-500/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer text-base"
            >
              {hours.map((h) => (
                <option key={h} value={h} className="bg-[#1a0f3a]">
                  {formatHour(h)} - {getNextHourDisplay(h)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-purple-300 text-sm mb-3 font-medium">
              <Brain className="w-4 h-4" />
              <span>MBTI人格类型</span>
            </label>
            <select
              value={mbti}
              onChange={(e) => setMbti(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl bg-purple-950/40 backdrop-blur-sm border border-purple-500/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer text-base"
            >
              {MBTI_TYPES.map((type) => (
                <option key={type} value={type} className="bg-[#1a0f3a]">{type}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 text-white font-semibold shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98] duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-base">开始测算</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="w-full py-4 px-6 rounded-2xl border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2 hover:border-purple-500/50 duration-300"
          >
            <History className="w-5 h-5" />
            <span className="text-sm">查看历史记录</span>
          </button>
        </div>
        
        <p className="text-center text-purple-400/40 text-xs mt-8">
          您的信息仅用于本次命理测算，不会被保存或分享
        </p>
      </div>
    </div>
  );
}
