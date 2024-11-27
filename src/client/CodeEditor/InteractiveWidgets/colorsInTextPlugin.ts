import { Extension, RangeSet } from '@codemirror/state';
import {
  Decoration,
  EditorView,
  ViewPlugin,
  WidgetType,
} from '@codemirror/view';
import { colorPickerRegex } from './colorPicker';

const colorCircleTheme = EditorView.baseTheme({
  '.color-circle-parent': {
    display: 'inline-block',
    cursor: 'inherit',
  },
});

class ColorWidget extends WidgetType {
  color: string;
  constructor(color: string) {
    super();
    this.color = color;
  }

  eq(widget: ColorWidget): boolean {
    return widget.color === this.color;
  }

  toDOM(): HTMLElement {
    const parent = document.createElement('div');
    const size = 20;
    const innerSize = 14;

    parent.setAttribute(
      'style',
      `width:${size}px;height:${size}px;position:relative;`, 
      // Position relative for the hovering tool tip to work      
    );
    parent.className = 'color-circle-parent';
    const svg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );
    const colorCircle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle',
    );
    colorCircle.setAttributeNS(
      null,
      'fill',
      this.color.replace(/["']/g, ''),
    );
    colorCircle.setAttributeNS(null, 'stroke', 'white');
    colorCircle.setAttributeNS(
      null,
      'stroke-width',
      '0.75',
    );
    colorCircle.setAttributeNS(
      null,
      'r',
      '' + innerSize / 2,
    );
    colorCircle.setAttributeNS(null, 'cx', '' + size / 2);
    colorCircle.setAttributeNS(
      null,
      'cy',
      '' + (size / 2 - 1),
    );

    svg.setAttributeNS(null, 'width', '' + size);
    svg.setAttributeNS(null, 'height', '' + size);

    svg.appendChild(colorCircle);

    parent.appendChild(svg);

    // Hovering tool tip shortcut for when users hover over color circle
    const hoveringTooltip = document.createElement('div');

    // Set class for tooltip to use CSS styles
    hoveringTooltip.className = 'tooltip_hover_circle';

    
    hoveringTooltip.innerHTML = 
      `<strong>Alt + Click on a hex color</strong><br />
      <div>Open a color picker to modify the color</div>`;

    
    parent.appendChild(hoveringTooltip);

    // Timer to prevent constant pop-ups when scrolling through code
    let hoverTimeout: number;

    // Fade in and fade out effect for when user hovers over the circle
    // Mouse Event to set y and x of the tool tip pop up to prevent overlap onto circle
    parent.addEventListener('mouseenter', (event: MouseEvent) => {
      hoverTimeout = window.setTimeout(() => {
        hoveringTooltip.style.top = `${event.clientY - 60}px`;
        hoveringTooltip.style.left = `${event.clientX}px`; 
        hoveringTooltip.style.opacity = '1';
      }, 700); 
    });

    parent.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      hoveringTooltip.style.opacity = '0';
    });

    return parent;
  }
  
  ignoreEvent() {
    return false;
  }
}

export const colorsInTextPlugin: Extension = [
  ViewPlugin.fromClass(
    class {
      decorations: any;
      view: EditorView;
      constructor(view: EditorView) {
        this.decorations = RangeSet.of([]);
        this.view = view;
      }
    },
    {
      decorations: (v) => {
        const colorInfos = [];

        const lines = v.view.state.doc.iter();
        let line = lines.next();

        // Offset is the number of characters before the hex
        // so the circle can be placed properly.
        let offset = 0;
        while (!line.done) {
          if (line.value === '\n') {
            offset++;
            line = lines.next();
            continue;
          }
          const hexColorOccurences = line.value.matchAll(
            colorPickerRegex,
          );
          let hexOccurance = hexColorOccurences.next();
          while (!hexOccurance.done) {
            const offsetColorInfo = hexOccurance.value;
            offsetColorInfo.index += offset;
            colorInfos.push(offsetColorInfo);
            hexOccurance = hexColorOccurences.next();
          }
          offset += line.value.length;
          line = lines.next();
        }

        return Decoration.set(
          colorInfos.map((colorInfo) => {
            return {
              // 7 is the length of the hex color string
              from: colorInfo.index + 7,
              to: colorInfo.index + 7,
              value: Decoration.widget({
                side: -1,
                widget: new ColorWidget(colorInfo[0]),
              }),
            };
          }),
        );
      },
    },
  ),
  colorCircleTheme,
];
