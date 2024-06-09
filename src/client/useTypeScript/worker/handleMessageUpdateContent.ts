import { File, Files, VZCodeContent } from '../../../types';
import { getTSFileName } from './getTSFileName';
import { isTS } from './isTS';

// Handle the update-content event, which
// updates the files as they change.
// This handles the cases where:
//  * The file system is populated for the first time.
//  * Files are edited by remote users.
export const handleMessageUpdateContent = async ({
  debug,
  data,
  setFile,
}) => {
  if (debug) {
    console.log('update-content message received');
  }
  // Unpack the files
  const content: VZCodeContent = data.details;
  const files: Files = content.files;

  // Iterate over the files
  for (const fileId of Object.keys(files)) {
    const file: File = files[fileId];
    const { name, text } = file;

    const tsFileName = getTSFileName(name);

    if (!isTS(tsFileName)) {
      continue;
    }

    setFile(tsFileName, text);
    // TODO - Handle renaming files.
    // TODO - Handle deleting files.
    // TODO - Handle directories.
  }
};
