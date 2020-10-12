import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import {elements, renderLoader, clearLoader} from './views/base';

const state = {}


/***Search Controller */
const controlSearch = async () => {
    
    //1) get query from view
    const query = searchView.getInput();

    if(query) {
        
        //2) new search object and add it to the state
        state.search = new Search(query);

        //3) prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try{
            //4) search for reciepe
            await state.search.getResults();
    
            //5) render result to UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch(error) {
            console.log(error);
            alert('something went worng in search...');
            clearLoader();
        }
    }

}

 elements.searchForm.addEventListener('submit', e => {
     e.preventDefault();
     controlSearch();
 });

elements.resultPage.addEventListener('click', e=> {
    const btn = e.target.closest('.btn-inline');
    if(btn) {
        const goToPage = parseInt(btn.dataset.goto);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})


/***Recipe Controller */
const controlRecipe = async () => {
     // Get id from url
     const id = window.location.hash.replace('#', '');
     console.log(id);

     if(id) {
         //prepare ui
         recipeView.clearRecipe();
         renderLoader(elements.recipe);

         //highlight selected recipe
         if(state.search) searchView.highlightSelected(id);

         //create new recipe object
         state.recipe = new Recipe(id);

         try {
             //get all data and parse ing
             await state.recipe.getRecipe();
             state.recipe.parseIngredients();
            
             //cal time and servings
             state.recipe.calTime();
             state.recipe.calServings();
    
             //render recipe
             clearLoader()
             recipeView.renderRecipe(state.recipe);
         } catch (error) {
             console.log(error);
             alert ('error in recipe controller');
             clearLoader();
         }
     }
};

//window.addEventListener('hashchange', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


//handling recipe button click
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        //decrease button is clicked
        if(state.recipe.servings >1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        //increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }
    console.log(state.recipe);
});

window.l = new List();
