import Dexie, { type Table } from 'dexie';
import type { Project, ProjectFile, Notification, ScheduleTask, InterviewSession, PresetProject } from '@/types';

class BaoyanDatabase extends Dexie {
  projects!: Table<Project>;
  files!: Table<ProjectFile>;
  notifications!: Table<Notification>;
  scheduleTasks!: Table<ScheduleTask>;
  interviewSessions!: Table<InterviewSession>;
  presetProjects!: Table<PresetProject>;

  constructor() {
    super('BaoyanDatabase');
    this.version(1).stores({
      projects: 'id, name, school, status, createdAt',
      files: 'id, projectId, category, uploadedAt',
      notifications: 'id, projectId, isRead, createdAt',
      scheduleTasks: 'id, projectId, startDate, endDate, status',
      interviewSessions: 'id, projectId, startedAt',
      presetProjects: 'id, name, school',
    });
  }
}

export const db = new BaoyanDatabase();

// 预设项目数据
export const PRESET_PROJECTS: PresetProject[] = [
  {
    id: 'preset-1',
    name: '金融硕士项目',
    school: '清华大学',
    major: '金融',
    description: '清华大学五道口金融学院金融硕士项目，培养高层次金融人才。',
    officialUrl: 'https://www.pbcsf.tsinghua.edu.cn/',
  },
  {
    id: 'preset-2',
    name: '金融硕士项目',
    school: '北京大学',
    major: '金融',
    description: '北京大学光华管理学院金融硕士项目，国内顶尖金融教育。',
    officialUrl: 'https://www.gsm.pku.edu.cn/',
  },
  {
    id: 'preset-3',
    name: '计算机科学与技术',
    school: '清华大学',
    major: '计算机',
    description: '清华大学计算机系研究生项目，计算机领域顶尖学府。',
    officialUrl: 'https://www.cs.tsinghua.edu.cn/',
  },
  {
    id: 'preset-4',
    name: '计算机科学与技术',
    school: '北京大学',
    major: '计算机',
    description: '北京大学信息科学技术学院计算机专业。',
    officialUrl: 'https://eecs.pku.edu.cn/',
  },
  {
    id: 'preset-5',
    name: '数学科学学院',
    school: '复旦大学',
    major: '数学',
    description: '复旦大学数学科学学院，数学领域知名学府。',
    officialUrl: 'https://math.fudan.edu.cn/',
  },
  {
    id: 'preset-6',
    name: '上海高级金融学院',
    school: '上海交通大学',
    major: '金融',
    description: '上海交通大学上海高级金融学院金融硕士项目。',
    officialUrl: 'https://www.saif.sjtu.edu.cn/',
  },
  {
    id: 'preset-7',
    name: '经济管理学院',
    school: '中国人民大学',
    major: '商科',
    description: '中国人民大学经济管理学院，商科领域传统强校。',
    officialUrl: 'https://sem.ruc.edu.cn/',
  },
  {
    id: 'preset-8',
    name: '数学学院',
    school: '中国科学技术大学',
    major: '数学',
    description: '中国科学技术大学数学学院，基础数学研究重镇。',
    officialUrl: 'https://math.ustc.edu.cn/',
  },
];

// 初始化预设项目
export async function initPresetProjects() {
  const count = await db.presetProjects.count();
  if (count === 0) {
    await db.presetProjects.bulkAdd(PRESET_PROJECTS);
  }
}

// 项目操作
export async function addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();
  await db.projects.add({
    ...project,
    id,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function updateProject(id: string, updates: Partial<Project>) {
  await db.projects.update(id, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteProject(id: string) {
  await db.projects.delete(id);
  // 级联删除相关文件
  const files = await db.files.where('projectId').equals(id).toArray();
  await db.files.bulkDelete(files.map(f => f.id));
}

export async function getProjects(): Promise<Project[]> {
  return await db.projects.toArray();
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  return await db.projects.get(id);
}

// 文件操作
export async function addFile(file: Omit<ProjectFile, 'id' | 'uploadedAt'>): Promise<string> {
  const id = crypto.randomUUID();
  await db.files.add({
    ...file,
    id,
    uploadedAt: Date.now(),
  });
  return id;
}

export async function deleteFile(id: string) {
  await db.files.delete(id);
}

export async function getFilesByProject(projectId: string): Promise<ProjectFile[]> {
  return await db.files.where('projectId').equals(projectId).toArray();
}

export async function getFilesByCategory(projectId: string, category: string): Promise<ProjectFile[]> {
  return await db.files.where({ projectId, category }).toArray();
}

// 通知操作
export async function addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
  const id = crypto.randomUUID();
  await db.notifications.add({
    ...notification,
    id,
    createdAt: Date.now(),
  });
  return id;
}

export async function markNotificationAsRead(id: string) {
  await db.notifications.update(id, { isRead: true });
}

export async function getNotifications(): Promise<Notification[]> {
  return await db.notifications.orderBy('createdAt').reverse().toArray();
}

export async function getUnreadNotificationsCount(): Promise<number> {
  return await db.notifications.where('isRead').equals(0).count();
}

// 日程操作
export async function addScheduleTask(task: Omit<ScheduleTask, 'id'>): Promise<string> {
  const id = crypto.randomUUID();
  await db.scheduleTasks.add({
    ...task,
    id,
  });
  return id;
}

export async function updateScheduleTask(id: string, updates: Partial<ScheduleTask>) {
  await db.scheduleTasks.update(id, updates);
}

export async function deleteScheduleTask(id: string) {
  await db.scheduleTasks.delete(id);
}

export async function getScheduleTasks(): Promise<ScheduleTask[]> {
  return await db.scheduleTasks.toArray();
}

// 面试会话操作
export async function addInterviewSession(session: Omit<InterviewSession, 'id' | 'startedAt'>): Promise<string> {
  const id = crypto.randomUUID();
  await db.interviewSessions.add({
    ...session,
    id,
    startedAt: Date.now(),
  });
  return id;
}

export async function updateInterviewSession(id: string, updates: Partial<InterviewSession>) {
  await db.interviewSessions.update(id, updates);
}

export async function getInterviewSessions(): Promise<InterviewSession[]> {
  return await db.interviewSessions.orderBy('startedAt').reverse().toArray();
}
