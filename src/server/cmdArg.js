import path from 'path';
import fs from 'fs'; 
 

// 
const isDevMode = function(){ 
  const dev = process.argv.find((arg) =>
    arg === 'dev',
  );
  return dev;
}

const getCurrentExeFolder = function(){ 
  //process.cwd();////__dirname;// path.dirname(process.execPath);
  const result = isDevMode()? process.cwd(): path.dirname(process.argv[0]); 
   
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



 
export const prepareSpaceByAsset = function(assetName,toSpace){
  // const to = path.join(toSpace,assetName);
  
  // //ls(AppEnv.getProjectRootPath());
  // const from =  path.join(AppEnv.getProjectRootPath(), assetName) 
  
  // cp(from,to);
}


export const AppEnvNoSense ={
  /*
   /snapshot/vzcode/dist_server/server/ => /snapshot/vzcode/
  */
  getProjectRootPath(){
      let currentPath = __dirname;
      
      const list = currentPath.split(path.sep);
      var result = "";
      for (let index = 0; index < list.length -2; index++) { 
          result = path.join(result,list[index]);
      }
      console.log(`🔥 getProjectRootPath: ${result}`)
      return result;
  }
}
