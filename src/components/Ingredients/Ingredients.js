import React, { useState, useEffect, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';

function Ingredients() {
  const [userIngredients, setUserIngredients] = useState([]);
  
  useEffect(() => {
    console.log('RENDERING INGREDIENTS', userIngredients);
  }, [userIngredients]);

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    setUserIngredients(filteredIngredients)
  }, []);

  
  const addIngredientHandler = ingredient => {
    fetch('https://reacthook-8c62f.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      header: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        return response.json();
      })
      .then(responseData => {
        setUserIngredients(prevIngredients => [
          ...prevIngredients,
          { id: responseData.name, ...ingredient }
        ]);
      })
  };

  const removeIngredientHandler = ingredientId => {
    fetch(`https://reacthook-8c62f.firebaseio.com/ingredients/${ingredientId}.json`, {
      method: 'DELETE',
    })
      .then(responseData => {
        setUserIngredients( prevIngredients => 
          prevIngredients.filter(ingredient => ingredient.id !== ingredientId)
        );
      })
    
  };

  return (
    <div className="App">
      <IngredientForm onAddIngredient={addIngredientHandler}/>

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler}/>
        <IngredientList 
        ingredients={userIngredients} 
        onRemoveItem={removeIngredientHandler} />
      </section>
    </div>
  );
}

export default Ingredients;
