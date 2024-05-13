// wrapPromise.js

/**
 * 将promise包装，以便可以与React Suspense一起使用
 * @param {Promise} 要处理的promise
 * @returns {Object} 与Suspense兼容的响应对象
 */
function wrapPromise(promise) {
    let status = 'pending';
    let response;
  
    const suspender = promise.then(
      res => {
        status = 'success';
        response = res;
      },
      err => {
        status = 'error';
        response = err;
      },
    );
  
    const handler = {
      pending: () => {
        throw suspender;
      },
      error: () => {
        throw response;
      },
      default: () => response,
    };
  
    const read = () => {
      
      const result = handler[status] ? handler[status]() : handler.default();
      return result;
    };
    const delay =(minutes=5)=>{
      for (let index = 0; index < 1000* minutes; index++) { 
        
      }
    }
    return { read, delay };
  }
  
  export default wrapPromise;
   