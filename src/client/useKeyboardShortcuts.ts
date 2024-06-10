import { useEffect } from 'react';
import { shouldTriggerRun } from './shouldTriggerRun';
import { EditorView } from 'codemirror';
import { syntaxTree } from "@codemirror/language";
import { SyntaxNode } from '@lezer/common';
import { EditorState, SelectionRange } from '@codemirror/state';

// Nesting types for the specific language
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
  'ImportGroup'
]);

// Definitions types for the specific language
const definitionTypes = new Set<string>([
  'VariableDeclaration',
  'VariableDefinition',
  'FunctionDeclaration',
  'Identifier',
  'PropertyDefinition',
  'ImportDeclaration',
  'ExportDeclaration',
  'ArrayPattern',
  'ObjectPattern',
  'ArgList',
  'TypeArgList',
  'ParamList',
  'MemberExpression',
  'NewExpression',
  'FunctionDefinition',
  'ClassDefinition',
  'TypeAlias',
  'NamespaceDefinition',
  'EnumDefinition',
]);

function getIdentifierLevel(identifier: SyntaxNode) {
  let current = identifier;
  let levels = 0;

  // Traverse up the tree to find the total depth
  while (current && current.type) {
    const parentType: string = current.type.name;

    if (nestingTypes.has(parentType)) {
      levels++;
    }

    current = current.parent;
  }

  return levels;
}

function jumpToDefinition(editor: EditorView) {
  // Use current editor state and selection range to find a potential variable
  const state: EditorState = editor.state;
  const location: SelectionRange = state.selection.main;

  // Fetch the current syntax node information using cursor position
  const identifier: SyntaxNode = syntaxTree(state).resolveInner(location.from, -1);
  const identifierName: string = state.doc.sliceString(identifier.from, identifier.to);
  const context: number = getIdentifierLevel(identifier);
  const definitions: Array<{identifier: SyntaxNode, level: number}> = [];

  if (identifier) {
    syntaxTree(state).iterate({
      enter(tree) {
        // Traverse syntax tree to find positions of respective identifier definitions within context
        if (definitionTypes.has(tree.name) || nestingTypes.has(tree.name)) {
          const identifier: SyntaxNode = tree.node;

          definitionTypes.forEach((definition: string) => {
            const identifierChild: SyntaxNode = identifier.getChild(definition);

            if (identifierChild && state.doc.sliceString(identifierChild.from, identifierChild.to) === identifierName) {
              const currentContext = getIdentifierLevel(identifier);
              definitions.push({ identifier: identifier, level: currentContext });
            }
          });

          
        }
      }
    });

    if (definitions.length > 0) {
      // Sort definitions by their level to find the closest based on current context
      definitions.sort((a, b) => a.level - b.level);

      let closestDefinition: SyntaxNode = definitions[0].identifier;
        
      for (let i = definitions.length - 1; i >= 0; i--) {
        if (definitions[i].level <= context) {
          closestDefinition = definitions[i].identifier;
          break;
        }
      }

      // Set the cursor position to the valid declaration in current scope
      editor.dispatch({
        selection: { anchor: closestDefinition.from, head: closestDefinition.to },
        scrollIntoView: true,
        effects: EditorView.scrollIntoView(closestDefinition.from, {
          y: "center"
        })
      });
    }
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
        const editor: EditorView = editorCache.get(activeFileId).editor;
        const jumpToDefinitionHandler = () => { jumpToDefinition(editor); };

        // CTRL + Click: Jump to relative definition
        document.addEventListener("mousedown", jumpToDefinitionHandler, { once: true });
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
