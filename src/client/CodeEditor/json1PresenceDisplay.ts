import {
  ViewPlugin,
  EditorView,
  WidgetType,
  Decoration,
} from '@codemirror/view';
import { Annotation, RangeSet } from '@codemirror/state';
import { assignUserColor } from '../presenceColor';
import {
  Presence,
  PresenceId,
  Username,
} from '../../types';

const DEBUG = false;

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
  enableAutoFollowRef,
}: {
  path: Array<string>;
  docPresence: any;
  enableAutoFollowRef: React.MutableRefObject<boolean>;
}) => [
  ViewPlugin.fromClass(
    class {
      // The decorations to display.
      // This is a RangeSet of Decoration objects.
      // See https://codemirror.net/6/docs/ref/#view.Decoration
      decorations: RangeSet<Decoration>;

      //Added variable for cursor position
      cursorPosition = {};

      constructor(view: EditorView) {
        // Initialize decorations to empty array so CodeMirror doesn't crash.
        this.decorations = RangeSet.of([]);

        // Mutable state local to this closure representing aggregated presence.
        //  * Keys are presence ids
        //  * Values are presence objects as defined by ot-json1-presence
        const presenceState: Record<PresenceId, Presence> =
          {};

        // Add the scroll event listener
        //This runs for the arrow key scrolling, it should result in the users scrolling to eachother's location.
        // view.dom.addEventListener('scroll', () => {
        //   this.scrollToCursor(view);
        // });
        // Receive remote presence changes.
        // Receive remote presence changes.
        docPresence.on(
          'receive',
          (id: PresenceId, presence: Presence) => {
            if (DEBUG) {
              console.log(
                `Received presence for id ${id}`,
                presence,
              );
            }

            // If presence is null, the user has disconnected.
            // We must remove them from our local state.
            if (!presence) {
              delete presenceState[id];
              // Also remove their cursor position to prevent errors.
              delete this.cursorPosition[id];
            } else {
              // Otherwise, the user is active. Check if the presence
              // is for the current file.
              const isPresenceInCurrentFile = pathMatches(
                path,
                presence,
              );

              // If it's the current file, add/update their state.
              if (isPresenceInCurrentFile) {
                presenceState[id] = presence;
              } else {
                // If it's for another file, remove them from this view's state.
                delete presenceState[id];
                delete this.cursorPosition[id];
              }
            }

            const presenceDecorations = [];

            for (const id of Object.keys(presenceState)) {
              const presence: Presence = presenceState[id];
              const { start, end } = presence;
              const from = +start[start.length - 1];
              const to = +end[end.length - 1];
              const userColor = assignUserColor(
                presence.username,
              );
              const { username } = presence;

              presenceDecorations.push({
                from,
                to: from,
                value: Decoration.widget({
                  side: -1,
                  block: false,
                  widget: new PresenceWidget(
                    '' + Math.random(),
                    userColor,
                    username,
                  ),
                }),
              });

              if (from !== to) {
                presenceDecorations.push({
                  from,
                  to,
                  value: Decoration.mark({
                    class: 'cm-json1-presence',
                    attributes: {
                      style: `
                      background-color: rgba(${userColor}, 0.75);
                      mix-blend-mode: luminosity;
                      `,
                    },
                  }),
                });
              }
              if (view.state.doc.length >= from) {
                this.cursorPosition[id] = from;
              } else {
                // The cursor position is invalid, so remove it.
                delete this.cursorPosition[id];
              }
            }

            this.decorations = Decoration.set(
              presenceDecorations,
              true,
            );

            // This dispatch triggers the re-rendering of decorations.
            // It now correctly runs after a deletion.
            setTimeout(() => {
              view.dispatch({
                annotations: [presenceAnnotation.of(true)],
              });
            }, 0);

            if (enableAutoFollowRef.current) {
              this.scrollToCursor(view);
            }
          },
        );
      }
      // Method to scroll the view to keep the cursor in view
      scrollToCursor(view) {
        for (const id in this.cursorPosition) {
          //getting the cursor position of the other cursor
          const cursorPos = this.cursorPosition[id];
          view.dispatch({
            //if the other person's cursor has jumped off screen, we will follow it by scrolling there directly.
            effects: EditorView.scrollIntoView(cursorPos),
          });
        }
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
  username: Username;
  timeout: number;
  constructor(
    id: string,
    color: string,
    username: Username,
  ) {
    super();
    this.id = id;
    this.color = color;
    this.username = username;
  }

  eq(other: PresenceWidget) {
    return other.id === this.id;
    // return false;
  }

  toDOM() {
    // console.log('inside toDOM');
    const span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    span.className = 'cm-json1-presence';
    // This child is what actually displays the presence.
    // Nested so that the layout is not impacted.
    //
    // The initial attempt using the top level span to render
    // the cursor caused a wonky layout with adjacent characters shifting
    // left and right by 1 pixel or so.
    const div = document.createElement('div');
    span.appendChild(div);
    div.style.borderLeft = `1px solid rgba(${this.color})`;

    // background color behind username
    const userDiv = document.createElement('div');
    userDiv.className = 'remote-cursor-username';
    userDiv.style.top = `-20px`;
    userDiv.style.height = `20px`;
    userDiv.style.width = `${this.username.length * 12}px`;
    userDiv.style.backgroundColor = `rgba(${this.color})`;
    userDiv.style.color = `black`;
    // userDiv.style.textAlign = `center`;
    userDiv.appendChild(
      document.createTextNode(this.username),
    );
    span.appendChild(userDiv);

    // after 2 seconds of inactivity, username is made less visible
    this.timeout = window.setTimeout(() => {
      // userDiv.style.backgroundColor = `rgba(${this.color}, 0.2)`;
      // userDiv.style.color = 'rgba(0,0,0,0.2)';
      userDiv.style.opacity = '0.3';
    }, 2000);

    return span;
  }

  // TODO try to use this instead of toDOM
  // updateDOM(dom: HTMLElement, view: EditorView) {
  //   console.log('inside updateDOM');
  //   dom.style.opacity = '1';
  //   window.clearTimeout(this.timeout);

  //   // after 2 seconds of inactivity, username is made less visible
  //   this.timeout = window.setTimeout(() => {
  //     // userDiv.style.backgroundColor = `rgba(${this.color}, 0.2)`;
  //     // userDiv.style.color = 'rgba(0,0,0,0.2)';
  //     dom.style.opacity = '0.3';
  //   }, 2000);

  //   return false;
  // }
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
  },
});
