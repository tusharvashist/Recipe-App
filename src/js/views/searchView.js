import {elements} from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value ='';
}

export const clearResults = () => {
    elements.resultList.innerHTML = '';
    elements.resultPage.innerHTML = '';
}

export const highlightSelected = id => {
    const arrayList = Array.from(document.querySelectorAll('.results__link'));
    arrayList.forEach(el=> {
        el.classList.remove('results__link--active');
    })
    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
};

export const limitRecipeTitle = (title, limit=17) => {
    const newTitle = [];

    if(title.length > limit) {
        title.split(' ').reduce((acc,cur) => {
            if(acc+cur.length<=limit){
                newTitle.push(cur);
            }
            return acc+cur.length;
        }, 0);
        return `${newTitle.join(' ')} ...`;
    }
    return title;
}

const renderRecipes = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `
    elements.resultList.insertAdjacentHTML("beforeend", markup);
};

const displayButton = (page, type) => 
`
<button class="btn-inline results__btn--${type}" data-goto= ${type=='prev'?page-1:page+1}>
    <span>Page ${type=='prev'?page-1:page+1}</span>
    <svg class="search__icon">
        <use href="img/icons.svg#icon-triangle-${type=='prev'?'left':'right'}"></use>
    </svg>
</button>
`;

const renderButtons = (numResults, page=1, resPerPage=10) => {
    const pages = Math.ceil(numResults/resPerPage);

    let button;
    if(page==1 && pages > 1){
        //Only button to next
        button = displayButton(page, 'next');
    } else if(page < pages){
        //Both Button next & prev
        button = `
        ${displayButton(page, 'prev')}
        ${displayButton(page, 'next')}
        `
    } else if(page==pages && pages > 1){
        //Only button to prev
        button = displayButton(page, 'prev');
    }

    elements.resultPage.insertAdjacentHTML("afterbegin", button);
}

export const renderResults = (recipes, page =1, resPerPage=10) => {
    //Render results
    const start = (page-1)*resPerPage;
    const end = page*resPerPage;
    recipes.slice(start,end).forEach(renderRecipes);

    //Render Pagination
    renderButtons(recipes.length, page, resPerPage);
}