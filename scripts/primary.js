window.addEventListener("load", function () { //On window load, execute the following

    var templateDiv = Query("#templateDiv")
    var formContainer = Query("#form-container"); //Insert forms into container

    //On startup, setup generate and template tabs
    chrome.storage.local.get(["template"], function(result) { 
        //Set templateDiv 
        templateDiv.innerHTML = result.template;

        //Move the following into separate function
        insertInputBracketsInto(result.template, formContainer)
    });

    //Event triggers when we type into templateDiv
    templateDiv.addEventListener("input", (event) => {
        //As we type, save templateDiv value to storage
        chrome.storage.local.set({ template: event.target.innerHTML });

        //Attempt to inject input elements into formContainer
        insertInputBracketsInto(event.target.innerHTML, formContainer) 
    });


    //Setup to generate pdf
    var generateButton = Query("#generate-button")
    generateButton.onclick = async function() {
        //TODO: Need to go through all input elements, validate each one has a value first before generating PDF
        template = templateDiv.innerHTML; //Get contents of template div, keep formatting

        //Go through each input element under formContainer
        var allInputElements = Array.from(formContainer.querySelectorAll('input'))
        var allInputValues = allInputElements.map(input => input.value);
        var allPlaceholders = allInputElements.map(input => input.placeholder)
        for (let i = 0; i < allInputValues.length; i++) {
            const searchString = `\\[${allPlaceholders[i]}\\]`;
            const regex = new RegExp(searchString, 'g'); // Create a global regex to match all occurrences
            template = template.replace(regex, allInputValues[i]) //Replace template 
        }

        //Use html2pdf to generate the PDF
        const options = {
            margin: 1,
            filename: 'Cover_Letter.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(options).from(template).save(); //Save PDF to downloads folder
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

//Attempts to inject input elements from the given string into given container
function insertInputBracketsInto(string, container) {
    var matches = [...new Set(string.match(/\[([^\]]+)\]/g))]; //Returns unique values of items that match '[*]' regex
    container.innerHTML = ''; //Clear all elements in the container just in case

    //If any items are found inside [] brackets, add input element to form container on generate tab
    matches.forEach(field => {
        //Create a new input element
        const input = document.createElement('input');

        //Set attributes for the input
        input.type = 'text';
        input.className = 'form-control mb-3';
        input.placeholder = field.replaceAll('[', '').replaceAll(']', '');;

        //Add input element as a child to container
        container.appendChild(input);
    });
}

