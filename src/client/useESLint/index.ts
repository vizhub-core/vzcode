import { useState, useEffect, useCallback } from 'react';
import { EditorView } from '@codemirror/view';
import { Diagnostic } from '@codemirror/lint';
// @ts-ignore - Worker import
import ESLintWorker from './worker?worker';
import { enableESLint } from '../../server/featureFlags';
import { fileNameStateField } from '../CodeEditor/getOrCreateEditor';

let requestCounter = 0;
const pendingRequests = new Map();

export const useESLint = () => {
  const [worker] = useState(() => new ESLintWorker());
  
  useEffect(() => {
    const handleMessage = (event) => {
      const { diagnostics, requestId, error } = event.data;
      
      if (error) {
        console.error('[ESLint] Error:', error);
      }
      
      const resolve = pendingRequests.get(requestId);
      if (resolve) {
        resolve(diagnostics);
        pendingRequests.delete(requestId);
      }
    };
    
    worker.addEventListener('message', handleMessage);
    
    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.terminate();
    };
  }, [worker]);
  
  const esLintSource = useCallback(
    async (view: EditorView): Promise<readonly Diagnostic[]> => {
      if (!enableESLint) return [];

      // Retrieve the file name from the editor's state
      const fileName = view.state.field(fileNameStateField);
      
      try {
        const code = view.state.doc.toString();
        const requestId = requestCounter++;
        
        return new Promise<Diagnostic[]>((resolve) => {
          pendingRequests.set(requestId, resolve);
          worker.postMessage({ code, requestId, fileName });
        });
      } catch (e) {
        console.error('[ESLint] Error in linter:', e);
        return [];
      }
    },
    [worker]
  );
  
  return { esLintSource };
};