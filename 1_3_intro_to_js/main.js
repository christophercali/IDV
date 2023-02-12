console.log('hello world');

// - [ ] Create a page that counts the number of times a user has clicked a button. This should include an HTML button (`<button>`) and a counter display (this can be anything, like a `<div>`). This should do the following:
//   - [ ] The page starts with 0 in the counter display. 
//   - [ ] The button runs an `onclick` function that updates the number in the counter.
//   - **HINT:** you can either store the value in your javascript using `let`, or you can get the current value (`counter.innerText`) in order to add one to it. If you are getting a long string of numbers, check your [types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#data_structures_and_types). 
// - [ ] Push these changes up to your forked repository. You should see your commit and any code changes in the github repo. Confirm that you see your changes in the deployed site. Follow the details outlined in the [deploy and submit below](#deploy--submit) to recieve credit.

// - [ ] Use multiple inputs to get more than one piece of information, and save it in an [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object). 
// - [ ] Add a javascript library to your page, like d3.js, and play with the functions. 



// first starting by creating a variable for the button, so that we can use a click event to access it
let counterButton = document.getElementById("counterButton");
// now counterButton is literally the button from html code

// creating the function that will be called on the button click. 
function addButtonClick () {
// first we are creating a variable to retrieve the div tag that is holding the count. 
    let retrieve = document.getElementById("displayCount");
    // then we need another variable to turn the string into an integer
    let count = parseInt(retrieve.innerText, 10);
    // Now adding one to count actual clicks on the button. 
    count += 1;
    // we are now changing what we retrieved to equal the count
    retrieve.innerText = count;
}

// call the function with an event listener on click
counterButton.addEventListener("click", addButtonClick);

