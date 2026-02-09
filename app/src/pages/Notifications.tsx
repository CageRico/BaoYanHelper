import { useEffect, useState } from 'react';
import { 
  Bell, 
  ExternalLink, 
  CheckCheck, 
  RefreshCw, 
  Trash2,
  Clock,
  Building2,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { AppState, Notification } from '@/types';
import { getNotifications, markNotificationAsRead, db, PRESET_PROJECTS } from '@/db/database';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { toast } from 'sonner';
import { openExternalLink } from '@/utils/electron';

interface NotificationsProps {
  onNavigate: (view: AppState['currentView']) => void;
}

// 模拟爬虫数据
const MOCK_NOTIFICATIONS = [
  {
    projectId: 'preset-1',
    projectName: '清华大学 - 金融硕士项目',
    title: '2025年金融硕士招生简章发布',
    link: 'https://www.pbcsf.tsinghua.edu.cn/',
    publishTime: '2025-01-28',
  },
  {
    projectId: 'preset-2',
    projectName: '北京大学 - 金融硕士项目',
    title: '关于2025年推免生报名通知',
    link: 'https://www.gsm.pku.edu.cn/',
    publishTime: '2025-01-27',
  },
  {
    projectId: 'preset-3',
    projectName: '清华大学 - 计算机科学与技术',
    title: '计算机系2025年研究生招生说明会',
    link: 'https://www.cs.tsinghua.edu.cn/',
    publishTime: '2025-01-26',
  },
];

export function Notifications({ }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
    // 模拟定时检查
    const interval = setInterval(() => {
      if (isMonitoring) {
        simulateCrawl();
      }
    }, 30000); // 每30秒检查一次（演示用）
    return () => clearInterval(interval);
  }, [isMonitoring]);

  const loadNotifications = async () => {
    const list = await getNotifications();
    setNotifications(list);
  };

  const simulateCrawl = async () => {
    // 随机添加一条模拟通知
    if (Math.random() > 0.7) {
      const mock = MOCK_NOTIFICATIONS[Math.floor(Math.random() * MOCK_NOTIFICATIONS.length)];
      await db.notifications.add({
        id: crypto.randomUUID(),
        projectId: mock.projectId,
        projectName: mock.projectName,
        title: mock.title,
        link: mock.link,
        publishTime: mock.publishTime,
        isRead: false,
        createdAt: Date.now(),
      });
      loadNotifications();
      toast.info('检测到新通知', {
        description: mock.title,
      });
    }
    setLastCheckTime(new Date());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await simulateCrawl();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => markNotificationAsRead(n.id)));
    loadNotifications();
    toast.success('全部标记为已读');
  };

  const handleClearAll = async () => {
    if (!confirm('确定要清空所有通知吗？')) return;
    await db.notifications.clear();
    loadNotifications();
    toast.success('通知已清空');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">通知推送</h2>
          <p className="text-slate-500 mt-1">自动监控项目官网最新动态</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              id="monitoring" 
              checked={isMonitoring}
              onCheckedChange={setIsMonitoring}
            />
            <Label htmlFor="monitoring" className="text-sm">
              {isMonitoring ? '监控中' : '已暂停'}
            </Label>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            立即检查
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card className="bg-gradient-to-br from-blue-500 to-sky-500 border-0 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-blue-100 text-sm">未读通知</p>
                <p className="text-4xl font-bold">{unreadCount}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">上次检查</p>
              <p className="text-lg font-medium">
                {format(lastCheckTime, 'HH:mm:ss')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            全部已读
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清空
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          <span>每4小时自动检查</span>
        </div>
      </div>

      {/* Notifications List */}
      <Card className="border-slate-200/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            通知列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-600">暂无通知</h3>
              <p className="text-slate-400 mt-2">系统会自动监控您关注的项目</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 rounded-xl transition-all ${
                    notification.isRead 
                      ? 'bg-slate-50' 
                      : 'bg-blue-50 border border-blue-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        notification.isRead ? 'bg-slate-300' : 'bg-blue-500'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-500">{notification.projectName}</span>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                              新
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-slate-800 mb-1">{notification.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>{format(notification.createdAt, 'yyyy-MM-dd HH:mm', { locale: zhCN })}</span>
                          {notification.publishTime && (
                            <span>官网发布：{notification.publishTime}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          标记已读
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openExternalLink(notification.link)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        查看
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monitored Projects */}
      <Card className="border-slate-200/60">
        <CardHeader>
          <CardTitle className="text-lg">监控项目列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESET_PROJECTS.slice(0, 4).map(project => (
              <div 
                key={project.id}
                className="p-4 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-sky-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {project.school.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{project.name}</p>
                    <p className="text-xs text-slate-500 truncate">{project.school}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-500">监控中</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
