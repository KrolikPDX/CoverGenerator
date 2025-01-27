window.addEventListener("load", function () { //On window load, execute the following

    var templateDiv = Query("#templateDiv")
    var formContainer = Query("#form-container"); //Insert forms into container

    //On startup, setup 'generate' and 'template' tabs
    chrome.storage.local.get(["template"], function(result) { 
        templateDiv.innerHTML = result.template;
        setupInputElementsFrom(result.template, formContainer)
    });

    //Event triggers when we type into templateDiv
    templateDiv.addEventListener("input", (event) => {
        //As we type, save templateDiv value to storage
        chrome.storage.local.set({ template: event.target.innerHTML });

        //Inject input elements into formContainer if any are formed from template
        setupInputElementsFrom(event.target.innerHTML, formContainer) 
    });


    //Generate button on click - attempt to generate PDF
    Query("#generate-button").onclick = async function() {
        var allInputElements = Array.from(formContainer.querySelectorAll('input'))

        //Invalidate (enables error div) input elements that do not contain a value
        allInputElements.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });

        //Generate PDF if all input elements are valid
        const hasInvalidInputs = allInputElements.some((input) => input.classList.contains('is-invalid'));
        if (!hasInvalidInputs) {
            template = templateDiv.innerHTML; //Get contents of template div, keep formatting

            //Go through each input element under formContainer
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
                //Add input element (with checkbox) for custom cover letter filename
                filename: 'Cover_Letter.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().set(options).from(template).save(); //Save PDF to downloads folder
        }
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
function setupInputElementsFrom(string, container) {
    var matches = getSquareBracketMatches(string); //Returns unique values of items that match '[*]' regex
    container.innerHTML = ''; //Clear all elements in the container just in case

    //If any items are found inside [] brackets, add input element to form container on generate tab
    matches.forEach((field, index) => {
        //For errorDiv to work properly, they must all be separated
        const divParent = document.createElement('div');
        index == 0 ? divParent.className = '' : divParent.className = 'pt-3';

        //Create input element 
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control';
        input.placeholder = field.replaceAll('[', '').replaceAll(']', '');;

        //Create new error div that will throw error if input element if not filled
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.innerText = `${input.placeholder} is required.`;

        //Add input and error element as a child to divParent, add divParent as a child of the form container
        container.appendChild(divParent);
        divParent.appendChild(input);
        divParent.appendChild(errorDiv);
    });
}

function getSquareBracketMatches(string) {
    return [...new Set(string.match(/\[([^\]]+)\]/g))];
}