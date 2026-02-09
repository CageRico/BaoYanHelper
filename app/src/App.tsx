import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { Projects } from '@/pages/Projects';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { Notifications } from '@/pages/Notifications';
import { Assistant } from '@/pages/Assistant';
import { Interview } from '@/pages/Interview';
import { Schedule } from '@/pages/Schedule';
import type { AppState } from '@/types';
import { initPresetProjects } from '@/db/database';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'dashboard',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initPresetProjects();
      setIsLoading(false);
    };
    init();
  }, []);

  const navigateTo = (view: AppState['currentView'], projectId?: string) => {
    setAppState({ currentView: view, selectedProjectId: projectId });
  };

  const renderContent = () => {
    switch (appState.currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case 'projects':
        if (appState.selectedProjectId) {
          return <ProjectDetail projectId={appState.selectedProjectId} onNavigate={navigateTo} />;
        }
        return <Projects onNavigate={navigateTo} />;
      case 'notifications':
        return <Notifications onNavigate={navigateTo} />;
      case 'assistant':
        return <Assistant onNavigate={navigateTo} />;
      case 'interview':
        return <Interview onNavigate={navigateTo} />;
      case 'schedule':
        return <Schedule onNavigate={navigateTo} />;
      default:
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex">
      <Sidebar currentView={appState.currentView} onNavigate={navigateTo} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
