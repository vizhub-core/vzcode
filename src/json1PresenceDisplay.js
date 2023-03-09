import {
  ViewPlugin,
  EditorView,
  WidgetType,
  Decoration,
} from '@codemirror/view';
import { Annotation, RangeSet } from '@codemirror/state';
import { randomId } from './randomId';

// Deals with receiving the broadcas from other clients and displaying them.
//
// Inspired by
//  * https://github.com/yjs/y-codemirror.next/blob/main/src/y-remote-selections.js
//  * https://codemirror.net/examples/decoration/
//  * https://github.com/share/sharedb/blob/master/examples/rich-text-presence/client.js
//  * https://share.github.io/sharedb/presence
export const json1PresenceDisplay = ({ path, docPresence }) => [
  ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.decorations = RangeSet.of([]);

        this.presenceState = {};

        // Receive remote presence changes.
        docPresence.on('receive', (id, presence) => {
          if (pathMatches(path, presence)) {
            if (presence) {
              this.presenceState[id] = presence;
            } else {
              delete this.presenceState[id];
            }
            view.dispatch({ annotations: [presenceAnnotation.of(true)] });
          }
        });
      }

      update(update) {
        // Figure out if this update is from a change in presence.
        const isPresenceUpdate = update.transactions.some((tr) =>
          tr.annotation(presenceAnnotation)
        );
        if (isPresenceUpdate) {
          this.decorations = Decoration.set(
            Object.keys(this.presenceState).map((id) => {
              const presence = this.presenceState[id];
              const { start, end } = presence;
              const from = start[start.length - 1];
              // TODO support selection ranges (first attempt introduced layout errors)
              //const to = end[end.length - 1];
              return {
                from,
                //to,
                to: from, // Temporary meaure
                value: Decoration.widget({
                  side: -1,
                  block: false,
                  widget: new PresenceWidget(id),
                }),
              };
            }),
            true
          );
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  ),
  presenceTheme,
];

const presenceAnnotation = Annotation.define();

// Checks that the path of this file
// matches the path of the presence.
//  * If true is returned, the presence is in this file.
//  * If false is returned, the presence is in another file.
// Assumption: start and end path are the same except the cursor position.
const pathMatches = (path, presence) => {
  for (let i = 0; i < path.length; i++) {
    if (path[i] !== presence.start[i]) {
      return false;
    }
  }
  return true;
};

// Displays a single remote presence cursor.
class PresenceWidget extends WidgetType {
  constructor(id) {
    super();
    this.id = id;
  }

  eq(other) {
    return other.id === this.id;
  }

  toDOM() {
    const span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    span.className = 'cm-json1-presence';
    span.appendChild(document.createElement('div'));
    return span;
  }

  ignoreEvent() {
    return false;
  }
}

const presenceTheme = EditorView.baseTheme({
  '.cm-json1-presence': {
    position: 'relative',
  },
  '.cm-json1-presence > div': {
    position: 'absolute',
    top: '0',
    bottom: '0',
    left: '0',
    right: '0',
    borderLeft: '1px solid yellow',
    //borderRight: '1px solid black',
  },
});
