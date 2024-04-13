import React, { useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import {
  FileId,
  ShareDBDoc,
  Username,
  VZCodeContent,
} from '../../types';
import { ThemeLabel, defaultTheme } from '../themes';
import {
  EditorCache,
  EditorCacheValue,
} from '../useEditorCache';
import { getOrCreateEditor } from './getOrCreateEditor';
import './style.scss';

export const CodeEditor = ({
  activeFileId,
  shareDBDoc,
  submitOperation,
  localPresence,
  docPresence,
  theme = defaultTheme,
  filesPath = ['files'],
  editorCache,
  editorWantsFocus,
  editorNoLongerWantsFocus,
  username,
  typeScriptWorker,
  aiAssistEndpoint,
  aiAssistOptions,
}: {
  activeFileId: FileId;
  shareDBDoc: ShareDBDoc<VZCodeContent> | null;
  submitOperation: (
    next: (content: VZCodeContent) => VZCodeContent,
  ) => void;
  localPresence?: any;
  docPresence?: any;
  theme?: ThemeLabel;
  filesPath?: string[];
  editorCache: EditorCache;
  editorWantsFocus: boolean;
  editorNoLongerWantsFocus: () => void;
  username: Username;
  aiAssistEndpoint?: string;
  aiAssistOptions?: {
    [key: string]: string;
  };
  typeScriptWorker: Worker;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const interactTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onInteract = useCallback(() => {
    if (!interactTimeoutRef.current) {
      submitOperation((document) => ({
        ...document,
        isInteracting: true,
      }));
    } else {
      clearTimeout(interactTimeoutRef.current);
    }

    interactTimeoutRef.current = setTimeout(() => {
      interactTimeoutRef.current = null;
      submitOperation(({ isInteracting, ...newDocument }) => newDocument);
    }, 800);
  }, [submitOperation]);

  const usernameRef = useRef<Username>(username);
  usernameRef.current = username;

  useLayoutEffect(() => {
    if (!ref.current || !shareDBDoc) return;

    ref.current.appendChild(editorCache.editor.dom);

    return () => {
      ref.current.removeChild(editorCache.editor.dom);
    };
  }, [shareDBDoc, editorCache]);

  useLayoutEffect(() => {
    if (editorWantsFocus) {
      editorCache.editor.focus();
      editorNoLongerWantsFocus();
    }
  }, [editorWantsFocus, editorCache, editorNoLongerWantsFocus]);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!editorCache.editor.view) return;

      const viewState = editorCache.editor.view.plugin(interactViewPlugin);
      if (!viewState?.dragging) return;

      const { rule, text } = viewState.target;
      const updateText = viewState.updateText(viewState.target);

      if (rule.onDrag) {
        rule.onDrag(text, updateText, e);
      }
    };

    const handleGlobalMouseUp = (e) => {
      if (!editorCache.editor.view) return;

      const viewState = editorCache.editor.view.plugin(interactViewPlugin);
      if (viewState) {
        viewState.endDrag();
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [editorCache]);

  return <div className="vz-code-editor" ref={ref}></div>;
};
