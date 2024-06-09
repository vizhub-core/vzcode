// TODO - This file is not being used.
// It was an attempt to highlight the interactive widgets in the editor.
// It is a good idea to keep this file for future reference, as it's
// pretty close to what we need to implement. It suffers from the following
// issues:
// - Hardcoded regexes for interactive widgets - we can pull from the various modules
// - The highlight is not working properly - it's not un-highlighting
//   when the Alt key is released. This is likely due to the fact that the
//   plugin is not being updated when the key is released.

// export const highlightWidgets = ViewPlugin.fromClass(
//   class {
//     showHighlight: boolean;
//     view: EditorView;
//     constructor(view: EditorView) {
//       this.showHighlight = false;
//       this.view = view;
//     }
//   },
//   {
//     decorations: (v) => {
//       if (!v.showHighlight) {
//         return Decoration.none;
//       }

//       const interactOpportunities = [];
//       const lines = v.view.state.doc.iter();
//       let line = lines.next();

//       //Offset is the number of characters before the regex so the highlighting can be placed properly.
//       let offset = 0;
//       while (!line.done) {
//         if (line.value === '\n') {
//           offset++;
//           line = lines.next();
//           continue;
//         }
//         const interactiveOccurances = line.value.matchAll(
//           //The below line contains all of the Regexes for all of the interactive widgets.
//           /\"\#([0-9]|[A-F]|[a-f]){6}\"|rotate\(-?\d*\.?\d*\)|https?:\/\/[^ "]+|vec2\(-?\b\d+\.?\d*\b\s*(,\s*-?\b\d+\.?\d*\b)?\)|true|false|(?<!\#)-?\b\d+\.?\d*\b|rgb\(.*\)/dg,
//         );
//         let interactOccurance =
//           interactiveOccurances.next();
//         while (!interactOccurance.done) {
//           const offsetInteract = interactOccurance.value;
//           offsetInteract.indices[0][0] += offset;
//           offsetInteract.indices[0][1] += offset;
//           interactOpportunities.push(offsetInteract);
//           interactOccurance = interactiveOccurances.next();
//         }
//         offset += line.value.length;
//         line = lines.next();
//       }
//       return Decoration.set(
//         interactOpportunities.map((opportunity) => {
//           return {
//             from: opportunity.indices[0][0],
//             to: opportunity.indices[0][1],
//             value: Decoration.mark({
//               class: 'cm-interact ',
//             }),
//           };
//         }),
//       );
//     },
//     eventHandlers: {
//       keydown(event, view) {
//         if (event.key == 'Alt') {
//           this.showHighlight = true;
//         }
//       },
//       keyup(event, view) {
//         if (event.key == 'Alt') {
//           this.showHighlight = false;
//         }
//       },
//     },
//   },
// );
