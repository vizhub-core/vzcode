import { ViewPlugin, EditorView, WidgetType } from '@codemirror/view';
import { Annotation, RangeSet } from '@codemirror/state';
import { randomId } from './randomId';

// Deals with receiving the broadcas from other clients and displaying them.
//
// Inspired by
//  * https://github.com/yjs/y-codemirror.next/blob/main/src/y-remote-selections.js
//  * https://codemirror.net/examples/decoration/
//  * https://github.com/share/sharedb/blob/master/examples/rich-text-presence/client.js
export const json1PresenceDisplay = ({ path, docPresence }) => [
  ViewPlugin.fromClass(
    class {
      constructor(view) {
        //this.decorations = [];
        docPresence.on('receive', (id, presence) => {
          //console.log('received presence');
          //console.log(JSON.stringify({ id, presence }));
          view.dispatch({ annotations: [presenceAnnotation.of(true)] });
        });

        this.decorations = RangeSet.of([]);
      }

      update(update) {
        // Figure out if this update is from a change in presence.
        //let isPresenceUpdate = false;
        //for (const tr of update.transactions) {
        //  if (tr.annotation(presenceAnnotation)) {
        //    isPresenceUpdate = true;
        //    break;
        //  }
        //}
        const isPresenceUpdate = update.transactions.some((tr) =>
          tr.annotation(presenceAnnotation)
        );
        console.log(isPresenceUpdate);
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  ),
  presenceTheme,
];

const presenceAnnotation = Annotation.define();

// Displays a single remote presence cursor.
class PresenceWidget extends WidgetType {
  constructor() {
    super();
    // TODO use the actual user presence ids
    this.id = randomId();
  }

  eq(other) {
    return other.id === this.id;
  }

  toDOM() {
    const span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    span.className = 'cm-json1-presence';
    return span;
  }

  ignoreEvent() {
    return false;
  }
}

const presenceTheme = EditorView.baseTheme({
  '.cm-json1-presence': {
    position: 'relative',
    borderLeft: '1px solid black',
    borderRight: '1px solid black',
    marginLeft: '-1px',
    marginRight: '-1px',
    boxSizing: 'border-box',
    display: 'inline',
  },
});
