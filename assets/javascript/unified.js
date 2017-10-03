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
    var database = firebase.database();
    var authdata;
    var userID;
    var ingredientDB;
    var userDB;
    var queryDB;

    function updateUserData(userID) {
        ingredientDB = database.ref('users/' + userID+ '/ingredients');
        queryDB = database.ref('users/' + userID+ '/query');
        userDB = database.ref('users/' + userID);
    }
    if(authdata) {
        userID = authdata.userID;
        updateUserData(userID)
    } else{
        userID = "guest";
        updateUserData(userID)
    }

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            authdata = user;
            userID = user.uid;
            updateUserData(userID)
        }else {
            authdata = "guest";
            userID = "guest";
            updateUserData(userID)
        }
        console.log('handler ' + userID);
    });


    //Profile


    // Function to display and hide the profile menu when icon is clicked

    $("#profile").on("click", ".profile-icon", function () {
        $('.profile-menu').toggleClass("hidden");
        $('#profile-links').removeClass('hidden');
        $('#login-form').addClass('hidden');
        //display content based on whether there is a user signed in
        if (authdata !== "guest") {
            $('#sign-in').addClass('hidden');
            $('#user-display').text(authdata.email);
        } else {
            $('#sign-out').addClass('hidden');
            $('#favorites-link').addClass('hidden');
            $('#user-display').text('Sign In to view favorites');
        }

    });
    //Open Sign-in form
    $('#sign-in').click(function () {
        event.preventDefault();
        $('#profile-links').addClass('hidden');
        $('#login-form').removeClass('hidden');
        $('#user-display').addClass('hidden');
    });
    //create new account
    $('#create-account-link').click(function () {
        var email = $('#email').val();
        var password = $('#password').val();
        var errorCode;
        var errorMessage;
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors
            errorCode = error.code;
            errorMessage = error.message;
            if (errorCode ===  'auth/email-already-in-use' || errorCode === 'auth/invalid-email') {
                $('#email').after('<p>' + errorMessage + '<p>');
            }else{
                console.log(errorCode)
            }
        });
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            //Handle Errors
            errorCode = error.code;
            errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                $('#password').after('<p>' + errorMessage + '</p>');
            } else if (errorCode ===  'auth/invalid-email' || errorCode === 'auth/user-not-found') {
                alert(errorMessage);
                $('#email').after('<p>' + errorMessage + '</p>');

            } else {
                console.log(errorCode)
            }
        });
        $('#login-form').addClass('hidden');
        $('#profile-links').removeClass('hidden');
        $('#sign-in').addClass('hidden');
        $('#sign-out').removeClass('hidden');
        $('#user-display').removeClass('hidden');
        $('#user-display').text(authdata.email);
        $('#favorites-link').removeClass('hidden');

    });
    //Sign in
    $('#sign-in-link').click(function () {
        var email = $('#email').val();
        var password = $('#password').val();
        var errorCode;
        var errorMessage;
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            //Handle Errors
            errorCode = error.code;
            errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                $('#password').after('<p>' + errorMessage + '</p>');
            } else if (errorCode ===  'auth/invalid-email' || errorCode === 'auth/user-not-found') {
                alert(errorMessage);
                $('#email').after('<p>' + errorMessage + '</p>');

            } else {
                console.log(errorCode)
            }
        });
       if (!errorCode) {
           $('#login-form').addClass('hidden');
           $('#profile-links').removeClass('hidden');
           $('#sign-in').addClass('hidden');
           $('#sign-out').removeClass('hidden');
           $('#user-display').removeClass('hidden');
           $('#user-display').text(authdata.email);
           $('#favorites-link').removeClass('hidden');
       }

    });

    $('#sign-out').click(function () {
        firebase.auth().signOut().then(function() {
            $('#sign-in').removeClass('hidden');
            $('#sign-out').addClass('hidden');
            $('#user-display').text('Sign In to view favorites');
            $('#favorites-link').addClass('hidden');
        });
    });


    //input
    var ingredientDB = database.ref('users/' + userID+ '/ingredients');
    var userDB = database.ref('users/' + userID);
    var queryDB = database.ref('users/' + userID+ '/query');
    var currentList = [];
    var ingredient;
    var stopAddFunction = false;
    var displaySuggestionsModal = false;

    // Close Ingredient List Modal if return to search button clicked.
    $("#close-ingredient-suggestion-modal").click(function () {
        $('.ingredient-suggestion-modal').addClass("hidden");
    });

    // Function to check the spelling of the users input

    /*function spellChecker() {
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
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "de4d1f4575bf4481a4930fb826e36707");
            },
            type: "GET",
            // Request body
            data: "json",
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
    }*/

    // Function to add the ingredient to the firebase database

    function addIngredient(ingredient) {
        if (ingredient && currentList.indexOf(ingredient) < 0) {
            console.log(ingredient);
            //Push to ingredients list
            ingredientDB.push(ingredient);
            console.log(currentList);
            queryDB.set({array: currentList.join(',')});
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
        var ingredient = $("#ingredient-input").val().trim();
        //If field is not empty,
        console.log(ingredient);
        console.log(currentList.indexOf(ingredient));
        addIngredient(ingredient)

        /*if (typeof ingredient === 'undefined' || !ingredient) {
            console.log("null");
            stopAddFunction = true;
        }
        // Call function to check spelling of user's input
        if (stopAddFunction === false) {
            spellChecker();
        }*/
    });

    //Om click Suggestion Modal Add Ingredient button
    $("#add-ingredient-suggestion").click(function () {
        event.preventDefault();

        //Get user input
        ingredient = $("#ingredient-suggestion").val();
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
        userDB.child('/query').set({array: currentList.join(",")});
        //get name from firebase
        var key = snapshot.key;
        //Create list item with remove button and append
        //button
        var removeButton = $("<button>");
        removeButton.addClass('remove pure-button');
        removeButton.attr('data-key', key);
        removeButton.attr('data-item', value);
        removeButton.html("<i class='fa fa-times' aria-hidden='true'></i>");
        // List Item
        var li = $("<li>");
        li.addClass('ingredient');
        //append
        li.append(removeButton);
        li.append(value);
        $("#ingredient-list").append(li);
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
        $(this).closest('li').remove();
        //Remove from array
        var removeIndex = currentList.indexOf(removeItem);
        currentList.splice(removeIndex);
        ingredientDB.child(removeKey).remove();
        queryDB.set(currentList.join(","));
    });
