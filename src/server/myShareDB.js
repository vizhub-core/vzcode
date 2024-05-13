#!/usr/bin/env node
import './setupEnv.js';
import ShareDB from 'sharedb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
//import open from 'open';
import { json1Presence } from '../ot.js';
import { computeInitialDocument } from './computeInitialDocument.js';
//import { handleAIAssist } from './handleAIAssist.js';
import { isDirectory } from './isDirectory.js';
import { myLogger } from './utils.js';
import jsSHA  from "jssha";
import { Constants } from './constants.js';

// The time in milliseconds by which auto-saving is debounced.
const autoSaveDebounceTimeMS = 800;

// The time in milliseconds by which auto-saving is throttled
// when the user is interacting with the widgets in the editor.
const throttleTimeMS = 100;
  

function getFullPath(basePath, shortName){  
  let result =  path.normalize(`${basePath}/${shortName}`);
  return result;
}
// Register our custom OT type,
// because it does not ship with ShareDB.
ShareDB.types.register(json1Presence.type);


export const myShareDB ={

    // Use ShareDB over WebSocket
    _shareDBBackend: null, 
    _wss: null,

    _shareDBConnection: null,
   
 
    _defaultSpaceKey : null, // set once 
    _defaultSpacePath: null,

    _docSet:{},
    _docPathSet:{},
    
    toString(){
        const info={ 
            docPathSet:this._docPathSet
        }
        return JSON.stringify(info);
    },
    
    init(keyOfSpace,pathOfSpace){
        this._defaultSpaceKey = keyOfSpace;
        this._defaultSpacePath = pathOfSpace;
    },

    getDocPathSet(){
        return this._docPathSet;
    },

    bindWss(shareDBBackend,wss){
       this.freeWss();
       this._shareDBBackend = shareDBBackend;
       this._wss = wss; 
    },

    freeWss(){
        this.cleanupDocSet();
        if (this._shareDBConnection){
            this._shareDBConnection = null;
        }
        if (this._shareDBBackend){
            this._shareDBBackend.close()
            this._shareDBBackend = null;
        }
        if (this._wss){
            this._wss.close()
            this._wss = null;
        }
    },

    cleanupDocSet(){
        for (const [key, value] of Object.entries(this._docPathSet)) {
            myLogger.debug(`cleanupDocSet, by key:${key},value:${value}`);
            this._cleanDocFromSet(value); 
        } 
    },
    _toDocKey(path){
        if (path === this._defaultSpacePath ){
            return this._defaultSpaceKey;
        }
        const shaObj = new jsSHA("SHA-256", "TEXT", { encoding: "UTF8" });
        shaObj.update(path);
        const hashKey = shaObj.getHash("HEX");
        return hashKey;
    },
    getDocPathById(docId){
        const path = this._docPathSet[docId];
        return path;
    },
    
    
    /*
    @return {
             key:
            }
    */
    openDoc(path,forceReload=false){  
        // Create the initial "document",
        // which is a representation of files on disk.
        if (!this._shareDBConnection){
            this._shareDBConnection = this._shareDBBackend.connect();
        } 
        // forceReload 
        if (forceReload){
            myLogger.debug('openDoc,forceReload')
            this._cleanDocFromSet(path)
        }
        let key = this._toDocKey(path)
        const existDoc = this._docSet[key];
        if (existDoc){
            return { id: key} ;
        }
 
        const shareDBDoc = this._createShareDoc(key, path);
        this._docSet[key] = shareDBDoc;
        this._docPathSet[key] = path;

        return  { id: key} ;
    },

    _cleanDocFromSet(path){
        let key = this._toDocKey(path)
        const shareDBDoc = this._docSet[key];
        if (!shareDBDoc){
            return ; 
        }
        myLogger.debug(`_cleanDocFromSet, path:${path}`);
        shareDBDoc.unsubscribe();
        shareDBDoc.del();
        shareDBDoc.destroy();
        
        delete this._docSet[key]
        delete this._docPathSet[key]
    },

    _createShareDoc(key,docSpacePath){
        
        myLogger.debug(`_createShareDoc: ${docSpacePath}`);

        const shareDBDoc = this._shareDBConnection.get('documents', key );  

        let initialDocument = computeInitialDocument({
            // Use the current working directory to look for files.
            //fullPath: process.cwd(),
            fullPath: docSpacePath
        });

        shareDBDoc.create(initialDocument, json1Presence.type.uri);

        // The state of the document when files were last auto-saved.
        let previousDocument = initialDocument;


        // Saves the files that changed.
        const save = () => {
            const currentDocument = shareDBDoc.data;

            // Take a look at each file (key) previously and currently.
            const allKeys = Object.keys({
                ...currentDocument.files,
                ...previousDocument.files,
            });
            
            

            const directoriesToDelete = [];

            for (const key of allKeys) {
                const previous = previousDocument.files[key];
                const current = currentDocument.files[key];
                this._handleItem(previous,current,directoriesToDelete,docSpacePath)
            }
            // TODO deleted all directories under directoriesToDelete

            for (const dir of directoriesToDelete) {
                //Performs directory deletion.
                fs.rm(
                dir,
                {
                    recursive: true, //Makes sure that all files in directory are deleted.
                },
                (error) => {
                    if (error) {
                    console.log(error);
                    }
                },
                );
            }

            previousDocument = currentDocument;
        };

        // // Listen for when users modify files.
        // // Files get written to disk after `autoSaveDebounceTimeMS`
        // // milliseconds of inactivity.
        // let timeout;
        // shareDBDoc.subscribe(() => {
        //   shareDBDoc.on('op', () => {
        //     // console.log(shareDBDoc.data.isInteracting);
        //     clearTimeout(timeout);
        //     timeout = setTimeout(save, autoSaveDebounceTimeMS);
        //   });
        // });

        let lastExecutedTime = Date.now();
        let lastChangeTimeout; // This timeout ensures the last change is saved

        // Function to throttle the saving
        function throttleSave() {
            const now = Date.now();
            const timeSinceLastExecution = now - lastExecutedTime;

            if (timeSinceLastExecution > throttleTimeMS) {
                save();
                lastExecutedTime = now;
            } else {
                // Clear the previous timeout and set a new one to save the last change
                clearTimeout(lastChangeTimeout);
                lastChangeTimeout = setTimeout(() => {
                save();
                lastExecutedTime = now;
                }, throttleTimeMS - timeSinceLastExecution);
            }
        }

        // Function to debounce the saving
        let debounceTimeout;
        function debounceSave() {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(
                save,
                autoSaveDebounceTimeMS,
            );
        }

        // Subscribe to listen for modifications
        shareDBDoc.subscribe(() => {
            shareDBDoc.on('op', () => {
                if (shareDBDoc.data.isInteracting) {
                    throttleSave();
                } else {
                    debounceSave();
                }
            });
        });
        
        return shareDBDoc;
    },
    
    _handleItem(previous,current,directoriesToDelete,docSpacePath){ 
        
        const from = previous ? getFullPath(docSpacePath,previous.name): null; 
        const to = current ? getFullPath(docSpacePath,current.name): null; 
        if (from != to){
            myLogger.debug(`_handleItem: from:[${from}] to:[${to}]`)
        }
        // If this file was neither created nor deleted...
        if (previous && current) {
            // Handle changing of text content.
            if (previous.text !== current.text) {
                //@@ fs.writeFileSync(current.name, current.text);
            
                myLogger.debug(`save change file: ${current.name}`); 
                fs.writeFileSync(to, current.text);
            }

         
            // Handle renaming files.
            if (previous.name !== current.name) {
                //@@ if (isDirectory(previous.name)) {
                if (isDirectory(from)) {    
                // If the directory itself is being renamed,
                // Phase I: Ignore it, and get the files moved
                // Phase II: Keep track of these, and delete them after
                //           all the files moved.
               
                // directoriesToDelete.push(previous.name)
                //@@ directoriesToDelete.push(previous.name); 
                   // directoriesToDelete.push(from);
                   try {
                    myLogger.debug(`rename folder from:[${from}] to:[${to}]`);
                    fs.renameSync(from, to)
                    
                  } catch(err) {
                    console.error(err)
                  }
                } else {
                    //@@ const newDir = path.dirname(current.name); 
                    const newDir = path.dirname(to);
                    // Check if the new directory exists, if not, create it
                    if (!fs.existsSync(newDir)) {
                        fs.mkdirSync(newDir, { recursive: true });
                    }
                    myLogger.debug(`rename file from:[${from}] to:[${to}]`);
                    // Move the file to the new directory 
                    //@@ fs.renameSync(previous.name, current.name); 
                    fs.renameSync(from, to);
                }
            }
        }

        // handle deleting files and directories.
        if (previous && !current) {
            //@@ let stats = fs.statSync(previous.name); 
            let stats = fs.statSync(from);
            //Check if the file path we are trying to delete is a directory
            if (!stats.isDirectory()) {
                myLogger.debug(`rm file: ${from}`);
                //@@ fs.unlinkSync(previous.name);
                fs.unlinkSync(from);
            } else {
                //Performs directory deletion.
                myLogger.debug(`rm folder: ${from}`);
                fs.rm(
                //@@ previous.name,
                    from,
                {
                    recursive: true, //Makes sure that all files in directory are deleted.
                },
                (error) => {
                    if (error) {
                    console.log(error);
                    }
                },
                );
            }
        }

        // Handle creating files and Directories.
        if (!previous && current) {
            //File Creation 
            //@@ if (!isDirectory(current.name)) {
            if (!isDirectory(to)) {
                //@@ fs.writeFileSync(current.name, current.text);
                myLogger.debug(`create file: ${to}`);
                fs.writeFileSync(to, current.text);
            } else {
                //@@ fs.mkdirSync(current.name, { recursive: true });  
                myLogger.debug(`create folder: ${to}`);
                fs.mkdirSync(to, { recursive: true });
            }
        }
    }

}

 
