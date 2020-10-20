import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

const httpReducer = (curHttpState, action) => {
  switch (action.type) {
    case 'SEND':
      return { loading: true, error: null };
    case 'RESPONSE':
      return { ...curHttpState, loading: false };
    case 'ERROR':
      return { loading: false, error: action.errorMessage };
    case 'CLEAR':
      return { ...curHttpState, error: null };
    default:
      throw new Error('Should not be reached!');
  }
};

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error('Should not get there!');
  }
};

function Ingredients() {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null
  });
  // const [userIngredients, setUserIngredients] = useState([]);
  //const [isLoading, setIsLoading] = useState(false);
  //const [error, setError] = useState();

  useEffect(() => {
    console.log('RENDERING INGREDIENTS', userIngredients);
  }, [userIngredients]);

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    // setUserIngredients(filteredIngredients);
    dispatch({ type: 'SET', ingredients: filteredIngredients });
  }, []);


  const addIngredientHandler = useCallback( ingredient => {
    //setIsLoading(true);
    dispatchHttp({ type: 'SEND' });
    fetch('https://reacthook-8c62f.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      header: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        return response.json();
      })
      .then(responseData => {
        //setIsLoading(false);
        dispatchHttp({ type: 'RESPONSE' });
        // setUserIngredients(prevIngredients => [
        //   ...prevIngredients,
        //   { id: responseData.name, ...ingredient }
        // ]);
        dispatch({
          type: 'ADD',
          ingredient: { id: responseData.name, ...ingredient }
        });
      })
  }, []);

  const removeIngredientHandler = useCallback(ingredientId => {
    //setIsLoading(true);
    dispatchHttp({ type: 'SEND' });
    fetch(`https://reacthook-8c62f.firebaseio.com/ingredients/${ingredientId}.json`, {
      method: 'DELETE',
    }).then(responseData => {
      //setIsLoading(false);
      dispatchHttp({ type: 'RESPONSE' });
      // setUserIngredients(prevIngredients =>
      //   prevIngredients.filter(ingredient => ingredient.id !== ingredientId)
      // );
      dispatch({ type: 'DELETE', id: ingredientId });
    }).catch(error => {
      //setError('Something went wrong!');
      //setIsLoading(false);
      dispatchHttp({ type: 'ERROR', errorMessage: 'Something went wrong!' });
    });

  }, []);

  const clearError = () => useCallback( () => {
    //setError(null);
    dispatchHttp({ type: 'CLEAR' });
  }, []);

  const ingrediendList = useMemo(() => {
    return(
      <IngredientList 
          ingredients={userIngredients} 
          onRemoveItem={removeIngredientHandler} />
      );
  }, [userIngredients, removeIngredientHandler])

  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}

      <IngredientForm 
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}/>

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler}/>
        {ingrediendList}
      </section>
    </div>
  );
}

export default Ingredients;
