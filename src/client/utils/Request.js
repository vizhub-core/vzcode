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

   function _updateQueryStringParameter(key, value) {
    var uri = window.location.href
    if(!value) {
      //return uri;
    }
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
      if (!value){
        return uri.replace(re, '$1'  + "=" + '$2');
      }
      return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
      if (!value){
        return uri 
      }
      return uri + separator + key + "=" + value;
    }
  }
  function updateUrlParameter( key, value){
    var newurl = _updateQueryStringParameter(key, value)
    //向当前url添加参数，没有历史记录
    window.history.replaceState({
      path: newurl
    }, '', newurl);
  }

  
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
    static updateUrlParameter(key,value)
    { 
      updateUrlParameter(key,value)
    } 
}

export {Request};