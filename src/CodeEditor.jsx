import { useRef, useLayoutEffect } from 'react';
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { javascript, typescriptLanguage } from "@codemirror/lang-javascript";
import { markdown } from '@codemirror/lang-markdown';
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { oneDark } from '@codemirror/theme-one-dark';
import { json1Sync } from 'codemirror-ot';

// Keys are file ids
// Values are CodeMirror instances
const editorCache = new Map();


// Gets or creates a CodeMirror editor for the given file id.
const getOrCreateEditor = (fileId, shareDBDoc) => {

    const data = shareDBDoc.data;

    const fileExtension = data[fileId].name.split('.').pop();

    const extensions = [
        json1Sync({ shareDBDoc, path: [fileId, 'text'] }),
        basicSetup,
        oneDark
    ];

    if (fileExtension === 'js' || fileExtension === 'json' || fileExtension == 'jsx' || fileExtension == 'ts') {
        extensions.push(javascript())
    } else if (fileExtension === 'html') {
        extensions.push(html())
    } else if (fileExtension === 'css') {
        extensions.push(css())
    } else if (fileExtension === 'md') {
        extensions.push(markdown())
    }

    let editor = editorCache.get(fileId);
    if (!editor) {
        // Cache miss --> mint a new editor.
        editor = new EditorView({
            state: EditorState.create({
                doc: data[fileId].text,
                extensions
            }),
        });

        // Populate the cache.
        editorCache.set(fileId, editor);
        console.log('editorCache', editorCache)
    }
    return editor;
};

export const CodeEditor = ({
    activeFileId,
    shareDBDoc
}) => {
    const ref = useRef();

    // useEffect was buggy in that sometimes ref.current was undefined.
    // useLayoutEffect seems to solve that issue.
    useLayoutEffect(() => {
        const editor = getOrCreateEditor(activeFileId, shareDBDoc);
        ref.current.appendChild(editor.dom);

        return () => {
            // if (debug) {
            console.log('Switching to file ' + activeFileId);
            // }
            ref.current.removeChild(editor.dom);
        };
    }, [shareDBDoc, activeFileId]);

    return <div className="Editor" ref={ref} />;
};