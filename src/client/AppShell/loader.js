import { Request }  from "../utils/Request.js";
import { fetchData } from "../utils/Fetcher.js"

const getRequestDocId = function(){
  const args = Request.getParameters();
  console.debug("reload Request.getParameters:",args);

  const docId = args['docId'];
  //default => homeSpace, fix set this value 
  return docId ? docId : 'homeSpace';
} 

const  reloadDocIfNeeds = async()=>{ 
    // const docId = getRequestDocId();
    
    // const next = Request.getParameters()['next'];
    //   if ( 'none' === next){ 
    //     Request.updateUrlParameter('next','');
    //     return;
    //   }
    const ts = Date.now()
      // window.location.href = `/open?docId=${docId}&ts=${ts}`;
      // return ;
    globalThis.docReady = false;
    const options = { timeout : 8000 };
    fetch(`/api/refresh?ts=${ts}`).then(response =>{
        const buf = response.text();
        console.log(`result: ${buf}`)
      } ).finally(()=>{
        globalThis.docReady= true;
        console.log('reloadDoc finally')
    }); ;
  
}

export const reloadDocThen = ()=>{ 
  const docId = getRequestDocId();
  const ts = Date.now()
  const api = `/api/refresh?docId=${docId}&ts=${ts}`
  return fetchData(api);
} 

        
 
 
