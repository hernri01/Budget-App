    // BUDGET CONTROLLER>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    var budgetController = (function() {
        
        var Expense = function(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        };
        
        Expense.prototype.calcPercentage = function(totalIncome)
        {
            if(totalIncome > 0)
            {
                this.percentage = Math.round((this.value/totalIncome)*100);
            }
            else 
            {
                this.percentage = -1;
            }
        };

        Expense.prototype.getPercentage = function()
        {
            return this.percentage;
        }

        var Income = function(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        };

        var calculateTotal = function(type)
        {
            var sum = 0; 

            // the for each loop in javascript is a little weird
            data.allItems[type].forEach(function(cur)
            {
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
     
        return {
            addItem: function(type, des, val) {
                var newItem, ID;

                if(data.allItems[type].length > 0)
                {   
                    ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
                }
                else 
                {
                    ID = 0;
                }
                if (type === "exp") {
                    newItem = new Expense(ID, des, val);
                } else if (type === "inc") {
                    newItem = new Income(ID, des, val);
                }
                data.allItems[type].push(newItem);
                return newItem;
            },

            deleteItem: function(type, id)
            {
                var ids, index;
                // id = 3
                // ids = [ 1 2 3 4 5]
                ids = data.allItems[type].map(function(current)
                {
                    return current.id;
                });

                index = ids.indexOf(id);

                if(index !== -1)
                {
                    data.allItems[type].splice(index, 1);
                }
                
            },

            calcBudget: function()
            {
                //Total income and total expenses 
                calculateTotal("exp");
                calculateTotal("inc");
                // THen income - expenses = budget
                data.budget = data.totals.inc - data.totals.exp;
                //Calculate the percentage of income that we spent

                if(data.totals.inc > 0 )
                {
                    data.percentage = Math.round(data.totals.exp/data.totals.inc * 100);
                }
                else 
                {
                    data.percentage = -1;
                }
                
            },

            calculatePercentages: function()
            {
                /**
                 *  a = 20 
                 *  b = 10 
                 * c = 40
                 * income = 100 
                 * a = 20/100 = 20 % 
                 * b = 10/100
                 * c = 40%
                 */
                data.allItems.exp.forEach(function(cur)
                {
                    cur.calcPercentage(data.totals.inc);
                });
            },

            getPercentages: function()
            {
                 var allPerc = data.allItems.exp.map(function(cur)
                 {
                    return cur.getPercentage();
                 });
                 return allPerc;
            },

            getBudget: function()
            {
                return {
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage
                }
            },

            testing: function(){
                console.log(data);
            },
        };
    })();
     
     
     
     
    // no interaction between these 2 modules
     
     
    // UI CONTROLLER>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    var UIController = (function() {
     
        var DOMstrings = {
            inputType: ".add__type",
            inputDescription: ".add__description",
            inputValue: ".add__value",
            inputBtn: ".add__btn",
            incomeContainer: ".income__list",
            expensesContainer: ".expenses__list",
            budgetLabel: ".budget__value",
            incomeLabel: ".budget__income--value",
            expenseLabel: ".budget__expenses--value",
            percentLabel: ".budget__expenses--percentage",
            container: ".container",
            expensesPercLabel: ".item__percentage",
            dateLabel: ".budget__title--month"
        };

        var formatNumber = function(num, type)
        {
            var numSplit;
            num = Math.abs(num);
            num = num.toFixed(2); //Always puts exactly two decimal numbers
            
            numSplit = num.split(".");

            int = numSplit[0];

            if(int.length > 3) // More than a thousand and will need a comma 
            {
                int = int.substr(0,int.length - 3) + "," + int.substr(int.length - 3, 3); // input 2310, output 2,310
            }

            dec = numSplit[1];

            

            return (type === "exp" ? sign = "-": sign = "+" )+ " " + int + "." + dec;


        };

        var nodeListForEach = function(list, callback)
        {
            for(var i = 0; i < list.length; i++)
            {
                callback(list[i], i );
            }
        };
     
        return {
            getInput: function() {
                return {
                    type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                    description: document.querySelector(DOMstrings.inputDescription).value,
                    value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
                };           
            }, 

            addListItem: function(obj, type)
            {
                var html, newHtml,element;
                //Create an HTML string with placeholder text 

                //Income 
                if(type === "inc")
                {
                    element = DOMstrings.incomeContainer;
                    html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
                else if(type === "exp")
                {

                    element = DOMstrings.expensesContainer;
                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

                }
                
                //Replace the placeholder text with some actual data 

                newHtml = html.replace('%id%',obj.id);
                newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
                newHtml = newHtml.replace('%description%', obj.description);

                //Insert the HTML into the DOM  


                //WIll be added to the end of this lsit. THis is basically like adding a child to the list.
                document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
            },

            deleteListItem: function(selectorID)
            {
                var el = document.getElementById(selectorID);
                el.parentNode.removeChild(el)
            },
     
            getDOMstrings: function() {
                return DOMstrings;
            },

            displayMonth: function()
            {
                var now, year, month, day, months;
                now = new Date();

                // var christmas = new Date(2016, 11, 25)

                months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "November", "December"];

                day = now.getDate();
                month = now.getMonth();
                year = now.getFullYear();
                document.querySelector(DOMstrings.dateLabel).textContent = months[month]+ " " + day + " " + year;

            },

            clearInput: function()
            {
                var fields;
                //returns a list 
                fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);

                //Will return an array because fields in itself will return a list so that is why we do this.
                var fieldsArr = Array.prototype.slice.call(fields);

                fieldsArr.forEach(function(cur, i, arr)
                {
                    cur.value = "";
                    cur.description = "";
                });

                // Will focus on the description again
                fieldsArr[0].focus();
            },

            displayBudget: function(obj)
            {
                var type;
                obj.budget > 0 ? type = "inc": type = "exp"
                document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
                document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
                document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, "exp");

                if(obj.percentage > 0 )
                {
                    document.querySelector(DOMstrings.percentLabel).textContent = obj.percentage + "%";
                }
                else 
                {
                    document.querySelector(DOMstrings.percentLabel).textContent = "----"; 
                }
            }, 

            displayPercentages: function(percentages)
            {
                var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

                nodeListForEach(fields, function(current, index)
                {  
                    if(percentages[index] > 0 )
                    {
                        current.textContent = percentages[index] + "%";
                    }
                    else 
                    {
                        current.textContent = "---";
                    }

                });
            },

            changedType: function()
            {
                var fields = document.querySelectorAll(
                    DOMstrings.inputType + "," + DOMstrings.inputDescription + "," + DOMstrings.inputValue
                    );
                nodeListForEach(fields, function(cur){
                    cur.classList.toggle("red-focus");
                });

                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            }
        }

    })();
     
     
     
     
    // GLOBAL APP CONTROLLER>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    var controller = (function(budgetCtrl, UICtrl) {
        
        var setupEventListeners = function () {
           
            var DOM = UICtrl.getDOMstrings();
        //class selector from html
            document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
     
            document.addEventListener("keypress", function(event) {
     
            if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
            }
     
        });

        document.querySelector(DOM.container).addEventListener("click", ctrDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
        };

        var updatePercentages = function()
        {
            // calculate the percentages
            budgetCtrl.calculatePercentages();

            //read percent from the budget controller 
            var percentages = budgetCtrl.getPercentages();
            // update the UI with the new percentages
            UICtrl.displayPercentages(percentages);
        };
        var updateBudget = function() {      
            // 1. calculate the budget
            budgetCtrl.calcBudget();
            // 2. return the budget
            var budget = budgetCtrl.getBudget();
            // 3. display the budget on the ui
            UICtrl.displayBudget(budget);
        };
        var ctrlAddItem = function() {
     
            var input, newItem, 
            // 1. get the field input data
            input = UICtrl.getInput();
            // 2. add the item to the budget controller
            if(input.description.length > 0 && !isNaN(input.value) && input.value > 0)
            {
                newItem = budgetCtrl.addItem(input.type,input.description,input.value);
                // 3. add the item to the ui
                UICtrl.addListItem(newItem,input.type);
    
                // Clear the fields 
                UICtrl.clearInput();
    
                //Calculate and update budget
                updateBudget();

                //calculate and update percentages
                updatePercentages();
            }
        };

        var ctrDeleteItem = function(event)
        {
            //This will get the item ID only if it is defined
            var itemID,splitId,type, ID;

            itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

            if(itemID)
            {
                //inc- 1
                splitID = itemID.split('-');
                type = splitID[0];
                ID = parseInt(splitID[1]) ;

                //Delete the item from the data structure. 
                budgetCtrl.deleteItem(type, ID);

                //Then we delete the item from the UI. 
                UICtrl.deleteListItem(itemID);

                //Update to show new budget and totals.
                updateBudget();

                updatePercentages();
            }
        };
        
        return {
            init: function() {
                console.log("Aplication has started");
                UICtrl.displayMonth();
                UICtrl.displayBudget(  {
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1});
                setupEventListeners();
            }
        }
    })(budgetController, UIController); //() at end invokes funcion immediately
     
    controller.init();