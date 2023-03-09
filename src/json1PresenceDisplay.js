import { ViewPlugin } from '@codemirror/view';

// Deals with receiving the broadcas from other clients and displaying them.
//
// Inspired by
//  * https://github.com/yjs/y-codemirror.next/blob/main/src/y-remote-selections.js
//  * https://codemirror.net/examples/decoration/
//  * https://github.com/share/sharedb/blob/master/examples/rich-text-presence/client.js
export const json1PresenceDisplay = ({ path, docPresence }) =>
  ViewPlugin.fromClass(
    class {
      constructor(view) {
        //this.decorations = [];
        docPresence.on('receive', (id, presence) => {
          console.log('received presence ' + JSON.stringify(presence));
        });
      }

      //update(update) {}
    },
    {
      //decorations: (v) => v.decorations,
    }
  );
