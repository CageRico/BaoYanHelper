import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  FileText,
  Globe,
  Loader2,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { AppState, ChatMessage } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AssistantProps {
  onNavigate: (view: AppState['currentView']) => void;
}

// 模拟AI回复
const MOCK_RESPONSES: Record<string, string> = {
  '你好': '你好！我是你的保研智能助手，有什么可以帮助你的吗？',
  'hello': 'Hello! I\'m your graduate school application assistant. How can I help you?',
  '项目': '您可以在"项目管理"页面查看和管理您的保研项目。每个项目都可以上传相关材料。',
  '材料': '保研通常需要准备以下材料：成绩单、排名证明、英语成绩证明、推荐信、个人陈述、简历、论文成果等。您可以在项目详情页逐一上传。',
  '面试': '建议您使用我们的"模拟面试"功能进行练习。我可以根据您的项目和专业背景生成面试问题。',
  '时间': '保研时间线一般从大三下学期开始，6-8月夏令营，9月预推免，9月底正式推免。建议您提前规划好时间。',
  '清华': '清华大学是国内顶尖学府，竞争激烈。建议您提前准备，关注官网通知，并充分展示自己的科研能力和综合素质。',
  '北大': '北京大学也是国内顶尖高校，申请难度较大。建议您在成绩、科研、实践等方面全面发展。',
  '金融': '金融专业保研通常看重数学基础、编程能力和实习经历。建议准备GRE/GMAT，并积累相关实习经验。',
  '计算机': '计算机专业保研看重编程能力、科研经历和项目经验。建议准备LeetCode，参与开源项目或科研课题。',
  '数学': '数学专业保研看重数学基础、科研潜力和学习成绩。建议提前联系导师，了解研究方向。',
};

const DEFAULT_RESPONSE = '感谢您的提问！作为您的保研助手，我可以帮您：\n\n1. 解答关于保研流程的问题\n2. 提供项目申请建议\n3. 帮您分析个人材料\n4. 推荐准备策略\n\n请告诉我您具体想了解什么？';

export function Assistant({ }: AssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是你的保研智能助手。我可以：\n\n• 解答保研相关问题\n• 帮您分析项目信息\n• 提供申请建议\n• 查询您的个人材料\n\n请问有什么可以帮助您的？',
      timestamp: Date.now(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [enableFileAccess, setEnableFileAccess] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    // 关键词匹配
    for (const [keyword, response] of Object.entries(MOCK_RESPONSES)) {
      if (lowerMsg.includes(keyword.toLowerCase())) {
        return response;
      }
    }

    // 默认回复
    return DEFAULT_RESPONSE;
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

    // 模拟AI思考延迟
    setTimeout(() => {
      const response = generateResponse(userMsg.content);
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleClearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: '对话已清空。我是你的保研智能助手，请问有什么可以帮助您的？',
      timestamp: Date.now(),
    }]);
    toast.success('对话已清空');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">智能助手</h2>
          <p className="text-slate-500 mt-1">AI驱动的保研问答助手</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleClearChat}>
          <Trash2 className="w-4 h-4 mr-2" />
          清空对话
        </Button>
      </div>

      {/* Settings */}
      <Card className="border-slate-200/60">
        <CardContent className="p-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-slate-500" />
              <div className="flex items-center gap-2">
                <Switch 
                  id="web-search" 
                  checked={enableWebSearch}
                  onCheckedChange={setEnableWebSearch}
                />
                <Label htmlFor="web-search" className="text-sm cursor-pointer">
                  联网搜索
                </Label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-slate-500" />
              <div className="flex items-center gap-2">
                <Switch 
                  id="file-access" 
                  checked={enableFileAccess}
                  onCheckedChange={setEnableFileAccess}
                />
                <Label htmlFor="file-access" className="text-sm cursor-pointer">
                  访问我的文件
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 border-slate-200/60 flex flex-col overflow-hidden">
        <CardHeader className="border-b border-slate-100 py-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            对话
          </CardTitle>
        </CardHeader>
        
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
                    : 'bg-gradient-to-br from-blue-500 to-purple-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-slate-100 p-4 rounded-2xl flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  <span className="text-sm text-slate-500">思考中...</span>
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
              placeholder="输入您的问题..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-r from-blue-500 to-sky-500"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            AI助手仅供参考，重要决策请以官方信息为准
          </p>
        </div>
      </Card>

      {/* Quick Questions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-slate-500 py-2">快速提问：</span>
        {['保研流程是什么？', '需要准备哪些材料？', '如何准备面试？', '夏令营和预推免的区别'].map(q => (
          <Badge 
            key={q}
            variant="secondary"
            className="cursor-pointer hover:bg-slate-200 transition-colors"
            onClick={() => setInputMessage(q)}
          >
            {q}
          </Badge>
        ))}
      </div>
    </div>
  );
}
