import { useEffect, useState } from 'react';
import { 
  FolderOpen, 
  Bell, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AppState, Project, Notification, ScheduleTask } from '@/types';
import { getProjects, getNotifications, getScheduleTasks } from '@/db/database';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface DashboardProps {
  onNavigate: (view: AppState['currentView'], projectId?: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [, setTasks] = useState<ScheduleTask[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    preparingProjects: 0,
    submittedProjects: 0,
    unreadNotifications: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      const [projectList, notificationList, taskList] = await Promise.all([
        getProjects(),
        getNotifications(),
        getScheduleTasks(),
      ]);

      setProjects(projectList.slice(0, 4));
      setNotifications(notificationList.slice(0, 5));
      setTasks(taskList.slice(0, 5));

      setStats({
        totalProjects: projectList.length,
        preparingProjects: projectList.filter(p => p.status === 'preparing').length,
        submittedProjects: projectList.filter(p => p.status === 'submitted').length,
        unreadNotifications: notificationList.filter(n => !n.isRead).length,
      });
    };
    loadData();
  }, []);

  const getStatusText = (status: Project['status']) => {
    const statusMap = {
      preparing: '准备中',
      submitted: '已提交',
      interview: '面试中',
      offer: '已录取',
      rejected: '未录取',
    };
    return statusMap[status];
  };

  const getStatusColor = (status: Project['status']) => {
    const colorMap = {
      preparing: 'bg-amber-100 text-amber-700',
      submitted: 'bg-blue-100 text-blue-700',
      interview: 'bg-purple-100 text-purple-700',
      offer: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return colorMap[status];
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">欢迎回来</h2>
          <p className="text-slate-500 mt-1">今天是 {format(new Date(), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          <span>上次更新: {format(new Date(), 'HH:mm')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-sky-500 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">项目总数</p>
                <p className="text-3xl font-bold mt-1">{stats.totalProjects}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">准备中</p>
                <p className="text-3xl font-bold mt-1 text-slate-800">{stats.preparingProjects}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">已提交</p>
                <p className="text-3xl font-bold mt-1 text-slate-800">{stats.submittedProjects}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">未读通知</p>
                <p className="text-3xl font-bold mt-1 text-slate-800">{stats.unreadNotifications}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Section */}
        <Card className="border-slate-200/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-slate-800">我的项目</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('projects')}
              className="text-blue-600 hover:text-blue-700"
            >
              查看全部 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无项目，快去添加吧</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div 
                    key={project.id}
                    onClick={() => onNavigate('projects', project.id)}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-sky-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {project.school.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{project.name}</p>
                        <p className="text-sm text-slate-500">{project.school}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="border-slate-200/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-slate-800">最新通知</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('notifications')}
              className="text-blue-600 hover:text-blue-700"
            >
              查看全部 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无通知</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-xl transition-colors ${notification.isRead ? 'bg-slate-50' : 'bg-blue-50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${notification.isRead ? 'bg-slate-300' : 'bg-blue-500'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">{notification.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{notification.projectName}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {format(notification.createdAt, 'MM-dd HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="border-slate-200/60 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-sky-50 to-blue-50"
          onClick={() => onNavigate('assistant')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">智能助手</p>
                <p className="text-sm text-slate-500">解答关于项目和个人信息的问题</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-slate-200/60 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50"
          onClick={() => onNavigate('interview')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">模拟面试</p>
                <p className="text-sm text-slate-500">AI驱动的面试练习</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-slate-200/60 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50"
          onClick={() => onNavigate('schedule')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">日程管理</p>
                <p className="text-sm text-slate-500">规划保研时间线</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
