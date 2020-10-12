import uniqid from 'uniqid'

export default class List {
    constructor() {
        this.items = [];
    }

    addItem(count, unit, ingredients) {
        const item = {
            id:uniqid(),
            count,
            unit,
            ingredients
        }
        this.items.push(item);
        return item;
    }

    deleteItem(id) {
        const index = this.items.findIndex(el => el.id === id);

        //[2,4,8] -> splice(1,1) -> return 4 and orignal array [2,8]
        //[2,4,8] -> slice(1,2) -> return 4 and orignal arrau [2,4,8]
        this.items.splice(index,1);
    }

    updateItem(id, newCount) {
        this.items.find(el => el.id === id).count = newCount;
    }
}