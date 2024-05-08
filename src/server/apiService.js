import { myLogger } from './utils.js';

function echoError(res,data,errCode){
    if (errCode){
      return res.status(errCode).send(data);
       
    }
    return res.status(500).send(data);
  }
  
function echoSuccss(res,data){ 
    return res.status(200).send(data);
}

export const setupApiService = function(app,myShareDB){ 
    // open doc folder then trigger render on web page 
    app.get('/open', (req, res) => { 
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
    app.get('/echo', (req, res) => { 
        myLogger.debug(` api->echo: ${req.params} `) 
        //res.json({'input':req.params});
        res.send(req.query);
    });

}