// Recursively sorts the file tree in-place.
// Sorts first to group directories before files.
// Sorts second alphabetically.
// From https://github.com/vizhub-core/vizhub/blob/main/vizhub-v2/packages/neoFrontend/src/pages/VizPage/Body/Editor/FilesSection/FileTree/sortFileTree.js
export const sortFileTree = (fileTree) => {
  if (fileTree.children) {
    fileTree.children.sort((a, b) => {
      const aIsFile = a.file ? 1 : 0;
      const bIsFile = b.file ? 1 : 0;
      return aIsFile - bIsFile || a.name.localeCompare(b.name);
    });
    fileTree.children.forEach(sortFileTree);
  }
  return fileTree;
};
