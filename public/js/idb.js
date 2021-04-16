// hold db connection
let db;

// establish connection to indexedDB and set it to version 1
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_budget', { autoIncrement: true });
}

// upon success
request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadBudget();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
}

function saveRecord(record) {
    // open new transaction with database with readwrite permissions
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access object store for `new_budget`
    const budgetObjectStore = transaction.objectStore('new_budget');

    // add record to store with add method
    budgetObjectStore.add(record);
}

function uploadBudget() {
    // open transaction on db
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access object store
    const budgetObjectStore = transaction.objectStore('new_budget');

    // get all records from store and set to a variable
    const getAll = budgetObjectStore.getAll();

    // on a successful .getAll() execution run
    getAll.onsuccess = function() {
        //if data in indexedDB store, send to api server
        if(getAll.result.length > 0) {
            fetch("/api/transaction", {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                // open one more transaction
                const transaction = db.transaction(['new_budget'], 'readwrite');
                // access new_budget object store
                const budgetObjectStore = transaction.objectStore('new_budget');
                // clear all items in store
                budgetObjectStore.clear();

                alert('All saved budgets have been submitted!');
            })
            .catch(err => {
                console.log(err);
            })
        }
    }
}

// listen for network connection
window.addEventListener('online', uploadBudget);