import path from 'path';


export const AppEnv ={
    /*
     /snapshot/vzcode/dist_server/ => /snapshot/vzcode/
    */
    getProjectRootPath(){
        let currentPath = __dirname;
        
        const list = currentPath.split(path.sep);
        var result = "";
        for (let index = 0; index < list.length -1; index++) { 
            result = path.join(result,list[index]);
        }
        console.log(`🔥 getProjectRootPath: ${result}`)
        return result;
    }
}