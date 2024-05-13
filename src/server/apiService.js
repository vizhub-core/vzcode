import { myLogger } from './utils.js';
import ShareDB from 'sharedb';
import { WebSocketServer } from 'ws';
import WebSocketJSONStream from '@teamwork/websocket-json-stream';
import { myShareDB } from './myShareDB.js';

function echoError(res,data,errCode){
    if (errCode){
      return res.status(errCode).send(data);
       
    }
    return res.status(500).send(data);
  }
  
function echoSuccss(res,data){ 
    res.header('Content-Type', 'application/json;charset=utf-8') 
    return res.status(200).send(data);
}

export const setupApiService = function(app,myShareDB,httpServer){ 

    app.disable('etag');
    /*
        open doc folder then trigger render on web page
        eg: http://localhost:3030/open/?dir=/workspace/code/src
    */
    app.get('/open', (req, res) => { 
        myLogger.debug(` /open: ${JSON.stringify(req.query)} `) 
        let   dir  = req.query['dir'];
        let  docId  = req.query['docId'];
        myLogger.debug(`dir:${dir},docId:${docId} `) 
        if (!dir && !docId){
            return  echoError(res,{'error':`invlidate input:${JSON.stringify(req.query)}`}) ;
        } 
        try{

            if (!dir){
              dir =  myShareDB.getDocPathById(docId); 
            }
            const doc = myShareDB.openDoc(dir,true); 
            docId = doc.id;
            const ts = Date.now()
            res.redirect (`/?docId=${docId}&ts=${ts}`)
            return ;            
        
        }catch(ex){
            console.error("Failed openDoc", ex);
            //return echoError(res,{'error':ex.toString()}) ; 
        }
    
    }); 
    //
    app.get('/api/open', (req, res) => { 
        myLogger.debug(` api->open: ${JSON.stringify(req.query)} `) 
        //res.send(req.query);
        const { dir} = req.query;
        if (!dir){
            return  echoError(res,{'error':"invlidate input"}) ;
        } 
        try{
            const doc = myShareDB.openDoc(dir); 
            
            myLogger.debug(`ShareDB.openDoc:${doc}`);
            myLogger.debug(`ShareDB:${myShareDB}`);
        
            return echoSuccss(res,{succss: true, doc:doc });
        
        }catch(ex){
            console.error("Failed openDoc", ex);
            return echoError(res,{'error':ex.toString()}) ;   
            
        }
    
    });

    // echo for check api lives 
    app.get('/api/info', (req, res) => { 
        const info = myShareDB.toString();
        echoSuccss(res,{succss: true,data:info });
    });

    // refresh doc list, but restart wss server now ~~ #TODO
    const apiRrefsh ='/api/refresh';
    app.get(apiRrefsh, (req, res) => { 
        myLogger.debug(`${apiRrefsh} request parameters: ${JSON.stringify(req.query)} `)
        if (1>0){  
            reCreateShareDbServer(httpServer)
            return echoSuccss(res,{succss: true });
        }
        const { docId} = req.query;
        const success = myShareDB.refreshDoc(docId);
        myLogger.debug('return sucess');
        return echoSuccss(res,{succss: success });
    }); 
    
}

const reCreateShareDbServer = function(httpServer){
    //keep exist doc path
    let docPathSet = {
        ...myShareDB.getDocPathSet()
    };
    myShareDB.freeWss();
    createShareDbServerBindWss(httpServer);
    // re-open 
    for (const [key, value] of Object.entries(docPathSet)) {
        myLogger.debug(`reCreateShareDbServer->loop docPathSet, by key:${key},value:${value}`);
        myShareDB._cleanDocFromSet(value);
        myShareDB.openDoc(value);
    } 
}

export const createShareDbServerBindWss = function(server){
    // Use ShareDB over WebSocket
    const shareDBBackend = new ShareDB({
        // Enable presence
        // See https://github.com/share/sharedb/blob/master/examples/rich-text-presence/server.js#L9
        presence: true,
        doNotForwardSendPresenceErrorsToClient: true,
    });

    const wss = new WebSocketServer({ server });
    wss.on('connection', (ws) => {
        const clientStream = new WebSocketJSONStream(ws);
        shareDBBackend.listen(clientStream);

        // Prevent server crashes on errors.
        clientStream.on('error', (error) => {
            console.log('clientStream error: ' + error.message);
        });

        // Handle errors
        ws.on('error', (error) => {
            console.log('ws error: ' + error.message);
        });

        // Handle disconnections
        ws.on('close', (code) => {
            clientStream.end();
        });
    });
    myShareDB.bindWss(shareDBBackend,wss);
    return  myShareDB;
}