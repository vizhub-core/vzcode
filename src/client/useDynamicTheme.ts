import { useEffect, useRef } from 'react';
import { EditorCache } from './useEditorCache';
import { ThemeLabel, themeOptionsByLabel } from './themes';

export const useDynamicTheme = (
  editorCache: EditorCache,
  theme: ThemeLabel,
) => {
  const isFirstRun = useRef(true);
  useEffect(() => {
    // Skip the first run, since the theme is already initialized.
    if (isFirstRun.current) {
      isFirstRun.current = false;
    } else {
      // When the user changes the theme, update the theme of all editors.
      for (const editorCacheValue of Array.from(editorCache.values())) {
        const { editor, themeCompartment } = editorCacheValue;
        editor.dispatch({
          effects: themeCompartment.reconfigure([
            themeOptionsByLabel[theme].value,
          ]),
        });
      }
    }
  }, [theme, editorCache]);
};
