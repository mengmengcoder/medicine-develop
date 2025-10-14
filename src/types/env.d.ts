/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_USE_MOCK: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_MAX_UPLOAD_SIZE: string
  readonly VITE_ENABLE_DEV_TOOLS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '3dmol' {
  export interface Viewer {
    clear(): void
    addModel(data: string, format: string): void
    setStyle(selection: any, style: any): void
    zoomTo(): void
    render(): void
  }
  
  export function createViewer(element: HTMLElement, config: any): Viewer
}

declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}