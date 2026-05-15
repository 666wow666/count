import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { callGLM } from '@/services/glmApi';
import { ArrowLeft, Sparkles, Loader2, AlertCircle, Star, Send, User, Bot, Save, Check } from 'lucide-react';
import { saveRecordToFile, generateRecordId } from '@/utils/storage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

function AnalysisDisplay({ content, isLoading }: { content: string; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
        <p className="text-purple-300 text-sm">AI运势解读生成中，请稍候...</p>
        <p className="text-purple-500/60 text-xs mt-2">紫微星曜正在为您推演命盘</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12 text-purple-400/60">
        <p>暂无运势解读</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-purple-950/40 rounded-2xl border border-purple-500/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">命盘解读</h3>
        </div>
        <div className="text-purple-100/90 leading-8 whitespace-pre-wrap text-base">
          {content}
        </div>
      </div>
    </div>
  );
}

export default function HistoryDetailPage() {
  const navigate = useNavigate();
  const { userInput, starChart, setLoading } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [analysisContent, setAnalysisContent] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveHint, setShowSaveHint] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!userInput || !starChart) {
      navigate('/history');
      return;
    }

    const savedAnalysis = sessionStorage.getItem('saved_analysis');
    if (savedAnalysis) {
      setAnalysisContent(savedAnalysis);
    }
  }, [userInput, starChart, navigate]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      const contextPrompt = `你是紫微斗数命理大师，用户正在询问关于其命盘解读的问题。以下是用户的命盘信息：

用户基本信息：
- 姓名：${userInput?.name}
- 性别：${userInput?.gender === 'male' ? '男' : '女'}
- MBTI人格类型：${userInput?.mbti}

四柱信息：
${starChart?.tianganDizhi ? `- 年柱：${starChart.tianganDizhi.tiangan.year}${starChart.tianganDizhi.dizhi.year}
- 月柱：${starChart.tianganDizhi.tiangan.month}${starChart.tianganDizhi.dizhi.month}
- 日柱：${starChart.tianganDizhi.tiangan.day}${starChart.tianganDizhi.dizhi.day}
- 时柱：${starChart.tianganDizhi.tiangan.hour}${starChart.tianganDizhi.dizhi.hour}` : ''}

命宫：第${starChart?.mingGong != null ? starChart.mingGong + 1 : ''}宫
身宫：第${starChart?.shenGong != null ? starChart.shenGong + 1 : ''}宫

十二宫星曜：
${starChart?.palaces?.map((p) => {
  const stars = [...p.mainStars, ...p.assistantStars, ...p.maleficStars];
  return stars.length > 0 ? `${p.name}：${stars.join('、')}` : null;
}).filter(Boolean).join('\n')}

之前的解读内容：
${analysisContent}

用户问题：${userMessage.content}

请用古雅专业的语言回答用户的问题，结合命盘信息进行详细解答。`;

      const assistantContent = await callGLM([{ role: 'user', content: contextPrompt }]);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent || '抱歉，暂无回复',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，服务暂时不可用，请稍后再试。',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSave = async () => {
    if (!userInput || !starChart || !analysisContent || isSaving) return;
    
    setIsSaving(true);
    setShowSaveHint(false);
    
    try {
      const record = {
        id: generateRecordId(),
        timestamp: Date.now(),
        userInput,
        starChart,
        analysisContent
      };
      
      await saveRecordToFile(record);
      setIsSaved(true);
      setShowSaveHint(true);
      
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (err) {
      console.error('[保存失败]', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!userInput || !starChart) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回历史</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={!analysisContent || isSaving}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              isSaved
                ? 'bg-green-600/30 text-green-400 border border-green-500/30'
                : 'bg-purple-950/50 text-purple-300 border border-purple-500/30 hover:bg-purple-900/50'
            } disabled:opacity-50`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-xs">已保存</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span className="text-xs">保存</span>
              </>
            )}
          </button>
        </div>

        {showSaveHint && (
          <div className="mb-4 p-3 bg-amber-950/30 rounded-xl border border-amber-500/30">
            <p className="text-amber-400 text-sm mb-1">文件已下载！</p>
            <p className="text-amber-300/70 text-xs">建议将文件保存到「紫微星盘」专属文件夹，方便后续导入查看</p>
          </div>
        )}

        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-amber-500 mb-2 shadow-lg shadow-purple-500/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">
            {userInput.name}的命盘解读
          </h1>
          <p className="text-purple-300/70 text-xs">
            紫微斗数 · {userInput.mbti}人格融合分析
          </p>
        </div>

        <div className="bg-purple-950/30 rounded-xl border border-purple-500/20 p-3 mb-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-purple-400/70">四柱：</span>
              <span className="text-amber-400">
                {starChart.tianganDizhi.tiangan.year}{starChart.tianganDizhi.dizhi.year}
                {starChart.tianganDizhi.tiangan.month}{starChart.tianganDizhi.dizhi.month}
                {starChart.tianganDizhi.tiangan.day}{starChart.tianganDizhi.dizhi.day}
                {starChart.tianganDizhi.tiangan.hour}{starChart.tianganDizhi.dizhi.hour}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400/70">命宫：</span>
              <span className="text-white">第{starChart.mingGong + 1}宫</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-2">
        <div className="max-w-md mx-auto space-y-4">
          {generationError && (
            <div className="p-3 bg-red-950/30 rounded-xl border border-red-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400/80 text-xs">{generationError}，已显示演示数据</p>
            </div>
          )}

          <AnalysisDisplay content={analysisContent} isLoading={isGenerating} />

          {messages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-400/60 text-xs">
                <div className="flex-1 h-px bg-purple-500/20"></div>
                <span>追问记录</span>
                <div className="flex-1 h-px bg-purple-500/20"></div>
              </div>

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-purple-600'
                      : 'bg-gradient-to-br from-amber-400 to-amber-600'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-sm'
                      : 'bg-purple-950/50 text-purple-100/90 rounded-tl-sm border border-purple-500/20'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-purple-950/50 rounded-2xl rounded-tl-sm px-4 py-3 border border-purple-500/20">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">大师正在思考...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-4 border-t border-purple-500/20 bg-[#0F0A1F]/80">
        <div className="max-w-md mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="对解读有疑问？向大师追问..."
                disabled={isSending || isGenerating}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending || isGenerating}
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-purple-400/40 text-xs mt-2">
            本分析仅供参考娱乐，命理玄学，信则灵
          </p>
        </div>
      </div>
    </div>
  );
}
