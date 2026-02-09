import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  Play, 
  Square,
  RotateCcw,
  Sparkles,
  MessageSquare,
  GraduationCap,
  Globe,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AppState, ChatMessage } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface InterviewProps {
  onNavigate: (view: AppState['currentView']) => void;
}

type InterviewType = 'general' | 'professional' | 'english';

interface InterviewConfig {
  type: InterviewType;
  projectName?: string;
  major?: string;
}

// 模拟面试问题库
const INTERVIEW_QUESTIONS: Record<InterviewType, string[]> = {
  general: [
    '请简单介绍一下你自己。',
    '为什么选择我们学校/项目？',
    '你的研究兴趣是什么？',
    '未来五年的职业规划是什么？',
    '你认为自己的优势和劣势分别是什么？',
    '描述一次你克服困难的经历。',
    '为什么选择继续深造而不是就业？',
    '你对我们学校/导师有什么了解？',
  ],
  professional: [
    '请介绍你参与过的一个科研项目。',
    '你在项目中主要负责什么工作？',
    '遇到过什么技术难题？如何解决的？',
    '请解释你论文中的核心创新点。',
    '你对这个研究领域的发展趋势怎么看？',
    '如果让你独立开展一个研究，你会选择什么方向？',
    '描述一次团队合作的经历。',
    '你的编程能力如何？熟悉哪些语言？',
  ],
  english: [
    'Please introduce yourself in English.',
    'Why do you want to pursue graduate studies?',
    'What are your research interests?',
    'Tell me about a challenging project you\'ve worked on.',
    'What are your strengths and weaknesses?',
    'Where do you see yourself in five years?',
    'Why did you choose our university/program?',
    'Describe your academic achievements.',
  ],
};

const INTERVIEW_TIPS: Record<InterviewType, string> = {
  general: '综合面试主要考察你的综合素质、表达能力和对项目的了解程度。建议提前了解学校和项目信息，准备好自我介绍。',
  professional: '专业面试会深入询问你的科研经历、专业知识和研究计划。建议复习核心课程，熟悉自己的论文和项目细节。',
  english: '英语面试考察你的英语表达能力和听力理解。建议提前准备常见问题的英文回答，保持自信，不要紧张。',
};

export function Interview({ }: InterviewProps) {
  const [config, setConfig] = useState<InterviewConfig>({ type: 'general' });
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startInterview = () => {
    setIsStarted(true);
    setQuestionIndex(0);
    const firstQuestion = INTERVIEW_QUESTIONS[config.type][0];
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `欢迎来到${getTypeLabel(config.type)}模拟面试！\n\n${INTERVIEW_TIPS[config.type]}\n\n让我们开始吧。\n\n**问题1：** ${firstQuestion}`,
        timestamp: Date.now(),
      }
    ]);
  };

  const endInterview = () => {
    setIsStarted(false);
    setMessages([]);
    setQuestionIndex(0);
    toast.success('面试结束');
  };

  const getTypeLabel = (type: InterviewType) => {
    const labels = {
      general: '综合面试',
      professional: '专业面试',
      english: '英语面试',
    };
    return labels[type];
  };

  const getTypeIcon = (type: InterviewType) => {
    const icons = {
      general: MessageSquare,
      professional: BookOpen,
      english: Globe,
    };
    return icons[type];
  };

  const generateFeedback = (): string => {
    const feedbacks = [
      '回答得不错！建议可以补充更多具体例子来支撑你的观点。',
      '回答较为完整。如果能在结尾总结一下要点会更好。',
      '很好的回答！你的思路很清晰。建议可以适当放慢语速。',
      '回答有亮点，但可以更深入地阐述你的思考过程。',
      '不错的尝试！建议提前准备一些具体的案例来丰富回答。',
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const feedback = generateFeedback();
      
      let response = `**反馈：** ${feedback}\n\n`;
      
      const nextIndex = questionIndex + 1;
      if (nextIndex < INTERVIEW_QUESTIONS[config.type].length) {
        const nextQuestion = INTERVIEW_QUESTIONS[config.type][nextIndex];
        response += `**问题${nextIndex + 1}：** ${nextQuestion}`;
        setQuestionIndex(nextIndex);
      } else {
        response += '**面试结束！**\n\n感谢您完成本次模拟面试。建议您：\n1. 回顾自己的回答，找出可以改进的地方\n2. 针对薄弱点进行针对性练习\n3. 多进行几次模拟，增强信心\n\n祝您面试顺利！';
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isStarted) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">模拟面试</h2>
          <p className="text-slate-500 mt-1">AI驱动的面试练习，帮助您提升面试表现</p>
        </div>

        {/* Interview Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['general', 'professional', 'english'] as InterviewType[]).map((type) => {
            const Icon = getTypeIcon(type);
            return (
              <Card 
                key={type}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  config.type === type ? 'ring-2 ring-blue-500 border-blue-500' : ''
                }`}
                onClick={() => setConfig({ ...config, type })}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-400 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">{getTypeLabel(type)}</h3>
                  <p className="text-sm text-slate-500">{INTERVIEW_TIPS[type].slice(0, 50)}...</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Configuration */}
        <Card className="border-slate-200/60">
          <CardHeader>
            <CardTitle className="text-lg">面试设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">面试类型</label>
                <Select 
                  value={config.type} 
                  onValueChange={(v: InterviewType) => setConfig({ ...config, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">综合面试</SelectItem>
                    <SelectItem value="professional">专业面试</SelectItem>
                    <SelectItem value="english">英语面试</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">目标项目（可选）</label>
                <Input 
                  placeholder="例如：清华大学金融硕士"
                  value={config.projectName || ''}
                  onChange={(e) => setConfig({ ...config, projectName: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="text-center">
          <Button 
            size="lg"
            onClick={startInterview}
            className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 px-8"
          >
            <Play className="w-5 h-5 mr-2" />
            开始模拟面试
          </Button>
        </div>

        {/* Tips */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">面试小贴士</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• 提前准备好自我介绍，控制在1-2分钟</li>
                  <li>• 回答问题时保持眼神交流，展现自信</li>
                  <li>• 用STAR法则回答行为类问题（情境-任务-行动-结果）</li>
                  <li>• 遇到不会的问题，诚实回答并表达学习意愿</li>
                  <li>• 准备几个向面试官提问的问题</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={endInterview}>
            <Square className="w-5 h-5 text-red-500" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">{getTypeLabel(config.type)}</h2>
              <Badge variant="secondary">进行中</Badge>
            </div>
            <p className="text-sm text-slate-500">
              问题 {Math.min(questionIndex + 1, INTERVIEW_QUESTIONS[config.type].length)} / {INTERVIEW_QUESTIONS[config.type].length}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={startInterview}>
          <RotateCcw className="w-4 h-4 mr-2" />
          重新开始
        </Button>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 border-slate-200/60 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-slate-600 to-slate-700' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <GraduationCap className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`max-w-[70%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-4 rounded-2xl text-left ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {format(message.timestamp, 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="bg-slate-100 p-4 rounded-2xl flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                  </div>
                  <span className="text-sm text-slate-500">面试官思考中...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex gap-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入您的回答..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-r from-blue-500 to-sky-500"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
