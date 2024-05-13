import path from 'path';
import fs from 'fs';
import { isDirectory } from './isDirectory';
import { AppEnv } from '../appEnv';

const getCurrentExeFolder = function(){ 
  //process.cwd();////__dirname;// path.dirname(process.execPath);
  const execBin = process.argv[0];
  var result = path.dirname(execBin);
   
  console.log(`getCurrentExeFolder:${result}`)
  return result; 
}

function toFullPath(val){ 
  const relateTo = `.${path.sep}`;
   
  console.log(`relateTo ${relateTo}`)
  if (val.startsWith(relateTo)){
    const currentPath = getCurrentExeFolder();//process.cwd()
    const result =  path.join(currentPath,val);
    return result;
  }
  return val;
}

export const cmdArgValidate = function(){

}

//------ Server port 
// Helper function to get the port from command line arguments or use default.
export const getPortFromArgs = function(defaultPort = 3030) {
    const portArg = process.argv.find((arg) =>
      arg.startsWith('--port='),
    );
    if (portArg) {
      return parseInt(portArg.split('=')[1], 10);
    }
    return defaultPort;
}


//------  Express website path 
export const getWebsiteSpaceFromArgs = function(defaultVal = "/dist") {
    const argVal = process.argv.find((arg) =>
      arg.startsWith('--site='),
    );
    if (argVal) {
      const pathVal =  argVal.split('=')[1];
      return toFullPath(pathVal);
    }
    
    //const currentPath =  path.dirname(process.execPath) ; //__dirname ;// process.cwd()
    const currentPath = getCurrentExeFolder(); //process.cwd()
    const result =  path.normalize(`${currentPath}${defaultVal}`);
    return result;
}


//------  Document space path    
export const getDocumentSpaceFromArgs = function (defaultVal = "space") {
    const argVal = process.argv.find((arg) =>
      arg.startsWith('--space='),
    );
    if (argVal) {
      const pathVal =  argVal.split('=')[1];
      return toFullPath(pathVal);
    }
    
    //const currentPath =  path.dirname(process.execPath) ; //__dirname ;// process.cwd()
    const currentPath = getCurrentExeFolder(); //process.cwd()
    const result =  path.join(currentPath,defaultVal);
    return result;
}

const cp = function(from, to){
  try {
    console.log(`try cp: ${from} => ${to} `)
    fs.cpSync(from, to, {
      recursive: true,
    });
  } catch (error) {
    console.error(error.message);
  }
}

 
const ls = async (dirName) => {
  console.log('try ls:' + dirName);
  const getFileList = async (dirName) => {
    const files = await fs.readdir(dirName);

    return files;
  };

  getFileList(dirName).then((files) => {
      console.log(files);
  });
};

 
export const prepareSpaceByAsset = function(assetName,toSpace){
  const to = path.join(toSpace,assetName);
  if (isDirectory(to)){
    return ;
  }
  //ls(AppEnv.getProjectRootPath());
  const from =  path.join(AppEnv.getProjectRootPath(), assetName) 
  
  cp(from,to);
}