window.addEventListener("load", function () { //On window load, execute the following

    //On startup, set template textarea to what was previously saved
    var textArea = Query("#template-textarea")
    chrome.storage.local.get(["template"], function(result) {
        if (result.template != null) { //Only set if was have something previously saved
            textArea.value = result.template;
        }
    });

    //Save template to storage as we type
    textArea.addEventListener("input", (event) => {
        chrome.storage.local.set({ template: event.target.value });
    });


    //Setup to generate pdf
    var generateButton = Query("#generate-button")
    generateButton.onclick = async function() {
        var promise = await getFromStorage("template"); //Returns promise to get value of "template" from storage
        var template = promise.template
        //chrome.storage.local.clear();
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



