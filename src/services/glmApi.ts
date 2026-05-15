import { StarChart, FortuneAnalysis } from '@/types';

const getStoredApiKey = () => {
  return localStorage.getItem('VITE_GLM_API_KEY') || '';
};

const getStoredApiUrl = () => {
  return localStorage.getItem('VITE_GLM_API_URL') || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
};

const getStoredModel = () => {
  return localStorage.getItem('VITE_AI_MODEL') || 'glm-4-flash';
};

const getCustomModel = () => {
  return localStorage.getItem('VITE_CUSTOM_MODEL') || '';
};

interface GLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GLMRequest {
  model: string;
  messages: GLMMessage[];
  temperature?: number;
}

interface GLMResponse {
  id?: string;
  choices?: Array<{
    index?: number;
    message?: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }>;
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

export async function callGLM(messages: GLMMessage[]): Promise<string> {
  const API_KEY = getStoredApiKey();
  const API_URL = getStoredApiUrl();
  const model = getStoredModel();
  const customModel = getCustomModel();
  
  const actualModel = model === 'custom' ? customModel : model;
  
  console.log('[GLM API] 开始调用');
  console.log('[GLM API] 模型:', actualModel);
  console.log('[GLM API] API Key长度:', API_KEY.length);
  console.log('[GLM API] API URL:', API_URL);
  
  if (!API_KEY) {
    throw new Error('API密钥未配置。请在应用中配置API密钥');
  }

  if (!actualModel) {
    throw new Error('请选择AI模型');
  }

  const request: GLMRequest = {
    model: actualModel,
    messages,
    temperature: 0.7
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(request)
    });

    console.log('[GLM API] 响应状态:', response.status);

    const data: GLMResponse = await response.json();
    
    console.log('[GLM API] 响应数据:', data);

    if (data.error) {
      throw new Error(data.error.message || 'API调用失败');
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('API返回数据格式错误');
    }

    return data.choices[0].message?.content || '';

  } catch (error) {
    console.error('[GLM API] 调用失败:', error);
    throw error;
  }
}

export async function generateFortuneAnalysis(
  starChart: StarChart,
  userInput: { name: string; gender: string; mbti: string }
): Promise<FortuneAnalysis> {
  const prompt = `你是紫微斗数命理大师，精通中华传统命理文化。请根据以下信息，为用户撰写专业的命盘解读报告。

用户基本信息：
- 姓名：${userInput.name}
- 性别：${userInput.gender === 'male' ? '男' : '女'}
- MBTI人格类型：${userInput.mbti}

四柱信息：
${starChart.tianganDizhi ? `- 年柱：${starChart.tianganDizhi.tiangan.year}${starChart.tianganDizhi.dizhi.year}
- 月柱：${starChart.tianganDizhi.tiangan.month}${starChart.tianganDizhi.dizhi.month}
- 日柱：${starChart.tianganDizhi.tiangan.day}${starChart.tianganDizhi.dizhi.day}
- 时柱：${starChart.tianganDizhi.tiangan.hour}${starChart.tianganDizhi.dizhi.hour}` : ''}

命宫：第${starChart.mingGong != null ? starChart.mingGong + 1 : ''}宫
身宫：第${starChart.shenGong != null ? starChart.shenGong + 1 : ''}宫

十二宫星曜：
${starChart.palaces?.map((p) => {
  const stars = [...p.mainStars, ...p.assistantStars, ...p.maleficStars];
  return stars.length > 0 ? `${p.name}：${stars.join('、')}` : null;
}).filter(Boolean).join('\n')}

请撰写一份专业的命盘解读报告，包含：命宫论断、性格禀赋、事业指向、情感姻缘、财富运势、流年总评六个部分。语言古雅庄重，融合传统命理术语。`;

  const content = await callGLM([{ role: 'user', content: prompt }]);
  
  return {
    content,
    timestamp: Date.now(),
    type: 'full'
  };
}
