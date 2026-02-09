import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  GraduationCap, 
  MoreVertical, 
  Trash2, 
  Edit2,
  ExternalLink,
  FileText
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AppState, Project } from '@/types';
import { getProjects, addProject, deleteProject, updateProject, PRESET_PROJECTS } from '@/db/database';
import { toast } from 'sonner';

interface ProjectsProps {
  onNavigate: (view: AppState['currentView'], projectId?: string) => void;
}

export function Projects({ onNavigate }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customProject, setCustomProject] = useState({
    name: '',
    school: '',
    major: '',
    description: '',
    deadline: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const list = await getProjects();
    setProjects(list);
  };

  const handleAddProject = async () => {
    try {
      let projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

      if (selectedPreset && selectedPreset !== 'custom') {
        const preset = PRESET_PROJECTS.find(p => p.id === selectedPreset);
        if (!preset) return;
        projectData = {
          name: preset.name,
          school: preset.school,
          major: preset.major,
          description: preset.description,
          deadline: customProject.deadline,
          status: 'preparing',
        };
      } else {
        if (!customProject.name || !customProject.school) {
          toast.error('请填写项目名称和学校');
          return;
        }
        projectData = {
          name: customProject.name,
          school: customProject.school,
          major: customProject.major,
          description: customProject.description,
          deadline: customProject.deadline,
          status: 'preparing',
        };
      }

      await addProject(projectData);
      toast.success('项目添加成功');
      setIsAddDialogOpen(false);
      setSelectedPreset('');
      setCustomProject({ name: '', school: '', major: '', description: '', deadline: '' });
      loadProjects();
    } catch (error) {
      toast.error('添加失败');
    }
  };

  const handleEditProject = async () => {
    if (!editingProject) return;
    try {
      await updateProject(editingProject.id, editingProject);
      toast.success('项目更新成功');
      setIsEditDialogOpen(false);
      setEditingProject(null);
      loadProjects();
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？相关文件也会被删除。')) return;
    try {
      await deleteProject(id);
      toast.success('项目删除成功');
      loadProjects();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.major?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      preparing: 'bg-amber-100 text-amber-700 border-amber-200',
      submitted: 'bg-blue-100 text-blue-700 border-blue-200',
      interview: 'bg-purple-100 text-purple-700 border-purple-200',
      offer: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return colorMap[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">项目管理</h2>
          <p className="text-slate-500 mt-1">管理您的保研申请项目</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600">
              <Plus className="w-4 h-4 mr-2" />
              添加项目
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>添加新项目</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>选择项目模板</Label>
                <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择预设项目或自定义" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">自定义项目</SelectItem>
                    {PRESET_PROJECTS.map(preset => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.school} - {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPreset === 'custom' && (
                <>
                  <div className="space-y-2">
                    <Label>项目名称</Label>
                    <Input 
                      value={customProject.name}
                      onChange={e => setCustomProject({...customProject, name: e.target.value})}
                      placeholder="例如：金融硕士项目"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>学校</Label>
                    <Input 
                      value={customProject.school}
                      onChange={e => setCustomProject({...customProject, school: e.target.value})}
                      placeholder="例如：清华大学"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>专业</Label>
                    <Input 
                      value={customProject.major}
                      onChange={e => setCustomProject({...customProject, major: e.target.value})}
                      placeholder="例如：金融"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>项目描述</Label>
                    <Textarea 
                      value={customProject.description}
                      onChange={e => setCustomProject({...customProject, description: e.target.value})}
                      placeholder="项目简介..."
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>申请截止日期</Label>
                <Input 
                  type="date"
                  value={customProject.deadline}
                  onChange={e => setCustomProject({...customProject, deadline: e.target.value})}
                />
              </div>

              <Button onClick={handleAddProject} className="w-full bg-gradient-to-r from-blue-500 to-sky-500">
                确认添加
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input 
          placeholder="搜索项目名称、学校或专业..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <GraduationCap className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600">暂无项目</h3>
          <p className="text-slate-400 mt-2">点击上方按钮添加您的第一个项目</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="group border-slate-200/60 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
              onClick={() => onNavigate('projects', project.id)}
            >
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-400 rounded-xl flex items-center justify-center text-white font-bold">
                      {project.school.slice(0, 2)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={e => {
                          e.stopPropagation();
                          setEditingProject(project);
                          setIsEditDialogOpen(true);
                        }}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-semibold text-slate-800 mb-1">{project.name}</h3>
                  <p className="text-sm text-slate-500 mb-3">{project.school}</p>
                  
                  {project.major && (
                    <p className="text-xs text-slate-400 mb-3">专业：{project.major}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                    {project.deadline && (
                      <span className="text-xs text-slate-400">
                        截止：{project.deadline}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FileText className="w-4 h-4" />
                    <span>查看详情</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑项目</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>项目名称</Label>
                <Input 
                  value={editingProject.name}
                  onChange={e => setEditingProject({...editingProject, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>学校</Label>
                <Input 
                  value={editingProject.school}
                  onChange={e => setEditingProject({...editingProject, school: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>专业</Label>
                <Input 
                  value={editingProject.major || ''}
                  onChange={e => setEditingProject({...editingProject, major: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>项目描述</Label>
                <Textarea 
                  value={editingProject.description || ''}
                  onChange={e => setEditingProject({...editingProject, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>申请状态</Label>
                <Select 
                  value={editingProject.status} 
                  onValueChange={(v: Project['status']) => setEditingProject({...editingProject, status: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preparing">准备中</SelectItem>
                    <SelectItem value="submitted">已提交</SelectItem>
                    <SelectItem value="interview">面试中</SelectItem>
                    <SelectItem value="offer">已录取</SelectItem>
                    <SelectItem value="rejected">未录取</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>申请截止日期</Label>
                <Input 
                  type="date"
                  value={editingProject.deadline || ''}
                  onChange={e => setEditingProject({...editingProject, deadline: e.target.value})}
                />
              </div>
              <Button onClick={handleEditProject} className="w-full bg-gradient-to-r from-blue-500 to-sky-500">
                保存修改
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
