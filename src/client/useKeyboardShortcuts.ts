import { useContext, useEffect } from 'react';
import { shouldTriggerRun } from './shouldTriggerRun';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNode, SyntaxNodeRef } from '@lezer/common';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { FileId, PaneId } from '../types';
import { editorCacheKey } from './useEditorCache';

/*
  The following is a helpful resource for the following Code Mirror Syntax Tree methods below
  https://lezer.codemirror.net/docs/ref/#common
*/

// Store the element in the current editor DOM to highlight, indicating a potential jump to definition is possible
let activeJumpingElement: HTMLSpanElement = null;

// Store the syntax node representing the destination within the syntax tree
let definingNode: SyntaxNode = null;

// Example nesting types for the specific language to find level in the syntax tree
const nestingTypes = new Set<string>([
  'FunctionDeclaration',
  'ClassDeclaration',
  'MethodDeclaration',
  'Block',
  'IfStatement',
  'ForStatement',
  'WhileStatement',
  'SwitchStatement',
  'TryStatement',
  'CatchClause',
  'WithStatement',
  'ArrowFunction',
  'ImportGroup',
]);

// Example declaration types for the specific language to find definitions in the syntax tree
const declarationTypes = new Set<string>([
  'VariableDeclaration',
  'FunctionDeclaration',
  'ClassDeclaration',
  'MethodDeclaration',
  'PropertyDeclaration',
  'ImportDeclaration',
  'ExportDeclaration',
  'CallExpression',
  'ArrayPattern',
  'ObjectPattern',
  'PatternProperty',
  'ArgList',
  'TypeArgList',
  'ParamList',
  'ForOfSpec',
]);

function getIdentifierContext(identifier: SyntaxNode): number {
  let current: SyntaxNode = identifier;
  let levels: number = 0;

  // Traverse up the tree to find the total depth, only counting valid nesting types
  while (current && current.type) {
    const parentType: string = current.type.name;

    if (nestingTypes.has(parentType)) {
      levels++;
    }

    current = current.parent;
  }

  return levels;
}

function jumpToDefinition(editor: EditorView, node: SyntaxNode): SyntaxNode {
  const state: EditorState = editor.state;
  const definitions: Array<{ identifier: SyntaxNode; context: number }> = [];

  // From an identifier in the syntax tree, fetch the name and context to find closest defining syntax node
  const identifier: SyntaxNode = node;
  const identifierName: string = state.doc.sliceString(identifier.from, identifier.to);
  const context: number = getIdentifierContext(identifier);

  if (identifier) {
    syntaxTree(state).iterate({
      enter(tree: SyntaxNodeRef) {
        // Traverse syntax tree to find positions of respective identifier definitions within context
        if (declarationTypes.has(tree.name) || nestingTypes.has(tree.name)) {
          const parent: SyntaxNode = tree.node;

          // Fetch a host of potential identifiers in an attempt to find the defining syntax node
          const children: Array<SyntaxNode> = [
            ...parent.getChildren('VariableDefinition'),
            ...parent.getChildren('PropertyDefinition'),
            ...parent.getChildren('PropertyName'),
            ...parent.getChildren('Identifier'),
          ];

          children.forEach((child: SyntaxNode) => {
            const name: string = state.doc.sliceString(child.from, child.to);

            // Ensure no jump to self by comparing syntax node id's
            if (name === identifierName && child.type.id !== identifier.type.id) {
              definitions.push({
                identifier: child,
                context: getIdentifierContext(child),
              });
            }
          });
        }
      },
    });

    if (definitions.length > 0) {
      // Sort definitions by their context in the syntax tree
      definitions.sort((a, b) => a.context - b.context);

      let closestDefinition: SyntaxNode = definitions[0].identifier;

      for (let i = definitions.length - 1; i >= 0; i--) {
        if (definitions[i].context <= context) {
          closestDefinition = definitions[i].identifier;
          break;
        }
      }

      return closestDefinition;
    }

    return null;
  }
}

// Sidebar keyboard shortcuts in form Ctrl + Shift + <key>
const sideBarKeyBoardMap = {
  E: 'files-icon',
  F: 'search-icon',
  K: 'shortcut-icon',
  B: 'bug-icon',
  S: 'settings-icon',
  N: 'new-file-icon',
  D: 'new-directory-icon',
  A: 'auto-focus-icon',
};

