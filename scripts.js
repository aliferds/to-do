// file: scripts.js

function toggleLightDarkMode() {
  const lightElements = document.querySelectorAll(".light");
  const modeToggle = document.getElementById("mode-toggle");
  const body = document.body;

  lightElements.forEach((element) => {
    element.classList.toggle("dark");
  });

  if (modeToggle) {
    modeToggle.classList.toggle("dark-mode");
  }


  if (body.classList.contains("dark")) {
    localStorage.setItem("mode", "dark");
  } else {
    localStorage.setItem("mode", "light");
  }
}

function applySavedLightDarkMode() {
    const savedMode = localStorage.getItem("mode");
    const body = document.body;
    const modeToggle = document.getElementById("mode-toggle");
    const lightElements = document.querySelectorAll(".light");

    if (savedMode === "dark") {
        body.classList.add("dark");
        if (modeToggle) {
            modeToggle.classList.add("dark-mode");
        }
        lightElements.forEach((element) => {
            if (!element.classList.contains("dark")) {
                element.classList.add("dark");
            }
        });
    } else {
        body.classList.remove("dark");
        if (modeToggle) {
            modeToggle.classList.remove("dark-mode");
        }
        lightElements.forEach((element) => {
            if (element.classList.contains("dark")) {
                element.classList.remove("dark");
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    applySavedLightDarkMode();

    const toggleButton = document.getElementById("mode-toggle");
    if (toggleButton) { 
        toggleButton.addEventListener("click", toggleLightDarkMode);
    }
});

// =============================================================================
// Verify bellow code for futher usage
// =============================================================================

const Modal = {
    open(){
        document.querySelector(".modal-overlay").classList.toggle("active")
    },
    close(){
        document.querySelector(".modal-overlay").classList.toggle("active")
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    },
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index , 1)

        App.reload()
    },
    incomes(){
        let income = 0;

        Transaction.all.forEach((transaction) => {
            if(transaction.amount > 0) {
                income += transaction.amount;
            }
        })

        return income;
    },
    expenses(){
        let expense = 0;

        Transaction.all.forEach((transaction) => {
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        })

        return expense;
    },
    total(){
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class=${CSSclass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <a href="#">
                    <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remover Transação" >
                </a>
            </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById("incomeDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById("expenseDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById("totalDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransaction() {
        DOM.transactionsContainer.innerHTML = ""
    },
}

const Utils = {
    formatAmount(value){
        return Math.round(value * 100)
    },
    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        // console.log(value + " chegou")
        value = String(value).replace(/\D/g, "")
        // console.log(value + " replace")

        value = Number(value) / 100
        // console.log(value + " Dividiu")

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
        Form.description.classList.remove('input-empty')
        Form.date.classList.remove('input-empty')
        Form.amount.classList.remove('input-empty')
    },

    submit(event){
        event.preventDefault()
        try{
            Form.validateField()
            const transaction = Form.formatData()
            // console.log(transaction)

            Transaction.add(transaction)

            Form.close()
        } catch (error) {
            alert(error.message)
        }
        Form.formatData()
    },
    close(){
        Form.clearFields()
        Modal.close()
    },
    validateField() {
        const {description, amount, date} = Form.getValues()
        if( description.trim() === "") {
            Form.description.classList.add('input-empty');
        }
        if( amount.trim() === "") {
            Form.amount.classList.add('input-empty');
        }
        if( date.trim() === "") {
            Form.date.classList.add('input-empty');
        }
        if( description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "" ) {
                throw new Error("Por favor, preencha todos os campos")
        }
    },
    formatData(){
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date,
        }

    },
}

const App = {
    init() {
        Transaction.all.forEach(function(transaction, index) {
            DOM.addTransaction(transaction, index)
            // console.log(transaction)
        })
        
        DOM.updateBalance()

        Storage.set(Transaction.all)

        if(Transaction.total() >= 0){
            document.querySelector(".card.total").classList.remove('negative');
            document.querySelector(".card.total").classList.add('positive');
        } else if(Transaction.total() < 0){
            document.querySelector(".card.total").classList.remove('positive');
            document.querySelector(".card.total").classList.add('negative');
        }
    },
    reload() {
        DOM.clearTransaction()
        App.init()
    },
}

App.init()