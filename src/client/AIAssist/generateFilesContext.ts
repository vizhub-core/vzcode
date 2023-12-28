// import { File } from '../../types';

// const maxFileNameLength = 100;
// const maxFileTextLength = 2000;

// export const generateFilesContext = (
//   goodFiles: Array<File>,
// ): string => {
//   const input = goodFiles
//     .map((file) => {
//       const nameSubstring = file.name
//         ?.substring(0, maxFileNameLength)
//         .trim();

//       const textSubstring = file.text
//         ?.substring(0, maxFileTextLength)
//         .trim();

//       // Generate Markdown that AI will understand.
//       return `File \`${nameSubstring}\`:\n\`\`\`${textSubstring}\`\`\``;
//     })
//     .join('\n\n');

//   return input;
// };
