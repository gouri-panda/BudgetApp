console.log('starting');
let budgetController = (function () {
        let Expense = function (id, description, value) {
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
                inc: [200,300,500]
            },
            total: {
                exp: 0,
                inc: 0
            },
            budget: 0,
            percentage: -1

        };
        let calculateTotal = function(type) {
            let sum = 0;
            data.allItems[type].forEach(function(cur) {
                sum += cur.value;
            });
            data.total[type] = sum;
        };
        Expense.prototype.calcPercentage = function(totalIncome) {
            if (totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
            } else {
                this.percentage = -1;
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
                    newItem = new Expense(id, des, value);
                } else if (type === 'inc') {
                    newItem = new Income(id, des, value);
                }
                data.allItems[type].push(newItem);
                return newItem;
            },
            calculateBudget: function() {

                // calculate total income and expenses
                calculateTotal('exp');
                calculateTotal('inc');

                // Calculate the budget: income - expenses
                data.budget = data.totals.inc - data.totals.exp;

                // calculate the percentage of income that we spent
                if (data.total.inc > 0) {
                    data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                } else {
                    data.percentage = -1;
                }

                // Expense = 100 and income 300, spent 33.333% = 100/300 = 0.3333 * 100
            },

            calculatePercentages: function() {


                data.allItems.exp.forEach(function(cur) {
                    cur.calcPercentage(data.totals.inc);
                });
            },
        }

    }
)();


let DomStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
};
let UiController = (function () {

    return {
        getInput: function () {
            return {
                type: document.querySelector(DomStrings.inputType).value, //+ or - income or expense
                description: document.querySelector(DomStrings.description).value,
                value: parseFloat(document.querySelector(DomStrings.value).value),
            }
        },
        addListItem: function (type, obj) {
            let html, newHtml, element;

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
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
    document.querySelector(DomStrings.container).addEventListener('click',(event)=>{
        console.log('container clicked event = '+ event)
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
            totalIncome.textContent = budgetController.calculateBudget()
        }

    };


})(budgetController, UiController);
// budgetController.publicTest(4);
