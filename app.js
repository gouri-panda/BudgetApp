// BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value, title) {  //id, title, description and values are here 
        this.id = id;
        this.title = title;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };


    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };


    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };


    var Income = function (id, description, value, title) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.value = value;
    };


    var calculateTotal = function (type) { //total calculation function are here
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };


    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    // load data from sessionStorage if exists
    var exp = sessionStorage.getItem('exp');
    var inc = sessionStorage.getItem('inc');

    exp = exp ? JSON.parse(exp) : [];
    inc = inc ? JSON.parse(inc) : [];

    if (exp) {
        exp = exp.map((doc) => (new Expense(doc.id, doc.description, doc.value, doc.title)));
    }
    if (inc) {
        inc = inc.map((doc) => (new Income(doc.id, doc.description, doc.value, doc.title)));
    }

    data.allItems.exp = exp;
    data.allItems.inc = inc;

    return {
        getItems: function () {
            return data.allItems;
        },


        addItem: function (type, des, val, title) {  //add items function
            var newItem, ID;

            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val, title);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val, title);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Persist data in sessionStorage
            sessionStorage.setItem(type, JSON.stringify(data.allItems[type]));

            // Return the new element
            return newItem;
        },


        deleteItem: function (type, id) { //delete item function 
            var ids, index;

            // id = 6
            //data.allItems[type][id];
            // ids = [1 2 4  8]
            //index = 3

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

            sessionStorage.setItem(type, JSON.stringify(data.allItems[type]));
        },


        calculateBudget: function () {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

            // Expense = 100 and income 300, spent 33.333% = 100/300 = 0.3333 * 100
        },

        calculatePercentages: function () { //here's the percentage calculation

            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */

            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },


        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },


        getBudget: function () {
            this.calculateBudget();

            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },

        testing: function () {
            console.log(data);
        }
    };

})();


// UI CONTROLLER
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputTitle: '.add__title',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        currency: '.curr_type',
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


    const formatNumber = function (num, type) {
        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };


    const nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    const deactivateInputError = function (inputSelector) {
        const input = document.querySelector(inputSelector);
        input.classList.remove('--invalid');
    };


    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                title: document.querySelector(DOMstrings.inputTitle).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },


        activateInputError: function(inputSelector) {
            const input = document.querySelector(inputSelector);
            input.classList.add('--invalid');

            input.addEventListener('input', () => {
                deactivateInputError(inputSelector)
            }, { once: true });
        },


        renderListItems: function (data) {
            for (let i = 0; i < data.inc.length; i += 1) {
                this.addListItem(data.inc[i], 'inc');
            }
            for (let i = 0; i < data.exp.length; i += 1) {
                this.addListItem(data.exp[i], 'exp');
            }
        },


        addListItem: function (obj, type) {
            let html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <strong><div class="item__title">%title%</div></strong> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value% %currency%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"> <strong><div class="item__title">%title%</div></strong> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value% %currency%<div class="currency"> </div></div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%title%', obj.title);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            newHtml = newHtml.replace('%currency%', document.querySelector(DOMstrings.currency).value);

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },


        deleteListItem: function (selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },


        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputTitle + ', ' + DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },


        displayBudget: function (obj) {  //display budget function
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            var currency = document.querySelector(DOMstrings.currency).value
            if (obj.budget === 0) {
                document.querySelector(DOMstrings.budgetLabel).textContent = "0.00"
            } else {
                document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type) + currency
            }

            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc') + currency;
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp')+ currency;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },


        displayPercentages: function (percentages) {

            const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },


        displayMonth: function () {
            var now, months, month, year;

            now = new Date();
            //var christmas = new Date(2016, 11, 25);

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },


        changedType: function () {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputTitle + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },


        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();


// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.querySelector(DOM.currency).addEventListener('change', currencyChange);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };


    var updateBudget = function () {  //updation function here

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };


    var updatePercentages = function () {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var currencyChange = function () {
        UICtrl.displayBudget(budgetController.getBudget());
    }

    var ctrlAddItem = function () {
        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        // 2. Check if inputs are filled
        if (!input.title) {
            UICtrl.activateInputError(UICtrl.getDOMstrings().inputTitle);
        }

        if (!input.description) {
            UICtrl.activateInputError(UICtrl.getDOMstrings().inputDescription);
        }

        if (isNaN(input.value)) {
            UICtrl.activateInputError(UICtrl.getDOMstrings().inputValue);
        }

        if (input.title !== "" && !isNaN(input.value) && input.value > 0) {
            // 3. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value, input.title);

            // 4. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 5. Clear the fields
            UICtrl.clearFields();

            // 6. Calculate and update budget
            updateBudget();

            // 7. Calculate and update percentages
            updatePercentages();
        }
    };


    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };


    return {
        init: function () {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.renderListItems(budgetController.getItems());
            UICtrl.displayBudget(budgetController.getBudget());
            setupEventListeners();
        }
    };

})(budgetController, UIController);


controller.init();
