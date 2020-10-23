import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
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
             recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
         } catch (error) {
             console.log(error);
             alert ('error in recipe controller');
             clearLoader();
         }
     }
};

//window.addEventListener('hashchange', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/***List Controller */
const controlList = () => {
    //create list if their is no list present
    if(!state.list) state.list = new List();

    //add items to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renserItem(item);
    });
}

//handling delete and update button in shopping list cart
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handle delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);
        //delete from UI
        listView.deleteItem(id);

        //handle update count
    } else if (e.target.matches('.shopping__count-value')) {
        const val = e.target.value;
        if(val>1) state.list.updateCount(id, val);
    }

})

/***Like Controller */

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;

    //If current recipe is NOT likes
    if (!state.likes.isLiked(currentId)) {
        //Add current recipe in state
        const newLike = state.likes.addLikes(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
            );

        //toggle like button
        likesView.toggelLikeBtn(true);

        //add recipe to like UI list
        likesView.renderLike(newLike);

    //If current recipe is likked
    } else {
        //Remove current recipe from state
        state.likes.deleteLikes(currentId);

        //toggle like button
        likesView.toggelLikeBtn(false);

        //remove recipe to like UI list
        likesView.renderDelLike(currentId);
    }

    likesView.toggleLikesMenu(state.likes.getNumLikes());
};

//Restore likes on refreshed page
window.addEventListener('load', () => {
    state.likes = new Likes();

    //restore likes
    state.likes.readStorage();

    //toggle like button
    likesView.toggleLikesMenu(state.likes.getNumLikes());

    //render likes
    state.likes.likes.forEach(like => likesView.renderLike(like));

});

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
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //add ing to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //Likes controller
        controlLike();
    }
});
