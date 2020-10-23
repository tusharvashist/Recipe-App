import axios from 'axios';


export default class Recipe {
    constructor(id)  {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.img = res.data.recipe.image_url;
            this.ingredients = res.data.recipe.ingredients;
            this.author = res.data.recipe.publisher;
            this.url = res.data.recipe.source_url;
        }
        catch(error) {
            console.log(error);
        }
    }

    calTime() {
        const numIng = this.ingredients.length;
        const period = Math.ceil(numIng/3);
        this.time = period*15;
    }

    calServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitLong = ['tablespoons', 'tablespoon', 'teaspoons', 'teaspoon', 'ounces', 'ounce', 'cups', 'pounds'];
        const unitShort = ['tbsp', 'tbsp', 'tsp', 'tsp', 'oz', 'oz', 'cup', 'pound'];
        const units = [...unitShort, 'kg', 'g'];
        
        const newIngredients = this.ingredients.map(el => {
            //1 change units into similar strings
            let ingredient = el.toLowerCase();
            unitLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitShort[i])
            })
            
            //2 remove paranthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');
    
            //3 parse ingridents into amount, unit and ingridents
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;
            if(unitIndex > -1) {
                //this is a unit
                //ex. 4 1/2 cup of water, countArr = ['4', '1/2']
                //ex. 4 cup of w(ater, countArr = ['4']
                const countArr = arrIng.slice(0, unitIndex);

                let count;
                if(countArr.length == 1) {
                    count = eval(arrIng[0].replace('-', '+')).toFixed(1);
                }else {
                    count = eval(arrIng.slice(0,unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex+1).join(' ')
                }

            } else if(parseInt(arrIng[0], 10)) {
                //thier is no unit but first element is number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            } else if (unitIndex == -1) {
                //no unit no number
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings(type) {
        //Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        //Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings/this.servings);
        });

        this.servings = newServings;
    }
}