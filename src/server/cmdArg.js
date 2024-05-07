import path from 'path';

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
      return  argVal.split('=')[1];
    }
    
    const currentPath =  path.dirname(process.execPath) ; //__dirname ;// process.cwd()
    const result =  path.normalize(`${currentPath}${defaultVal}`);
    return result;
}


//------  Document space path  
export const getDocumentSpaceFromArgs = function (defaultVal = "space") {
    const argVal = process.argv.find((arg) =>
      arg.startsWith('--space='),
    );
    if (argVal) {
      return  argVal.split('=')[1];
    }
    
    const currentPath =  path.dirname(process.execPath) ; //__dirname ;// process.cwd()
    const result =  path.join(currentPath,defaultVal);
    return result;
}

