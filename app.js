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
                let newItem, id;
                if (data.allItems[type].length > 0) {

                    id = data.allItems[type][data.allItems[type].length - 1] + 1; // last id +1
                } else {
                    id = 0;
                }

                if (type === 'exp') {
                    newItem = new Expanse(id, des, value);
                } else if (type === 'inc') {
                    newItem = new Income(id, des, value);
                }
                data.allItems[type].push(newItem);
                return newItem;
            },
            totalIncome: function (type) {
                let totalValue = 0;
                if (type === 'exp') {
                    data.allItems.exp.forEach(current => {
                        totalValue += current
                    });

                } else {
                    data.allItems.inc.forEach(current => {
                        totalValue += current
                    })
                }
                console.log('totalvalue '+ totalValue);
                return totalValue
            }
        }

    }
)();

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
                value: parseFloat(document.querySelector(DomStrings.value).value),
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
        }
    });
    return {
        addItem: function () {
            let input = UiController.getInput();
            if (input.description !== '' && !isNaN(input.value)) {
                let newItem = budgetController.addItem(input.type, input.description, input.value);
                uiController.addListItem(input.type, newItem);
                this.clearFields();
                this.updateBudget();
                console.log(newItem)
            }
        },
        clearFields: function () {
            let queryAll = document.querySelectorAll(DomStrings.description + ',' + DomStrings.value);
            queryAll.forEach(current => {
                current.value = ""
            });
            document.querySelector(DomStrings.description).focus()

        },
        updateBudget: function () {
            let totalIncome = document.querySelector('.budget__income--value');
            console.log('textcontent' + budgetController.totalIncome('inc'));
            console.log('textcontent' + budgetController.totalIncome('exp'));
            totalIncome.textContent = budgetController.totalIncome().toString()
        }

    };


})(budgetController, UiController);
// budgetController.publicTest(4);
