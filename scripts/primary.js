window.addEventListener("load", function () { //On window load, execute the following

    var textArea = Query("#template-textarea")
    var formContainer = Query("#form-container"); //Insert forms into container

    //On startup, setup generate and template tabs
    chrome.storage.local.get(["template"], function(result) { 
        //Set textArea 
        textArea.value = result.template;

        var matches = getBracketedValues(result.template); //Returns unique values of items that match '[*]' regex
        matches.forEach(field => {
            // Create a new input element
            const input = document.createElement('input');

            // Set attributes for the input
            input.type = 'text';
            input.className = 'form-control mb-3';
            input.placeholder = field.replaceAll('[', '').replaceAll(']', '');;

            //Add input element as a child to form-container
            formContainer.appendChild(input);
        });
    });

    //When we type in the text area field
    textArea.addEventListener("input", (event) => {
        //As we type, save textarea value to storage
        chrome.storage.local.set({ template: event.target.value });

        //Parse string to find items inside [] brackets
        var matches = getBracketedValues(event.target.value); //Returns unique values of items that match '[*]' regex
        formContainer.innerHTML = ''; //Clear all elements in the container just in case

        //If any items are found inside [] brackets, add input element to form container on generate tab
        matches.forEach(field => {
            // Create a new input element
            const input = document.createElement('input');

            // Set attributes for the input
            input.type = 'text';
            input.className = 'form-control mb-3';
            input.placeholder = field.replaceAll('[', '').replaceAll(']', '');;

            //Add input element as a child to form-container
            formContainer.appendChild(input);
        });
        //formContainer.innerHTML = '<p>No items to input.<br />Please refer to instructions tab.</p>';
    });


    //Setup to generate pdf
    var generateButton = Query("#generate-button")
    generateButton.onclick = async function() {
        //Go through all input elements, validate each one has a value first
        console.log("Generate PDF");
    }
})


/////////////////// Helpers //////////////////
var Query = function(selector) { //Returns first found element
    return QueryAll(selector)[0]
}

var QueryAll = function(selector, element) { //Returns array of found elements
    element = element || document
    return [].slice.call(element.querySelectorAll(selector))
}

function getFromStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function(result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);  // Reject if there's an error
            } else {
                resolve(result); 
            }
        });
    });
}

function getBracketedValues(string) {
    return [...new Set(string.match(/\[([^\]]+)\]/g))];
}