// Budget Controller

var budgetController = (function(){
    var Incomes = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    var Expenses = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

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
    }
    return {
        addItem: function(type, des, val){
            var ID, newItem;
            //create new ID
            if(data.allItems[type].length>0){
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }else{
                ID = 0;
            }

            //Create new item based on 'inc' or 'exp' type
            if(type === 'inc'){
                newItem = new Incomes(ID, des, val);
            }else if(type === 'exp'){
                newItem = new Expenses(ID, des, val);
            }

            //Push it into data structures
            data.allItems[type].push(newItem);
            return newItem;
        },

        calculateBudget: function(){
            calculateTotal('inc');
            calculateTotal('exp');

            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc >0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
            }else{
                data.percentage = -1;
            }
            
            
        },
        getBudget: function(){
            return ({
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            });
        },

        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        testing: function(){
            console.log(data);
        }
    };

})();
// UI Controller

var UIController = (function(){

    // To get Input
    // Create objects to get the input, so that in future we dont have to change the 
    // variables in code ,if there is some change in UI class name
    
    var DOMStrings = {
        inputTypes: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    }

    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMStrings.inputTypes).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        displayBudget: function(obj){
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;
            
            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage+'%';
            }else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        // Exposing DOMstrings to public
        getDOMStrings: function(){
            return DOMStrings;
        },

        addListItem: function(obj, type){
            var html, newHtml, element;
            if(type === 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div> ';
            }else if(type === 'exp'){
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%prcntVal%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%prcntVal%', obj.prcntVal);
            newHtml = newHtml.replace('%value%', obj.value);
            //console.log('NEWhtml'+newHtml);
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            document.querySelector(DOMStrings.inputDescription).value = '';
            document.querySelector(DOMStrings.inputValue).value = '';
        },
    };

    
})();



//Global App Controller
var controller = (function(bdgtCtrl,uiCtrl){
    var DOM = uiCtrl.getDOMStrings();
    var setupEventListeners = function(){
        //var DOM = uiCtrl.getDOMStrings();
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
        if(event.keycode === 13 || event.which === 13){
            ctrlAddItem();
        }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function(){
        bdgtCtrl.calculateBudget();
        
        var budget = bdgtCtrl.getBudget();
        //console.log(budget);
        uiCtrl.displayBudget(budget);
    }


    var ctrlAddItem = function(){
        var input, newItem;
        //console.log(input);
        input = uiCtrl.getInput();
        // Add the item to the budget controller
        if((input.description === '') || (isNaN(input.value))){
            alert("Please enter expenses/incomes description and value : ");
        }else{
            newItem = bdgtCtrl.addItem(input.type, input.description, input.value);
            // Add the item to the UI
            uiCtrl.addListItem(newItem, input.type);

            //Clear fields
            uiCtrl.clearFields();

            updateBudget();
        }   

    }

    var ctrlDeleteItem = function(event){
        var itemId, splitId, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        //console.log(event.target.parentNode.parentNode.parentNode.parentNode);
        splitId = itemId.split('-');
        type = splitId[0];
        ID = parseInt(splitId[1]);
     
        // Delete from budget
        bdgtCtrl.deleteItem(type, ID);

        //delete item from list

        uiCtrl.deleteListItem(itemId);

        //Update budget
        updateBudget();
        
    }

    return {
        init: function(){
         //console.log('Event listener setup completed!!');
         uiCtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: 0
         });
         setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();