/*
    // SEARCH

    //Define api Key
    var apiKey = '0477102d4a6901d3798f73c83ab84d90';
    //Determine which results to display:
    var startAt = 0;
    var endAt = 9;
    //Get Results
    //wait for value to populate
    var ranSerach = false;
    var wait = setInterval(waitForQuery, 500);
    function waitForQuery() {
        //check if query has value and search has not been run
        if (query && !ranSerach) {
            console.log(query);
            searchResults();
            ranSerach = true;
            //stop checking
            clearInterval(wait);
        }
        else {
            console.log('checked')
        }
    }
    //Get Results from API
    function searchResults() {
        var queryURL = 'https://gtproxy2.herokuapp.com/api/food2fork/search?key=' + apiKey + '&q=' + query;
        $.ajax({
            //parameters
            type: 'GET',
            url: queryURL,
            dataType: 'json'
        }).done(function (response) {
            console.log(response);
            var recipeList = response.recipes;
            //Write to Dom
            //clear table
            $('#recipe-table-body').empty();
            for (var i = startAt; i <= endAt; i++) {
                //Get recipe info
                var current = recipeList[i];
                var recipeID = current.recipe_id;
                //Write to DOM
                var newRow = $('<tr>');
                var newData = $('<td>');
                //title
                var title = current.title;
                //image
                var newImage = $('<img>');
                newImage.attr('src', current.image_url);
                newImage.attr('height', '50');
                newImage.attr('alt', title);
                //Source
                var sourceLink = $('<a>');
                sourceLink.attr('href', current.source_url);
                sourceLink.attr('target', '_blank');
                sourceLink.text(current.publisher);
                //ingredients
                var ingredientLink = $('<a>');
                ingredientLink.attr('href', recipeID);
                ingredientLink.text('Ingredients');
                ingredientLink.attr('data-url', current.source_url);
                ingredientLink.addClass('ingredient-link');
                newData.append(sourceLink);
                newRow.append(newData);
                //append
                newData.append(newImage, title, sourceLink, ingredientLink);
                newRow.append(newData);
                $('#recipe-table-body').append(newRow);
            };

        });
    };
    //Display Ingredients
    $(document).on('click', '.ingredient-link', function() {
        event.preventDefault();
        var target = event.target;
        var recipeID = $(target).attr('href');
        console.log(recipeID);
        //Get ingredients from API
        var recipeURL = 'https://gtproxy2.herokuapp.com/api/food2fork/get?&key=' + apiKey + '&rId=' + recipeID;
        $.ajax({
            //parameters
            type: 'GET',
            url: recipeURL,
            dataType: 'json'
        }).done(function (response) {
            console.log(response);
            console.log(recipeURL);
            var ingredientList = response.recipe.ingredients;
            console.log(ingredientList);
            //write to dom
            //set up elements
            var ingredientDiv = $('<div>');
            ingredientDiv.addClass('ingredient-;ist-modal modal-bg');
            var title = $('<h3>');
            title.text('Ingredients:');
            var list = $('<ul>');
            list.addClass('ingredient-list');
            list.text('Ingredients');
            ingredientDiv.append(list);
            //Pull results from response and write list
            for (var i = 0; i < ingredientList.length; i++) {
                var currentIngredient = ingredientList[i];
                console.log(currentIngredient);
                var item = $('<li>');
                item.text(currentIngredient);
                list.append(item)
            }
            //add link to recipe
            var sourceLink = $('<a>');
            sourceLink.attr('href', $(target).attr('data-url'));
            sourceLink.attr('target', '_blank');
            sourceLink.text('View Recipe Details');
            ingredientDiv.append(sourceLink);
            //add close button
            var closeButton = $('<button>');
            closeButton.addClass('ingredients-close pure-button');
            closeButton.text('Close List');
            ingredientDiv.append(closeButton);
            //Write to Dom
            $('.center').append(ingredientDiv);
        })
    });
    //close ingredient list;
    $(document).on('click', '.ingredients-close', function () {
        var target = event.target;
        $(target).closest('div').remove();
    }) */

});