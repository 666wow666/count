import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Key, Globe, Save, CheckCircle, AlertCircle, Bot, ChevronDown, ChevronUp } from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  defaultEndpoint: string;
}

const AI_MODELS: AIModel[] = [
  {
    id: 'glm-4-flash',
    name: 'GLM-4-Flash',
    provider: '智谱AI',
    description: '高性价比快速响应',
    defaultEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  },
  {
    id: 'glm-4',
    name: 'GLM-4',
    provider: '智谱AI',
    description: '更强推理能力',
    defaultEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  },
  {
    id: 'qwen-turbo',
    name: '通义千问-Turbo',
    provider: '阿里云',
    description: '快速响应适合日常对话',
    defaultEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
  },
  {
    id: 'qwen-plus',
    name: '通义千问-Plus',
    provider: '阿里云',
    description: '更强推理能力',
    defaultEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek-V3',
    provider: 'DeepSeek',
    description: '高性价比开源模型',
    defaultEndpoint: 'https://api.deepseek.com/v1/chat/completions'
  },
  {
    id: 'custom',
    name: '自定义模型',
    provider: '自定义',
    description: '手动配置API地址',
    defaultEndpoint: ''
  }
];

export default function ApiConfigPage() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [selectedModel, setSelectedModel] = useState('glm-4-flash');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('VITE_GLM_API_KEY');
    const savedUrl = localStorage.getItem('VITE_GLM_API_URL');
    const savedModel = localStorage.getItem('VITE_AI_MODEL');
    
    if (savedKey) setApiKey(savedKey);
    if (savedUrl) setApiUrl(savedUrl);
    if (savedModel) setSelectedModel(savedModel);
  }, []);

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    const model = AI_MODELS.find(m => m.id === modelId);
    if (model && model.id !== 'custom') {
      setApiUrl(model.defaultEndpoint);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('VITE_GLM_API_KEY', apiKey);
      localStorage.setItem('VITE_GLM_API_URL', apiUrl);
      localStorage.setItem('VITE_AI_MODEL', selectedModel);
      
      if (selectedModel === 'custom') {
        localStorage.setItem('VITE_CUSTOM_ENDPOINT', customEndpoint);
      }
      
      setIsSaved(true);
      setShowSuccess(true);
      setIsSaving(false);
      
      setTimeout(() => {
        setIsSaved(false);
        setShowSuccess(false);
      }, 2000);
    }, 500);
  };

  const selectedModelInfo = AI_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1f] via-[#1a0f3a] to-[#0f0a1f] text-white py-6 px-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回首页</span>
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 mb-4 shadow-xl shadow-purple-500/30">
            <Settings className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
            API 配置
          </h1>
          <p className="text-purple-300/70 text-sm mt-2">
            配置AI模型以获取真实运势解读
          </p>
        </div>

        <div className="space-y-5">
          <div className="bg-purple-950/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">选择AI模型</h3>
                <p className="text-purple-400/70 text-xs">选择或自定义模型</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelChange(model.id)}
                  className={`w-full p-4 rounded-xl border transition-all text-left ${
                    selectedModel === model.id
                      ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-purple-500 shadow-lg shadow-purple-500/20'
                      : 'bg-purple-900/20 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-900/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        {model.name}
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-600/30 text-purple-300">
                          {model.provider}
                        </span>
                      </div>
                      <div className="text-purple-400/70 text-xs mt-1">
                        {model.description}
                      </div>
                    </div>
                    {selectedModel === model.id && (
                      <CheckCircle className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-purple-950/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">API 密钥</h3>
                <p className="text-purple-400/70 text-xs">{selectedModelInfo?.provider || 'AI'} API Key</p>
              </div>
            </div>
            
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入您的API密钥"
              className="w-full px-4 py-3 rounded-xl bg-purple-900/30 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
            />
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full bg-purple-950/30 rounded-xl border border-purple-500/20 p-4 flex items-center justify-between text-purple-300 hover:border-purple-500/40 transition-all"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm">高级设置</span>
            </div>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showAdvanced && (
            <div className="bg-purple-950/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-5 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">API 地址</h3>
                  <p className="text-purple-400/70 text-xs">API Endpoint URL</p>
                </div>
              </div>
              
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder={selectedModelInfo?.defaultEndpoint || '请输入API地址'}
                disabled={selectedModel !== 'custom'}
                className="w-full px-4 py-3 rounded-xl bg-purple-900/30 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm disabled:opacity-50"
              />
              
              {selectedModel === 'custom' && (
                <div className="mt-3">
                  <label className="text-purple-400/70 text-xs block mb-2">自定义模型名称</label>
                  <input
                    type="text"
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    placeholder="例如: gpt-4 / claude-3"
                    className="w-full px-4 py-3 rounded-xl bg-purple-900/30 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                  />
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full py-4 px-6 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 ${
              isSaved
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-green-500/30'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98]'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>保存中...</span>
              </>
            ) : isSaved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>已保存</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>保存配置</span>
              </>
            )}
          </button>

          {showSuccess && (
            <div className="bg-green-950/40 rounded-xl border border-green-500/30 p-4 flex items-start gap-3 animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-300 text-sm font-medium">配置保存成功！</p>
                <p className="text-green-400/70 text-xs mt-1">现在可以获取真实AI运势解读了</p>
              </div>
            </div>
          )}

          <div className="bg-amber-950/30 rounded-xl border border-amber-500/20 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 text-sm font-medium">提示</p>
              <p className="text-amber-400/70 text-xs mt-1">
                如果没有API密钥，应用会自动使用演示数据，不影响其他功能使用
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-center text-purple-400/60 text-xs font-medium">
            获取API密钥
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <a 
              href="https://open.bigmodel.cn/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-purple-950/30 rounded-xl border border-purple-500/20 text-purple-300 hover:border-purple-500/40 transition-all text-center"
            >
              <div className="font-medium mb-1">智谱AI</div>
              <div className="text-purple-400/60 text-xs">GLM模型</div>
            </a>
            <a 
              href="https://dashscope.console.aliyun.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-purple-950/30 rounded-xl border border-purple-500/20 text-purple-300 hover:border-purple-500/40 transition-all text-center"
            >
              <div className="font-medium mb-1">阿里云</div>
              <div className="text-purple-400/60 text-xs">通义千问</div>
            </a>
            <a 
              href="https://platform.deepseek.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-purple-950/30 rounded-xl border border-purple-500/20 text-purple-300 hover:border-purple-500/40 transition-all text-center"
            >
              <div className="font-medium mb-1">DeepSeek</div>
              <div className="text-purple-400/60 text-xs">开源模型</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