// This module implements the keyboard shortcuts
// for the VZCode editor.
// These include:
// * Alt-w: Close the current tab
// * Alt-n: Open the create file modal
// * Alt-PageUp: Change the active tab to the previous one
// * Alt-PageDown: Change the active tab to the next one
// * Ctrl-s or Shift-Enter: Run the code and format it with Prettier
// * Ctrl-Click: Jump to closest definition for a potential identifier
// * Ctrl-1: Focus on editor
// * Ctrl-2: Focus on sidebar
export const useKeyboardShortcuts = ({
  closeTabs,
  activeFileId,
  activePaneId,
  handleOpenCreateFileModal,
  setActiveFileLeft,
  setActiveFileRight,
  toggleSearchFocused,
  runPrettierRef,
  runCodeRef,
  sidebarRef,
  editorCache,
  codeEditorRef,
}: {
  closeTabs: (fileIds: FileId[]) => void;
  activeFileId: FileId | null;
  activePaneId: PaneId;
  handleOpenCreateFileModal: () => void;
  setActiveFileLeft: () => void;
  setActiveFileRight: () => void;
  toggleSearchFocused: () => void;
  runPrettierRef: React.MutableRefObject<() => void>;
  runCodeRef: React.MutableRefObject<() => void>;
  sidebarRef: React.RefObject<HTMLDivElement>;
  editorCache: Map<string, { editor: EditorView }>;
  codeEditorRef: React.RefObject<HTMLDivElement>;
}) => {
  useEffect(() => {
    const cacheKey = editorCacheKey(activeFileId, activePaneId);

    // Handle key press events
    const handleKeyPress = (event: KeyboardEvent) => {
      if (shouldTriggerRun(event)) {
        event.preventDefault();
        const runPrettier = runPrettierRef.current;
        const runCode = runCodeRef.current;
        runPrettier?.();
        runCode?.();
        return;
      }

      // Handle sidebar shortcuts (Ctrl+Shift+<key>)
      if (event.ctrlKey && event.shiftKey) {
        document.getElementById(sideBarKeyBoardMap[event.key])?.click();
        if (event.key === 'F') {
          toggleSearchFocused();
        }
      }

      if (event.ctrlKey) {
        if (event.key === '2') {
          if (codeEditorRef.current) {
            event.preventDefault();
            const editor = editorCache.get(cacheKey)?.editor;
            if (editor) {
              editor.focus();
              console.log('Focused on the code editor');
            }
          }
        }
        if (event.key === '1') {
          if (sidebarRef.current) {
            sidebarRef.current.focus();
            console.log('Focused on the sidebar');
            event.preventDefault();
          }
        }
      }

      if (event.ctrlKey === true) {
        // On holding CTRL key, search for a potential definition jump using mouse location
        document.addEventListener('mouseover', handleMouseOver);
      }

      if (event.altKey === true) {
        // Alt-w: Close the current tab
        if (event.key === 'w') {
          if (activeFileId) {
            closeTabs([activeFileId]);
          }
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

          if (event.key === '2') {
            if (codeEditorRef.current) {
              event.preventDefault();
              const editor = editorCache.get(cacheKey)?.editor;
              if (editor) {
                editor.focus();
                console.log('Focused on the code editor');
              }
            }
          }
          if (event.key === '1') {
            if (sidebarRef.current) {
              sidebarRef.current.focus();
              console.log('Focused on the sidebar');
              event.preventDefault();
            }
          }
        }
      };

    const resetActiveJumpingElement = (): void => {
      if (activeJumpingElement) {
        activeJumpingElement.style.cursor = 'initial';
        activeJumpingElement.style.textDecoration = 'none';
        activeJumpingElement = definingNode = null;
      }

      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mousedown', jumpToDefinitionHandler);
    };

    const jumpToDefinitionHandler = (event: MouseEvent): void => {
      if (!definingNode || event.target !== activeJumpingElement) return;
      if (!activeFileId) return;

      const editor = editorCache.get(cacheKey).editor;
      const closestDefinition = definingNode;

      editor.dispatch({
        selection: { anchor: closestDefinition.from, head: closestDefinition.to },
        scrollIntoView: true,
        effects: EditorView.scrollIntoView(closestDefinition.from, { y: 'center' }),
      });
      resetActiveJumpingElement();
    };

    const handleMouseOver = (event: MouseEvent) => {
      if (!activeFileId) return;
      const editor = editorCache.get(cacheKey).editor;
      const tree = syntaxTree(editor.state);
      const element = event.target as HTMLSpanElement;
      if (!element || !editor.dom.contains(element)) return;

      const position = editor.posAtDOM(element);
      const identifier = tree.resolveInner(position, 1);
      if (identifier && element instanceof HTMLSpanElement) {
        const potentialJump = jumpToDefinition(editor, identifier);
        if (potentialJump && identifier.type.id !== potentialJump.type.id) {
          if (activeJumpingElement) {
            activeJumpingElement.style.cursor = 'initial';
            activeJumpingElement.style.textDecoration = 'none';
          }

          activeJumpingElement = element;
          definingNode = potentialJump;
          activeJumpingElement.style.cursor = 'pointer';
          activeJumpingElement.style.textDecoration = 'underline';

          document.addEventListener('mousedown', jumpToDefinitionHandler, { once: true });
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', resetActiveJumpingElement); // Fixed issue with 'handleKeyRelease'

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('keyup', resetActiveJumpingElement);
    };
  }, [
    handleOpenCreateFileModal,
    closeTabs,
    activeFileId,
    setActiveFileLeft,
    setActiveFileRight,
  ]);
};
