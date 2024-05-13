import process from 'node:process';

const wrapUnderSelectedFolder = function(shortName){
  const focusFolder =  globalThis.activeFolderId; 
  if (focusFolder){
    const platform  =  process.platform;
    let sp =  "/"
    if (platform === 'win32'){
      sp = "\\";
    } 
    const reuslt = focusFolder + sp + shortName;  
    return reuslt ;
  }
  return shortName
}

// keep current seleted node id, should only one node, distinguish between File node and Folder node on Treeview
const onSelectedNode = function(isFile, nodeId){
  if (isFile){
    globalThis.activeFileId = nodeId;
    globalThis.activeFolderId = null;
    return ;
  }
  globalThis.activeFileId = null;
  globalThis.activeFolderId = nodeId;
}

const onSelectedFileNode = function( nodeId){
  return onSelectedNode(true,nodeId);
}
 
const onToggleFolderNode = function( nodeId){
  onSelectedNode(false,nodeId)
}
export { wrapUnderSelectedFolder,onToggleFolderNode,onSelectedFileNode };