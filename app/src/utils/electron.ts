// Electron API 封装
// 提供与桌面应用交互的功能

// 检测是否在Electron环境中
export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).electronAPI;
};

// 打开外部链接
export const openExternalLink = async (url: string): Promise<void> => {
  if (isElectron()) {
    try {
      const result = await (window as any).electronAPI.openExternalLink(url);
      if (!result.success) {
        console.error('Failed to open link:', result.error);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error opening external link:', error);
      window.open(url, '_blank');
    }
  } else {
    window.open(url, '_blank');
  }
};

// 获取应用版本
export const getAppVersion = async (): Promise<string> => {
  if (isElectron()) {
    try {
      return await (window as any).electronAPI.getAppVersion();
    } catch (error) {
      console.error('Error getting app version:', error);
      return '1.0.0';
    }
  }
  return '1.0.0 (Web)';
};

// 获取应用数据路径
export const getAppDataPath = async (): Promise<string> => {
  if (isElectron()) {
    try {
      return await (window as any).electronAPI.getAppDataPath();
    } catch (error) {
      console.error('Error getting app data path:', error);
      return '';
    }
  }
  return '';
};

// 显示打开文件对话框
export const showOpenDialog = async (options?: {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: { name: string; extensions: string[] }[];
  properties?: string[];
}): Promise<{ canceled: boolean; filePaths: string[] }> => {
  if (isElectron()) {
    return await (window as any).electronAPI.showOpenDialog(options);
  }
  // Web环境：使用原生的文件选择
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    if (options?.filters) {
      const accept = options.filters
        .flatMap(f => f.extensions.map(e => `.${e}`))
        .join(',');
      input.accept = accept;
    }
    input.onchange = () => {
      const files = input.files;
      if (files && files.length > 0) {
        resolve({
          canceled: false,
          filePaths: Array.from(files).map(f => f.name)
        });
      } else {
        resolve({ canceled: true, filePaths: [] });
      }
    };
    input.click();
  });
};

// 显示保存文件对话框
export const showSaveDialog = async (options?: {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: { name: string; extensions: string[] }[];
}): Promise<{ canceled: boolean; filePath?: string }> => {
  if (isElectron()) {
    return await (window as any).electronAPI.showSaveDialog(options);
  }
  // Web环境：直接返回
  return { canceled: true };
};

// 读取文件（返回base64）
export const readFile = async (filePath: string): Promise<{ success: boolean; data?: string; error?: string }> => {
  if (isElectron()) {
    return await (window as any).electronAPI.readFile(filePath);
  }
  return { success: false, error: 'Not in Electron environment' };
};

// 写入文件（data为base64）
export const writeFile = async (filePath: string, data: string): Promise<{ success: boolean; error?: string }> => {
  if (isElectron()) {
    return await (window as any).electronAPI.writeFile(filePath, data);
  }
  return { success: false, error: 'Not in Electron environment' };
};

// 检查文件是否存在
export const fileExists = async (filePath: string): Promise<boolean> => {
  if (isElectron()) {
    const result = await (window as any).electronAPI.fileExists(filePath);
    return result.exists;
  }
  return false;
};

// 创建目录
export const createDirectory = async (dirPath: string): Promise<{ success: boolean; error?: string }> => {
  if (isElectron()) {
    return await (window as any).electronAPI.createDirectory(dirPath);
  }
  return { success: false, error: 'Not in Electron environment' };
};
