interface Env {
  VITE_EXAMPLE: string;
  VITE_DISABLE_SETTINGS: string;
  VITE_ENABLE_RIGHT_PANEL: string;
  VITE_ENABLE_IFRAME: string;
  VITE_DEBUG_FEATURE_FLAGS: string;
}

//declare global {
interface ImportMeta {
  env: Readonly<Partial<Env>>;
}
//}
