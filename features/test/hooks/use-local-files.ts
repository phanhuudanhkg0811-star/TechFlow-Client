// features/test/hooks/use-local-files.ts
"use client";
import { useEffect } from "react";
import { create } from "zustand";

export type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  content?: string;
};

// Cấu trúc file mặc định khi ứng viên mới vào phòng thi
const DEFAULT_FILES: FileNode[] = [
  // --- Root Files ---
  {
    id: "root-pkg",
    name: "package.json",
    type: "file",
    parentId: null,
    content: `{
  "name": "react-vite-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.0"
  }
}`,
  },
  {
    id: "root-html",
    name: "index.html",
    type: "file",
    parentId: null,
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  },
  {
    id: "root-vite-config",
    name: "vite.config.js",
    type: "file",
    parentId: null,
    content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  }
})`,
  },

  // --- src Folder ---
  { id: "dir-src", name: "src", type: "folder", parentId: null },
  {
    id: "file-main-jsx",
    name: "main.jsx",
    type: "file",
    parentId: "dir-src",
    content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
  },
  {
    id: "file-app-jsx",
    name: "App.jsx",
    type: "file",
    parentId: "dir-src",
    content: `import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      padding: '2rem', 
      textAlign: 'center',
      color: '#333' 
    }}>
      <h1>AI-TechFlow + React</h1>
      <p>Môi trường Vite đã sẵn sàng!</p>
      <div style={{ margin: '2rem' }}>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ 
            padding: '0.6em 1.2em', 
            fontSize: '1em', 
            cursor: 'pointer',
            borderRadius: '8px',
            border: '1px solid #646cff'
          }}
        >
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App`,
  },
];

const EMPTY_FILES: FileNode[] = [];

interface FileSystemStore {
  files: Record<string, FileNode[]>;
  isLoaded: Record<string, boolean>;
  init: (testId: string) => void;
  createNode: (
    testId: string,
    name: string,
    type: "file" | "folder",
    parentId: string | null,
  ) => string;
  renameNode: (testId: string, id: string, newName: string) => void;
  deleteNode: (testId: string, id: string) => void;
  updateContent: (testId: string, id: string, content: string) => void;
}

// 1. Khởi tạo Global Store quản lý File System
const useFileSystemStore = create<FileSystemStore>((set, get) => ({
  files: {},
  isLoaded: {},

  init: (testId) => {
    // Nếu đã load rồi thì bỏ qua để tránh re-render vô ích
    if (get().isLoaded[testId]) return;

    const saved = localStorage.getItem(`ide_files_${testId}`);
    let parsed = DEFAULT_FILES;
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch {}
    }
    set((state) => ({
      files: { ...state.files, [testId]: parsed },
      isLoaded: { ...state.isLoaded, [testId]: true },
    }));
  },

  createNode: (testId, name, type, parentId) => {
    const id = `node-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    set((state) => {
      const currentFiles = state.files[testId] || DEFAULT_FILES;
      const newFiles = [
        ...currentFiles,
        { id, name, type, parentId, content: "" },
      ];

      localStorage.setItem(`ide_files_${testId}`, JSON.stringify(newFiles));
      return { files: { ...state.files, [testId]: newFiles } };
    });
    return id;
  },

  renameNode: (testId, id, newName) => {
    set((state) => {
      const currentFiles = state.files[testId] || DEFAULT_FILES;
      const newFiles = currentFiles.map((f) =>
        f.id === id ? { ...f, name: newName } : f,
      );

      localStorage.setItem(`ide_files_${testId}`, JSON.stringify(newFiles));
      return { files: { ...state.files, [testId]: newFiles } };
    });
  },

  deleteNode: (testId, id) => {
    set((state) => {
      const currentFiles = state.files[testId] || DEFAULT_FILES;

      // Hàm đệ quy quét sạch thư mục con
      const getIdsToDelete = (
        nodeId: string,
        allFiles: FileNode[],
      ): string[] => {
        const children = allFiles.filter((f) => f.parentId === nodeId);
        return [
          nodeId,
          ...children.flatMap((c) => getIdsToDelete(c.id, allFiles)),
        ];
      };

      const idsToRemove = getIdsToDelete(id, currentFiles);
      const newFiles = currentFiles.filter((f) => !idsToRemove.includes(f.id));

      localStorage.setItem(`ide_files_${testId}`, JSON.stringify(newFiles));
      return { files: { ...state.files, [testId]: newFiles } };
    });
  },

  updateContent: (testId, id, content) => {
    set((state) => {
      const currentFiles = state.files[testId] || DEFAULT_FILES;
      const newFiles = currentFiles.map((f) =>
        f.id === id ? { ...f, content } : f,
      );

      localStorage.setItem(`ide_files_${testId}`, JSON.stringify(newFiles));
      return { files: { ...state.files, [testId]: newFiles } };
    });
  },
}));

// 2. Wrap Store lại thành Hook y như cũ để các Component xài không bị vỡ UI
export function useLocalFiles(testId: string) {
  // Lấy data từ Store, nếu chưa có thì trả về mảng rỗng tạm thời
  const files = useFileSystemStore(
    (state) => state.files[testId] || EMPTY_FILES,
  );
  const isLoaded = useFileSystemStore(
    (state) => state.isLoaded[testId] || false,
  );

  // Lấy các function không bị re-render
  const { init, createNode, renameNode, deleteNode, updateContent } =
    useFileSystemStore.getState();

  // Khởi tạo data khi vào phòng thi
  useEffect(() => {
    init(testId);
  }, [testId, init]);

  return {
    files,
    isLoaded,
    createNode: (
      name: string,
      type: "file" | "folder",
      parentId: string | null,
    ) => createNode(testId, name, type, parentId),
    renameNode: (id: string, newName: string) =>
      renameNode(testId, id, newName),
    deleteNode: (id: string) => deleteNode(testId, id),
    updateContent: (id: string, content: string) =>
      updateContent(testId, id, content),
  };
}
