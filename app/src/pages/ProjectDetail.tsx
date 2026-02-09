import { useEffect, useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Trash2, 
  Download,
  FolderOpen,
  Calendar,
  Building2,
  BookOpen,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AppState, Project, ProjectFile, FileCategory } from '@/types';
import { FILE_CATEGORIES } from '@/types';
import { getProjectById, getFilesByProject, addFile, deleteFile } from '@/db/database';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ProjectDetailProps {
  projectId: string;
  onNavigate: (view: AppState['currentView'], projectId?: string) => void;
}

export function ProjectDetail({ projectId, onNavigate }: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCategory, setUploadingCategory] = useState<FileCategory | null>(null);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    setIsLoading(true);
    const [projectData, fileList] = await Promise.all([
      getProjectById(projectId),
      getFilesByProject(projectId),
    ]);
    setProject(projectData || null);
    setFiles(fileList);
    setIsLoading(false);
  };

  const handleFileUpload = async (category: FileCategory, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingCategory(category);
    try {
      await addFile({
        projectId,
        category,
        name: file.name,
        type: file.type,
        size: file.size,
        content: file,
      });
      toast.success('文件上传成功');
      loadProjectData();
    } catch (error) {
      toast.error('上传失败');
    } finally {
      setUploadingCategory(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('确定要删除这个文件吗？')) return;
    try {
      await deleteFile(fileId);
      toast.success('文件删除成功');
      loadProjectData();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleDownloadFile = (file: ProjectFile) => {
    if (file.content) {
      const url = URL.createObjectURL(file.content);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getFilesByCategory = (category: FileCategory) => {
    return files.filter(f => f.category === category);
  };

  const getCompletionProgress = () => {
    const categoriesWithFiles = FILE_CATEGORIES.filter(cat => 
      getFilesByCategory(cat.key).length > 0
    ).length;
    return Math.round((categoriesWithFiles / FILE_CATEGORIES.length) * 100);
  };

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">项目不存在</p>
        <Button onClick={() => onNavigate('projects')} className="mt-4">
          返回项目列表
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onNavigate('projects')}
          className="hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800">{project.name}</h2>
            <Badge className={getStatusColor(project.status)}>
              {getStatusText(project.status)}
            </Badge>
          </div>
          <p className="text-slate-500">{project.school}</p>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200/60">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">学校</p>
              <p className="font-medium text-slate-800">{project.school}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">专业</p>
              <p className="font-medium text-slate-800">{project.major || '未设置'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">截止日期</p>
              <p className="font-medium text-slate-800">{project.deadline || '未设置'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card className="border-slate-200/60">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-slate-800">材料准备进度</span>
            </div>
            <span className="text-sm font-medium text-blue-600">{getCompletionProgress()}%</span>
          </div>
          <Progress value={getCompletionProgress()} className="h-2" />
          <p className="text-sm text-slate-500 mt-3">
            已完成 {FILE_CATEGORIES.filter(cat => getFilesByCategory(cat.key).length > 0).length} / {FILE_CATEGORIES.length} 类材料
          </p>
        </CardContent>
      </Card>

      {/* File Management */}
      <Card className="border-slate-200/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            材料管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="grid grid-cols-5 lg:grid-cols-10 mb-6">
              {FILE_CATEGORIES.map(cat => (
                <TabsTrigger key={cat.key} value={cat.key} className="text-xs">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {FILE_CATEGORIES.map(cat => {
              const categoryFiles = getFilesByCategory(cat.key);
              return (
                <TabsContent key={cat.key} value={cat.key} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-800">{cat.label}</h4>
                      <p className="text-sm text-slate-500">支持格式: {cat.accept}</p>
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileUpload(cat.key, e)}
                        accept={cat.accept}
                        className="hidden"
                        id={`file-${cat.key}`}
                      />
                      <label htmlFor={`file-${cat.key}`}>
                        <Button 
                          variant="outline" 
                          className="cursor-pointer"
                          disabled={uploadingCategory === cat.key}
                          asChild
                        >
                          <span>
                            {uploadingCategory === cat.key ? (
                              <>
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                上传中...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                上传文件
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>

                  {categoryFiles.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl">
                      <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-400">暂无文件</p>
                      <p className="text-sm text-slate-400 mt-1">点击上方按钮上传</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {categoryFiles.map(file => (
                        <div 
                          key={file.id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-500" />
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{file.name}</p>
                              <p className="text-xs text-slate-500">
                                {formatFileSize(file.size)} · {format(file.uploadedAt, 'yyyy-MM-dd HH:mm')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDownloadFile(file)}
                              className="h-8 w-8"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteFile(file.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Description */}
      {project.description && (
        <Card className="border-slate-200/60">
          <CardHeader>
            <CardTitle className="text-lg">项目介绍</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 whitespace-pre-wrap">{project.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
