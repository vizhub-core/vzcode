import React,  { Suspense} from "react";
import App from '../App';

import { reloadDocThen }  from './loader'

const fetchDocStatus = reloadDocThen()

function AppShell() {  
  const docStatus = fetchDocStatus.read();  
  return ( 
      <App /> 
      // <Suspense fallback={<p>loading...</p>}>
      //   <App />
      // </Suspense>    
  );
}

export default AppShell;
