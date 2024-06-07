import { useEffect } from 'react';
import { shouldTriggerRun } from './shouldTriggerRun';
import { EditorView } from 'codemirror';
import { syntaxTree } from "@codemirror/language";

function jumpToDef(editor : EditorView) {
  let found = false;

  const state = editor.state;
  const location = state.selection.main;

  // Fetch the current token or syntax node information at current cursor position
  const token = syntaxTree(state).resolveInner(location.from, 1);
  const tokenName = state.doc.sliceString(token.from, token.to);

  // Valid non-null and non-empty token name
  if (tokenName) {
    syntaxTree(state).iterate({
        enter(tree) {
            // Traverse syntax tree in attempt to find position of variable definition with current scope
            if (!(found) && ((tree.name === 'FunctionDeclaration' || tree.name === 'VariableDeclaration'))) {
                const node = tree.node;
                const identifier = node.getChild('VariableDefinition') || node.getChild('Identifier');

                if (identifier && state.doc.sliceString(identifier.from, identifier.to) === tokenName) {
                  // Set the cursor position to the valid declaration in current scope and center the line, if possible
                  found = true;

                  editor.dispatch({
                      selection: { anchor: identifier.from, head: identifier.to },
                      scrollIntoView: true,
                      effects: EditorView.scrollIntoView(identifier.from, {
                        y: "center"
                      })
                  });
                }
            }
        }
    });
  }
}

// This module implements the keyboard shortcuts
// for the VZCode editor.
// These include:
// * Alt-w: Close the current tab
// * Alt-n: Open the create file modal
// * Alt-PageUp: Change the active tab to the previous one
// * Alt-PageDown: Change the active tab to the next one
// * Ctrl-s or Shift-Enter: Run the code and format it with Prettier
export const useKeyboardShortcuts = ({
  closeTabs,
  activeFileId,
  handleOpenCreateFileModal,
  setActiveFileLeft,
  setActiveFileRight,
  runPrettierRef,
  runCodeRef,
  editorCache
}) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (shouldTriggerRun(event)) {
        event.preventDefault();

        // Run Prettier
        const runPrettier = runPrettierRef.current;
        if (runPrettier !== null) {
          runPrettier();
        }

        // Run the code
        const runCode = runCodeRef.current;
        if (runCode !== null) {
          runCode();
        }
        return;
      }
      
      if (event.ctrlKey) {
        // Basic jumpToDef() setup for testing
        const editor: EditorView = editorCache.get(activeFileId).editor;
        const handler = ()=> {jumpToDef(editor); };
        document.addEventListener("mousedown", handler);
        setTimeout(()=> {
          document.removeEventListener("mousedown", handler);
        }, 2000);
      }

      if (event.altKey === true) {
        // Alt-w: Close the current tab
        if (event.key === 'w') {
          // TODO clean this up so we can remove `activeFileId`
          // as a dependency
          // TODO closeActiveTab()
          closeTabs([activeFileId]);
          return;
        }

        // Alt-n: Open the create file modal
        if (event.key === 'n') {
          handleOpenCreateFileModal();
          return;
        }

        // Alt-PageUp: Change the active tab to the previous one
        if (event.key === 'PageUp') {
          setActiveFileLeft();
          return;
        }

        // Alt-PageDown: Change the active tab to the next one
        if (event.key === 'PageDown') {
          setActiveFileRight();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyPress,
      );
    };
  }, [
    handleOpenCreateFileModal,
    closeTabs,
    activeFileId,
    setActiveFileLeft,
    setActiveFileRight,
  ]);
};
