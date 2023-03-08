import { EditorView } from 'codemirror';

// Deals with broadcasting changes in cursor location and selection.
export const json1PresenceBroadcast = ({ path, localPresence }) =>
  // See https://discuss.codemirror.net/t/codemirror-6-proper-way-to-listen-for-changes/2395/10
  EditorView.updateListener.of((viewUpdate) => {
    // If this update modified the cursor / selection,
    // we broadcast the selection update via ShareDB presence.
    if (viewUpdate.selectionSet) {
      // Isolate the single selection to use for presence.
      // Unfortunately JSON1 with presence does not yet
      // support multiple selections.
      // See https://github.com/ottypes/json1/pull/25#issuecomment-1459616521
      const selection = viewUpdate.state.selection.ranges[0];
      const { from, to } = selection;

      // Translate this into the form expected by json1Presence.
      const presence = { start: [...path, from], end: [...path, to] };

      // Broadcast presence to remote clients!
      // See https://github.com/share/sharedb/blob/master/examples/rich-text-presence/client.js#L71
      localPresence.submit(presence, (error) => {
        if (error) throw error;
      });
    }
  });
