import React, {useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';
import useHttp from '../../hooks/http';

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET' :
      return action.ingredients;
    case 'ADD' :
      return [...currentIngredients, action.ingredient];
    case 'DELETE' :
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error('Should not get there');
  }
}


const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const {
    isLoading,
    error,
    data,
    sendRequest,
    reqExtra,
    reqIdentifer,
    clear
  } = useHttp();
  
  useEffect(() => {
    if(!isLoading && !error && reqIdentifer === "DELETE"){
      console.log(reqIdentifer);
      dispatch({ type: 'DELETE', id: reqExtra})
    } else if (!isLoading && !error && reqIdentifer === "POST"){
      //console.log(reqIdentifer);
      console.log("reqExtra", reqExtra);
      dispatch({
        type: 'ADD',
        ingredient: {id: data.name, ...reqExtra }
      });
    }
  }, [data, reqExtra, reqIdentifer, isLoading, error]);


  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    dispatch({ type: 'SET', ingredients: filteredIngredients });
  }, []);
  
  const addIngredientHandler = useCallback((ingredient) => {
    sendRequest(
      'https://reacthook-8472f.firebaseio.com/ingredients.json',
      'POST',
      JSON.stringify(ingredient),
      ingredient
    );

  }, [sendRequest]);

  const removeIngredientHandler = useCallback(ingredientId => {
    sendRequest(
      `https://reacthook-8472f.firebaseio.com/ingredients/${ingredientId}.json`,
      'DELETE',
      null,
      ingredientId
    );
    
  }, [sendRequest]);

  const ingredientList = useMemo(() => {
    console.log(userIngredients);
    return (
      <IngredientList
          ingredients= {userIngredients} 
          onRemoveItem={removeIngredientHandler}/>
    );
  }, [userIngredients, removeIngredientHandler]);

  return (
    <div className="App">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}

      <IngredientForm 
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
