import { exec } from "child_process";
import fs from 'fs';

export const myLogger ={ 
    debug(msg){
        console.log(`✍️ ${msg}`);
    }
}  

export const  openBrowser = function (url) {
     
    switch (process.platform) {
      case "darwin":
        exec('open ' + url);
        break;
      case "win32":
        exec('start ' + url);
        break;
      default:
        exec('xdg-open', [url]);
    }
}

export const FileSys ={

    isDir(path,forceCreate=false){
        const target_directory = path;
        if (!fs.existsSync(target_directory)) {
            if (forceCreate){
                fs.mkdirSync(target_directory);
                return true
            }else{
                return false;
            }
            
        }
    }
} 