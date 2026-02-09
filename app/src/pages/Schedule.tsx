import { useEffect, useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2,
  Clock,
  Flag,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { AppState, ScheduleTask } from '@/types';
import { getScheduleTasks, addScheduleTask, updateScheduleTask, deleteScheduleTask, getProjects } from '@/db/database';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';


interface ScheduleProps {
  onNavigate: (view: AppState['currentView']) => void;
}

export function Schedule({ }: ScheduleProps) {
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [newTask, setNewTask] = useState<Partial<ScheduleTask>>({
    title: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    progress: 0,
    type: 'task',
    status: 'todo',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [taskList, projectList] = await Promise.all([
      getScheduleTasks(),
      getProjects(),
    ]);
    setTasks(taskList);
    setProjects(projectList.map(p => ({ id: p.id, name: p.name })));
  };

  const handleAddTask = async () => {
    if (!newTask.title) {
      toast.error('请输入任务标题');
      return;
    }
    try {
      await addScheduleTask(newTask as Omit<ScheduleTask, 'id'>);
      toast.success('任务添加成功');
      setIsAddDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        progress: 0,
        type: 'task',
        status: 'todo',
      });
      loadData();
    } catch (error) {
      toast.error('添加失败');
    }
  };

  const handleEditTask = async () => {
    if (!editingTask) return;
    try {
      await updateScheduleTask(editingTask.id, editingTask);
      toast.success('任务更新成功');
      setIsEditDialogOpen(false);
      setEditingTask(null);
      loadData();
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('确定要删除这个任务吗？')) return;
    try {
      await deleteScheduleTask(id);
      toast.success('任务删除成功');
      loadData();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleToggleTaskStatus = async (task: ScheduleTask) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const newProgress = newStatus === 'completed' ? 100 : task.progress;
    await updateScheduleTask(task.id, { status: newStatus, progress: newProgress });
    loadData();
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 1 }),
    end: endOfWeek(currentWeek, { weekStartsOn: 1 }),
  });

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      return day >= taskStart && day <= taskEnd;
    });
  };

  const getStatusColor = (status: ScheduleTask['status']) => {
    const colors = {
      todo: 'bg-slate-100 text-slate-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
    };
    return colors[status];
  };

  const getStatusText = (status: ScheduleTask['status']) => {
    const texts = {
      todo: '待办',
      'in-progress': '进行中',
      completed: '已完成',
    };
    return texts[status];
  };

  const getTypeIcon = (type: ScheduleTask['type']) => {
    return type === 'milestone' ? Flag : CheckCircle2;
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">日程管理</h2>
          <p className="text-slate-500 mt-1">规划您的保研时间线</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <Button 
              variant={viewMode === 'week' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              周视图
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              列表
            </Button>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-sky-500">
                <Plus className="w-4 h-4 mr-2" />
                添加任务
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>添加新任务</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>任务标题</Label>
                  <Input 
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    placeholder="例如：准备个人陈述"
                  />
                </div>
                <div className="space-y-2">
                  <Label>任务描述</Label>
                  <Input 
                    value={newTask.description || ''}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    placeholder="任务详情..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>开始日期</Label>
                    <Input 
                      type="date"
                      value={newTask.startDate}
                      onChange={e => setNewTask({...newTask, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>结束日期</Label>
                    <Input 
                      type="date"
                      value={newTask.endDate}
                      onChange={e => setNewTask({...newTask, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>任务类型</Label>
                    <Select 
                      value={newTask.type} 
                      onValueChange={(v: 'task' | 'milestone') => setNewTask({...newTask, type: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="task">普通任务</SelectItem>
                        <SelectItem value="milestone">里程碑</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>关联项目（可选）</Label>
                    <Select 
                      value={newTask.projectId || ''} 
                      onValueChange={(v) => setNewTask({...newTask, projectId: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择项目" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">无</SelectItem>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddTask} className="w-full bg-gradient-to-r from-blue-500 to-sky-500">
                  确认添加
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="bg-gradient-to-br from-blue-500 to-sky-500 border-0 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">总体进度</p>
              <p className="text-4xl font-bold">{totalProgress}%</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">任务统计</p>
              <p className="text-lg font-medium">
                已完成 {completedTasks} / 总计 {tasks.length}
              </p>
            </div>
          </div>
          <Progress value={totalProgress} className="h-2 mt-4 bg-white/20" />
        </CardContent>
      </Card>

      {/* Week View */}
      {viewMode === 'week' ? (
        <Card className="border-slate-200/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              周视图
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-sm font-medium">
                {format(weekDays[0], 'MM月dd日')} - {format(weekDays[6], 'MM月dd日')}
              </span>
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => {
                const dayTasks = getTasksForDay(day);
                const isToday = isSameDay(day, new Date());
                return (
                  <div 
                    key={index} 
                    className={`min-h-[120px] p-2 rounded-lg border ${
                      isToday ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className={`text-center text-sm font-medium mb-2 ${
                      isToday ? 'text-blue-600' : 'text-slate-600'
                    }`}>
                      <div>{['一', '二', '三', '四', '五', '六', '日'][index]}</div>
                      <div>{format(day, 'd')}</div>
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map(task => (
                        <div 
                          key={task.id}
                          className={`text-xs p-1 rounded truncate ${
                            task.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : task.type === 'milestone'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-slate-400 text-center">
                          +{dayTasks.length - 3} 更多
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View */
        <Card className="border-slate-200/60">
          <CardHeader>
            <CardTitle className="text-lg">任务列表</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-400">暂无任务</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const TypeIcon = getTypeIcon(task.type);
                  return (
                    <div 
                      key={task.id}
                      className={`flex items-center justify-between p-4 rounded-xl border ${
                        task.status === 'completed' ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggleTaskStatus(task)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.status === 'completed'
                              ? 'bg-green-500 border-green-500'
                              : 'border-slate-300 hover:border-blue-500'
                          }`}
                        >
                          {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <TypeIcon className={`w-4 h-4 ${task.type === 'milestone' ? 'text-amber-500' : 'text-blue-500'}`} />
                            <span className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {task.title}
                            </span>
                            <Badge className={getStatusColor(task.status)}>{getStatusText(task.status)}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.startDate} ~ {task.endDate}
                            </span>
                            {task.description && <span>{task.description}</span>}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingTask(task);
                            setIsEditDialogOpen(true);
                          }}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑任务</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>任务标题</Label>
                <Input 
                  value={editingTask.title}
                  onChange={e => setEditingTask({...editingTask, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>任务描述</Label>
                <Input 
                  value={editingTask.description || ''}
                  onChange={e => setEditingTask({...editingTask, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>开始日期</Label>
                  <Input 
                    type="date"
                    value={editingTask.startDate}
                    onChange={e => setEditingTask({...editingTask, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>结束日期</Label>
                  <Input 
                    type="date"
                    value={editingTask.endDate}
                    onChange={e => setEditingTask({...editingTask, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>进度 ({editingTask.progress}%)</Label>
                <Input 
                  type="range"
                  min="0"
                  max="100"
                  value={editingTask.progress}
                  onChange={e => setEditingTask({...editingTask, progress: parseInt(e.target.value)})}
                />
              </div>
              <Button onClick={handleEditTask} className="w-full bg-gradient-to-r from-blue-500 to-sky-500">
                保存修改
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
