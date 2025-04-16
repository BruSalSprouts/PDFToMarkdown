export interface IElectronAPI {
  fileSystem: {
    openFile: () => Promise<{ name: string; path: string; data: string }>;
    saveFile: (options: { content: string; defaultPath: string; filters: { name: string; extensions: string[] }[] }) => Promise<boolean>;
  };
  windowControls: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
  };
  screenCapture: {
    getSources: () => Promise<Array<{ id: string; name: string; thumbnail: string }>>;
    captureScreen: (sourceId: string) => Promise<string>;
    captureScreenArea: (bounds: { x: number; y: number; width: number; height: number }) => Promise<string>;
  };
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}