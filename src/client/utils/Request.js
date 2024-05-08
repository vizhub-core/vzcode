/*
 Utils for Web browser URL request
*/
const groupParamsByKey = (params) => [...params.entries()].reduce((acc, tuple) => {
    // getting the key and value from each tuple
    const [key, val] = tuple;
    if(acc.hasOwnProperty(key)) {
       // if the current key is already an array, we'll add the value to it
       if(Array.isArray(acc[key])) {
         acc[key] = [...acc[key], val]
       } else {
         // if it's not an array, but contains a value, we'll convert it into an array
         // and add the current value to it
         acc[key] = [acc[key], val];
       }
    } else {
     // plain assignment if no special case is present
     acc[key] = val;
    }
   
   return acc;
   }, {});

class Request 
{  

    static getParameters()
    {   
        const search = location.search.substring(1);
        if (!search){
            return {};
        }
        const params = new URLSearchParams(search);
        const output = groupParamsByKey(params)  
        return output;
    }
}

export {Request};