import {useReducer, useCallback} from 'react';

const initialState = {
    identifier: null,
    loading: false,
    error: null,
    data: null,
    extra: null
}

const httpReducer = (curHttpState, action) => {
    switch (action.type) {
      case 'SEND' :
        return {
            loading: true,
            error: null,
            data: null,
            extra: null,
            identifier: action.identifier
          };
      case 'RESPONSE' : 
        return {
            ...curHttpState,
            loading: false,
            data: action.responseData,
            extra: action.extra
        };
      case 'ERROR':
        return {loading: false, error: action.errorMessage}
      case 'CLEAR':
        return initialState;
      default:
        throw new Error('Should not be reached!');
    }
  } 

  const useHttp = () => {
      const [httpState, dispatchHttp] = useReducer(httpReducer, initialState);

      const clear = useCallback(() => dispatchHttp({type: 'CLEAR'}), []);

      const sendRequest = 
        useCallback(
          (url, method, body, reqExtraData) => {
              dispatchHttp({ type: 'SEND', identifier: method});
              fetch(url, {
                  method: method,
                  body: body,
                  headers: {
                      'Content-Type' : 'application/json'
                  }
              })
              .then(responseData => {
                return responseData.json();
              })
              .then(responseData =>{
                //console.log("reqExtraData", reqExtraData);
                dispatchHttp({
                    type:'RESPONSE',
                    responseData: responseData,
                    extra: reqExtraData
                });
              })
              .catch(error => {
                  dispatchHttp({
                    type: 'ERROR',
                    errorMessage: 'Something went wrong!'
                  });

              });
          }, []
        );
    return {
        isLoading: httpState.loading,
        data: httpState.data,
        error: httpState.error,
        sendRequest: sendRequest,
        reqExtra: httpState.extra,
        reqIdentifer: httpState.identifier,
        clear: clear,
        
    };
  };

  export default useHttp;