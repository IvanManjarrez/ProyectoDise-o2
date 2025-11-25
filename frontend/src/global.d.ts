declare module '*.css'
declare module 'axios'
declare module 'react'
declare module 'react-dom'
declare module 'react-router-dom'
declare module '@google/model-viewer'
declare module 'node-fetch'

interface ImportMetaEnv {
  VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
}
