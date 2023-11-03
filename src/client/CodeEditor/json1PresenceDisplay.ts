import {
  ViewPlugin,
  EditorView,
  WidgetType,
  Decoration,
} from '@codemirror/view';
import { Annotation, RangeSet } from '@codemirror/state';
import ColorHash from 'color-hash';


// Deals with receiving the broadcasted presence cursor locations
// from other clients and displaying them.
//
// Inspired by
//  * https://github.com/yjs/y-codemirror.next/blob/main/src/y-remote-selections.js
//  * https://codemirror.net/examples/decoration/
//  * https://github.com/share/sharedb/blob/master/examples/rich-text-presence/client.js
//  * https://share.github.io/sharedb/presence
export const json1PresenceDisplay = ({
  path,
  docPresence,
}) => [
  ViewPlugin.fromClass(
    class {
      // The decorations to display.
      // This is a RangeSet of Decoration objects.
      // See https://codemirror.net/6/docs/ref/#view.Decoration
      decorations: RangeSet<Decoration>;

      constructor(view: EditorView) {
        // Initialize decorations to empty array so CodeMirror doesn't crash.
        this.decorations = RangeSet.of([]);

        // Mutable state local to this closure representing aggregated presence.
        //  * Keys are presence ids
        //  * Values are presence objects as defined by ot-json1-presence
        const presenceState = {};

        // Receive remote presence changes.
        docPresence.on('receive', (id, presence) => {
          // If presence === null, the user has disconnected / exited
          // We also check if the presence is for the current file or not.
          if (presence && pathMatches(path, presence)) {
            presenceState[id] = presence;
          } else {
            delete presenceState[id];
          }
          // Update decorations to reflect new presence state.
          // TODO consider mutating this rather than recomputing it on each change.
          this.decorations = Decoration.set(
            Object.keys(presenceState).map((id) => {
              const presence = presenceState[id];
              const { start, end } = presence;
              const from = start[start.length - 1];
              // TODO support selection ranges (first attempt introduced layout errors)
              const to = end[end.length - 1];
              const userColor = new ColorHash().rgb(id);

              if (from === to) {
                return {
                  from,
                  to,
                  value: Decoration.widget({
                    side: -1,
                    block: false,
                    widget: new PresenceWidget(id, userColor),
                  }),
                };
              } else {
                return {
                  from,
                  to,
                  value: Decoration.mark({
                    class: 'cm-json1-presence',
                    attributes: {
                      style: `
                        background-color: rgba(${userColor}, 0.75);
                        `,
                    },
                  }),
                };
              }
            }),
            // Without this argument, we get the following error:
            // Uncaught Error: Ranges must be added sorted by `from` position and `startSide`
            true,
          );

          // Somehow this triggers re-rendering of the Decorations.
          // Not sure if this is the correct usage of the API.
          // Inspired by https://github.com/yjs/y-codemirror.next/blob/main/src/y-remote-selections.js
          // Set timeout so that the current CodeMirror update finishes
          // before the next ones that render presence begin.
          setTimeout(() => {
            view.dispatch({
              annotations: [presenceAnnotation.of(true)],
            });
          }, 0);
        });
      }
    },
    {
      decorations: (v) => v.decorations,
    },
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
  id: string;
  color: string;
  constructor(id: string, color: string) {
    super();
    this.id = id;
    this.color = color;
  }

  eq(other: PresenceWidget) {
    return other.id === this.id;
  }

  toDOM() {
    const span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    span.className = 'cm-json1-presence';
    console.log('span', span);
    // This child is what actually displays the presence.
    // Nested so that the layout is not impacted.
    //
    // The initial attempt using the top level span to render
    // the cursor caused a wonky layout with adjacent characters shifting
    // left and right by 1 pixel or so.
    const div = document.createElement('div');
    span.appendChild(div);
    div.style.borderLeft = `1px solid rgba(${this.color})`;
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
    borderLeft: '1px solid rgba(${widget.color})',
  },
});
