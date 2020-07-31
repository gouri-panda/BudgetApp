console.log('starting');
let budgetController = (function () {
    let Expanse = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    let Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        }

    };
    return {
        addItem: function (type, des, value) {
            console.log('value ' + value);
            let newItem, id;
            if (data.allItems[type].length > 0) {

                id = data.allItems[type][data.allItems[type].length - 1] + 1; // last id +1
            } else {
                id = 0;
            }

            if (type === 'exp') {
                newItem = new Expanse(id, des, value);
                console.log('add expanse')
            } else if (type === 'inc') {
                newItem = new Income(id, des, value);
                console.log('add income')
            }
            data.allItems[type].push(newItem);
            return newItem;
        },

        testing: function () {
            console.log(data)
        }


    }

})();

let DomStrings = {
    inputType: '.add__type',
    description: '.add__description',
    value: '.get_value',
    addButton: '.add__btn',
    incomeContainer: '.income__list',
    expanseContainer: '.expenses__list'
};
let UiController = (function () {

    return {
        getInput: function () {
            return {
                type: document.querySelector(DomStrings.inputType).value, //+ or - income or expanse
                description: document.querySelector(DomStrings.description).value,
                value: document.querySelector(DomStrings.value).value,
            }
        },
        addListItem: function (type, obj) {
            let html, newHtml, element;

            if (type === 'inc') {
                element = DomStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+%v%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DomStrings.expanseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">-%v%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            console.log('value ' + obj.value);
            newHtml = newHtml.replace('%v%', obj.value);
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml)
        }
    }

})();
let controller = (function (budgetController, uiController) {
    document.querySelector(DomStrings.addButton).addEventListener('click', function () {
        controller.addItem()
    });
    let xdff;
    document.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            controller.addItem();
            console.log('enter pressed')
        }
    });
    return {
        addItem: function () {
            console.log('init');
            let input = UiController.getInput();
            let newItem = budgetController.addItem(input.type, input.description, input.value);
            uiController.addListItem(input.type, newItem);
            this.clearFields();
            console.log(newItem)
        },
        clearFields: function () {
            let queryAll = document.querySelectorAll(DomStrings.description + ',' + DomStrings.value);
            queryAll.forEach(current => {
                console.log(current);
                current.value = ""
            });
            document.querySelector(DomStrings.description).focus()

        }
    };


})(budgetController, UiController);
// budgetController.publicTest(4);
