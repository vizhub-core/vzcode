
const wrapUnderSelectedFolder = function(shortName){
  const focusFolder =  globalThis.activeFolderId;
  if (focusFolder){
    // const s  =  os.platform();
    // let v =  "/"
    // if (s === 'win32'){
    //   v = "\\";
    // }
      
    return focusFolder + "/" + shortName;
  }
  return shortName
}

export { wrapUnderSelectedFolder };