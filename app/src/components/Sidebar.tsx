import { 
  LayoutDashboard, 
  FolderOpen, 
  Bell, 
  MessageSquare, 
  Mic2, 
  Calendar,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AppState } from '@/types';
import { useEffect, useState } from 'react';
import { getUnreadNotificationsCount } from '@/db/database';

interface SidebarProps {
  currentView: AppState['currentView'];
  onNavigate: (view: AppState['currentView']) => void;
}

const menuItems = [
  { id: 'dashboard', label: '总览', icon: LayoutDashboard },
  { id: 'projects', label: '项目管理', icon: FolderOpen },
  { id: 'notifications', label: '通知推送', icon: Bell },
  { id: 'schedule', label: '日程管理', icon: Calendar },
  { id: 'assistant', label: '智能助手', icon: MessageSquare },
  { id: 'interview', label: '模拟面试', icon: Mic2 },
] as const;

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkUnread = async () => {
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
    };
    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg">保研助手</h1>
            <p className="text-xs text-slate-500">个人辅助工具</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id as AppState['currentView'])}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive ? 'text-white' : 'text-slate-500')} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <span className={cn(
                      'px-2 py-0.5 text-xs rounded-full font-semibold',
                      isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    )}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-2">本地存储模式</p>
          <p className="text-xs text-slate-400">数据仅保存在您的设备上</p>
        </div>
      </div>
    </aside>
  );
}
