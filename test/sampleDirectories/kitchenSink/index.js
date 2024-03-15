import {WidgetType, Decoration, EditorView} from "@codemirror/view";
import {syntaxTree} from "@codemirror/language";
import {ViewUpdate, ViewPlugin} from "@codemirror/view";
import {EditorState} from "@codemirror/state";
import {EditorView} from "@codemirror/view";
import {javascript} from "@codemirror/lang-javascript";


class CheckboxWidget extends WidgetType {
  constructor(readonly checked: boolean) { super(); }

  eq(other: CheckboxWidget) { return other.checked === this.checked; }

  toDOM() {
    const wrapper = document.createElement("span");
    wrapper.className = "cm-boolean-toggle";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = this.checked;
    checkbox.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent the editor from losing focus
    });
    wrapper.appendChild(checkbox);
    return wrapper;
  }

  ignoreEvent() { return false; } // Allows the checkbox to be clickable
}
function createBooleanCheckboxes(view: EditorView) {
  let widgets = [];
  for (let {from, to} of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from, to,
      enter: node => {
        if (node.name === "BooleanLiteral") {
          const isTrue = view.state.doc.sliceString(node.from, node.to) === "true";
          const widget = new CheckboxWidget(isTrue);
          widgets.push(Decoration.widget({
            widget,
            side: 1
          }).range(node.to));
        }
      }
    });
  }
  return Decoration.set(widgets, true); // The true argument keeps the decorations separate from text.
}


const booleanCheckboxPlugin = ViewPlugin.fromClass(class {
  decorations;

  constructor(view) {
    this.decorations = createBooleanCheckboxes(view);
  }

  update(update) {
    if (update.docChanged || update.viewportChanged || update.selectionSet) {
      this.decorations = createBooleanCheckboxes(update.view);
    }
  }
}, {
  decorations: v => v.decorations
});
booleanCheckboxPlugin.eventHandlers = {
  mousedown: (event, view) => {
    const target = event.target;
    if (target.nodeName === 'INPUT' && target.type === 'checkbox') {
      const pos = view.posAtDOM(target);
      const before = view.state.doc.sliceString(Math.max(0, pos - 5), pos);
      const change = before === "false" 
                      ? {from: pos - 5, to: pos, insert: "true"}
                      : before.endsWith("true")
                      ? {from: pos - 4, to: pos, insert: "false"}
                      : null;
      if (change) {
        view.dispatch({changes: change});
        return true; // Prevent further handling
      }
    }
    return false;
  }
};


const state = EditorState.create({
  doc: `const enableRotation = true;`,
  extensions: [javascript(), booleanCheckboxPlugin]
});

const view = new EditorView({
  state,
  parent: document.body
});
