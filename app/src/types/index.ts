// 项目类型
export interface Project {
  id: string;
  name: string;
  school: string;
  major: string;
  description: string;
  deadline?: string;
  status: 'preparing' | 'submitted' | 'interview' | 'offer' | 'rejected';
  createdAt: number;
  updatedAt: number;
}

// 文件类型
export interface ProjectFile {
  id: string;
  projectId: string;
  category: FileCategory;
  name: string;
  type: string;
  size: number;
  content?: Blob;
  uploadedAt: number;
}

// 文件分类
export type FileCategory = 
  | 'transcript'      // 成绩单
  | 'ranking'         // 排名证明
  | 'english'         // 英语证明
  | 'recommendation'  // 推荐信
  | 'statement'       // 自我陈述
  | 'resume'          // 个人简历
  | 'paper'           // 论文成果
  | 'internship'      // 实习实践
  | 'study'           // 复习材料
  | 'other';          // 其他材料

// 文件分类配置
export const FILE_CATEGORIES: { key: FileCategory; label: string; accept: string }[] = [
  { key: 'transcript', label: '成绩单', accept: '.pdf' },
  { key: 'ranking', label: '排名证明', accept: '.pdf' },
  { key: 'english', label: '英语证明', accept: '.pdf' },
  { key: 'recommendation', label: '专家推荐信', accept: '.pdf,.doc,.docx' },
  { key: 'statement', label: '自我陈述', accept: '.pdf,.doc,.docx' },
  { key: 'resume', label: '个人简历', accept: '.pdf,.doc,.docx' },
  { key: 'paper', label: '论文成果', accept: '.pdf' },
  { key: 'internship', label: '实习实践成果', accept: '.pdf,.zip,.pptx' },
  { key: 'study', label: '复习材料', accept: '.pdf,.doc,.docx,.zip' },
  { key: 'other', label: '其他材料', accept: '*' },
];

// 通知类型
export interface Notification {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  link: string;
  publishTime?: string;
  isRead: boolean;
  createdAt: number;
}

// 预设项目
export interface PresetProject {
  id: string;
  name: string;
  school: string;
  major: string;
  description: string;
  officialUrl: string;
}

// 日程任务
export interface ScheduleTask {
  id: string;
  projectId?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  progress: number;
  type: 'milestone' | 'task';
  status: 'todo' | 'in-progress' | 'completed';
}

// 聊天消息
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// 面试会话
export interface InterviewSession {
  id: string;
  projectId?: string;
  projectName?: string;
  type: 'general' | 'professional' | 'english';
  messages: ChatMessage[];
  startedAt: number;
  endedAt?: number;
}

// 应用状态
export interface AppState {
  currentView: 'dashboard' | 'projects' | 'notifications' | 'assistant' | 'interview' | 'schedule';
  selectedProjectId?: string;
}
