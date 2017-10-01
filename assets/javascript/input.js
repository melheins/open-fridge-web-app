$(document).ready(function () {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyANkZ57CA6LXADMNJJakfABMdHj8fR7ZuY",
        authDomain: "open-fridge-d8ce8.firebaseapp.com",
        databaseURL: "https://open-fridge-d8ce8.firebaseio.com",
        projectId: "open-fridge-d8ce8",
        storageBucket: "open-fridge-d8ce8.appspot.com",
        messagingSenderId: "906230734866"
    };
    firebase.initializeApp(config);

    var db = firebase.database();

    var ingredientDB = db.ref('/ingredients');
    var currentList = [];
    var ingredient;
    var stopAddFunction = false;
    var displaySuggestionsModal = false;

    // Close Ingredient List Modal if return to search button clicked.
    $("#close-ingredient-suggestion-modal").click(function () {
        $('.ingredient-suggestion-modal').addClass("hidden");
    });

    // Function to check the spelling of the users input
    function spellChecker() {
        var params = {
            // Request parameters
            "text": ingredient,
            "mode": "proof",
            "preContextText": "",
            "postContextText": "",
            "mkt": ""
        };
        $.ajax({
            url: "https://api.cognitive.microsoft.com/bing/v5.0/spellcheck/?" + $.param(params),
            beforeSend: function (xhrObj) {
                // Request headers
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "de4d1f4575bf4481a4930fb826e36707");
            },
            type: "GET",
            // Request body
            data: "json"
        })
            .done(function (response) {
                console.log(response);

                if (response.flaggedTokens.length > 0) {

                    var ingredientSuggestion = response.flaggedTokens[0].suggestions[0].suggestion;
                    console.log(ingredientSuggestion);

                    $('#ingredient-suggestion').append(ingredientSuggestion);

                    $('.ingredient-suggestion-modal').toggleClass("hidden");
                }
                else {
                    addIngredient();
                }
            });
    }

    // Function to add the ingredient to the firebase database
    function addIngredient() {
        if (ingredient && currentList.indexOf(ingredient) < 0) {
            //Push to ingredients list
            ingredientDB.push(ingredient);
            //Clear input
            $("#ingredient-input").val(" ");
        }
        else if (currentList.indexOf(ingredient) >= 0) {
            $("#ingredient-input").addClass('error')
        }
        else {
            $("#ingredient-input").addClass('error-text')
        }
    }

    //Om click Add Ingredient button
    $("#add-ingredient").click(function () {
        event.preventDefault();

        //Get user input
        ingredient = $("#ingredient-input").val();
        //If field is not empty,
        console.log(ingredient);
        console.log(currentList.indexOf(ingredient));

        if (typeof ingredient === 'undefined' || !ingredient) {
            console.log("null");
            stopAddFunction = true;
        }
        // Call function to check spelling of user's input
        if (stopAddFunction === false) {
            spellChecker();
        }
    });

    //Om click Suggestion Modal Add Ingredient button
    $("#add-ingredient-suggestion").click(function () {
        event.preventDefault();

        //Get user input
        ingredient = $("#ingredient-suggestion");
        //If field is not empty,
        console.log(ingredient);
        console.log(currentList.indexOf(ingredient));

        if (typeof ingredient === 'undefined' || !ingredient) {
            console.log("null");
            stopAddFunction = true;
        }
        // Call function to add ingredient to list
        if (stopAddFunction === false) {
            addIngredient();
        }
    });


    $(document).on("keyup", "#ingredient-input", function () {
        // if enter key hit
        if (event.which === 13) {
            //run search
            $("#add-ingredient").click();
        }
    });
    //Update List with firebase data
    ingredientDB.on('child_added', function (snapshot) {
        //Get value from Firebase
        var value = snapshot.val();
        //Push to array
        currentList.push(value);
        //get name from firebase
        var key = snapshot.key;
        //Create list item with remove button and append
        //button
        var removeButton = $("<button>");
        removeButton.addClass('remove pure-button');
        removeButton.attr('data-key', key);
        removeButton.attr('data-item');
        console.log(name);
        removeButton.html("<i class='fa fa-times' aria-hidden='true'></i>");
        // List Item
        var li = $("<li>");
        li.addClass('ingredient');
        //append
        li.append(removeButton);
        li.append(value);
        $("#ingredient-list").append(li);


        console.log(currentList);
    });
    //on click
    //$(document).click('.remove', function (event) {
    $('ul#ingredient-list').on("click", ".remove", function (event) {
        //Retrieve data
        var removeKey = $(this).attr('data-key');
        var removeItem = $(this).attr('data-item');
        console.log(removeKey);
        console.log(removeItem);
        //remove from firebase
        ingredientDB.child(removeKey).remove();
        //Remove li
        clicked.closest('li').remove();
        //Remove from array
        var removeIndex = currentList.indexOf(removeItem);
        currentList.splice(removeIndex)
    });
});