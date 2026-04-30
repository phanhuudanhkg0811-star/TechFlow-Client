import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

export const getWebContainer = async () => {
  if (webcontainerInstance) return webcontainerInstance;

  if (!bootPromise) {
    // Chỉ gọi .boot() 1 lần duy nhất trong toàn bộ app
    bootPromise = WebContainer.boot().then((instance) => {
      webcontainerInstance = instance;
      return instance;
    });
  }
  
  return bootPromise;
};