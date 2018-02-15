$(document).ready(function () {
    //---SETUP---//
    var config = {
        apiKey: "AIzaSyD2O5qhmQjwMzluyuN_DXhh0ClGaCMjNws",
        authDomain: "open-fridge-8b9a8.firebaseapp.com",
        databaseURL: "https://open-fridge-8b9a8.firebaseio.com",
        projectId: "open-fridge-8b9a8",
        storageBucket: "open-fridge-8b9a8.appspot.com",
        messagingSenderId: "1039166598076"
    };
    //Initialize firebase if not already running
    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }
    //Set up user-based variables
    var database = firebase.database();
    var commentsDB = database.ref('comments');
    var authdata = firebase.auth().currentUser;
    var userID;
    var ingredientDB;
    var userDB;
    var queryDB;
    var userComments;
    var isAnonymous;
    //Wait for authdata to be defined
    var userFound = false;
    var waiting = setInterval(waitforUser, 250);

    function waitforUser() {
        //check if authdata has value and search has not been run
        if (authdata && !userFound) {
            //Update user info
            updateUserData();
            clearInterval(waiting);
            userFound = true;
        } else {
            authdata = firebase.auth().currentUser;
        }
    }
    //Update database refs with current user info
    function updateUserData() {
        isAnonymous = authdata.isAnonymous;
        userID = authdata.uid;
        ingredientDB = database.ref('users/' + userID + '/ingredients');
        queryDB = database.ref('users/' + userID + '/query');
        userDB = database.ref('users/' + userID);
        userComments = database.ref('users/' + userID + '/comments');
    }
    //Listen for changes in auth state and update info
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            authdata = user;
            updateUserData();
            updateList();
        } else {
            firebase.auth().signInAnonymously();
        }
    });


    //---PROFILE/LOGIN---//


    // Function to display and hide the profile menu when icon is clicked
    $('#profile').on('click', '.profile-icon', function () {
        $('.profile-menu').toggleClass('hidden');
        $('#profile-links').removeClass('hidden');
        $('#login-form').addClass('hidden');
        //display content based on whether there is a user signed in
        if (!isAnonymous) {
            $('#sign-in').addClass('hidden');
            $('#facebook').addClass('hidden');
            $('#user-display').text(authdata.email);
        } else {
            $('#sign-out').addClass('hidden');
            $('#favorites-link').addClass('hidden');
            $('#facebook').removeClass('hidden');
            $('#user-display').text('Sign In to view favorites');
        }

    });
    //Open Sign-in form
    $('#sign-in').click(function () {
        event.preventDefault();
        //Display form
        $('#profile-links').addClass('hidden');
        $('#login-form').removeClass('hidden');
        $('#user-display').addClass('hidden');
    });
    //Create account
    $('#create-account-link').click(function () {
        //Get values from form
        var email = $('#email').val();
        var password = $('#password').val();
        var errorCode;
        var errorMessage;
        //Create firebase user
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
            // Handle Errors
            errorCode = error.code;
            errorMessage = error.message;
            if (errorCode === 'auth/email-already-in-use' || errorCode === 'auth/invalid-email') {
                $('#email').after('<p>' + errorMessage + '<p>');
            } else {
                console.log(errorCode)
            }
        });
    });
    //Sign in
    $('#sign-in-link').click(function () {
        //Get values from form
        var email = $('#email').val();
        var password = $('#password').val();
        var errorCode;
        var errorMessage;
        //Sign in to firebase
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
            //Handle Errors
            errorCode = error.code;
            errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                $('#password').after('<p>' + errorMessage + '</p>');
            } else if (errorCode === 'auth/invalid-email' || errorCode === 'auth/user-not-found') {
                alert(errorMessage);
                $('#email').after('<p>' + errorMessage + '</p>');
            } else {
                console.log(errorCode)
            }
        });
        //On successful sign in, update profile display
        if (!errorCode) {
            $('#login-form').addClass('hidden');
            $('#profile-links').removeClass('hidden');
            $('#sign-in').addClass('hidden');
            $('#sign-out').removeClass('hidden');
            $('#user-display').removeClass('hidden');
            $('#user-display').text(authdata.email);
            $('#favorites-link').removeClass('hidden');
            $('#facebook').addClass('hidden')
        }
    });
    //Sign in with facebook
    $("#facebook").on('click', function () {
        //open facebook popup for login
        var errorCode;
        var provider = new firebase.auth.FacebookAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function (result) {
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            authdata = result.user;
            updateUserData()
            // ...
        }).catch(function (error) {
            // Handle Errors here.
            errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
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
    //Sign Out
    $('#sign-out').click(function () {
        //Update profile display
        firebase.auth().signOut().then(function () {
            $('#sign-in').removeClass('hidden');
            $('#facebook-sign-in').removeClass('hidden');
            $('#sign-out').addClass('hidden');
            $('#user-display').text('Sign In to view favorites');
            $('#favorites-link').addClass('hidden');
        });
    });


    //----INPUT----//


    //Input variables
    var currentList = [];
    var ingredient;
    //Click Add Ingredient button
    $('#add-ingredient').click(function () {
        event.preventDefault();
        //Get user input
        var ingredient = $('#ingredient-input').val().trim().toLowerCase();
        //If field is not empty, run spell check
        if (ingredient) {
            spellChecker(ingredient);
        } else {

        }
    });
    //Run on click if enter key hit
    $(document).on('keyup', '#ingredient-input', function () {
        // if enter key hit
        if (event.which === 13) {
            //run search
            $('#add-ingredient').click();
        }
    });

    //Check spelling through Bing search and suggest alternatives
    function spellChecker(ingredient) {
        // Request parameters
        var params = {
            'text': ingredient,
            'mode': 'proof',
            'preContextText': '',
            'postContextText': '',
            'mkt': ''
        };
        //Request info from Bing
        $.ajax({
            url: 'https://api.cognitive.microsoft.com/bing/v7.0/spellcheck/?' + $.param(params),
            beforeSend: function (xhrObj) {
                // Request headers
                xhrObj.setRequestHeader('Ocp-Apim-Subscription-Key', 'ca503457436f47bba9f0a6966b7a376a');
            },
            type: 'GET',
            // Request body
            data: 'json'
        }).done(function (response) {
            //Check for suggested spellings
            if (response.flaggedTokens.length > 0) {
                //Show first suggestion in modal
                var ingredientSuggestion = response.flaggedTokens[0].suggestions[0].suggestion;
                //Write Suggestion to DOM and show modal
                $('#ingredient-suggestion').append(ingredientSuggestion);
                $('.ingredient-suggestion-modal').toggleClass('hidden');
            } else {
                //If spelling not flagged, continue
                addIngredient(ingredient);
            }
        });
    }
    //Add to list if suggestion accepted
    $('#add-ingredient-suggestion').click(function () {
        event.preventDefault();
        //Get user input
        ingredient = $('#ingredient-suggestion').text().trim().toLowerCase();
        addIngredient(ingredient);
        $('.ingredient-suggestion').val(" ");
        $('.ingredient-suggestion-modal').addClass('hidden');
    });
    // Close Ingredient List Modal if reject button clicked.
    $('#close-ingredient-suggestion-modal').click(function () {
        $('.ingredient-suggestion-modal').addClass('hidden');
        $('#ingredient-suggestion').val();
    });

    //Add ingredient
    function addIngredient(ingredient) {
        if (currentList.indexOf(ingredient) < 0) {
            //Push to ingredients list
            ingredientDB.push(ingredient);
            updateList();
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

    //Update list
    function updateList() {
        //Update List with firebase data
        currentList = [];
        $('#ingredient-list').empty();
        ingredientDB.on('child_added', function (snapshot) {
            //Get value from Firebase
            var value = snapshot.val();
            //Push to array
            currentList.push(value);
            queryDB.set({array: currentList.join(',')});
            userDB.child('/query').set({array: currentList.join(',')});
            //get name from firebase
            var key = snapshot.key;
            //Create list item with remove button and append
            //button
            var removeButton = $('<button>');
            removeButton.addClass('remove pure-button');
            removeButton.attr('data-key', key);
            removeButton.attr('data-item', value);
            removeButton.html('<i class="fa fa-times" aria-hidden="true"></i>');
            // List Item
            var li = $('<li>');
            li.addClass('ingredient');
            //append
            li.append(removeButton);
            li.append(value);
            $('#ingredient-list').append(li);
        });
    }

    //Remove item on click
    $('ul#ingredient-list').on('click', '.remove', function () {
        //Retrieve data
        var removeKey = $(this).attr('data-key');
        //Update list in firebase and DOM
        ingredientDB.child(removeKey).remove();
        updateList();
    });


    //----SEARCH----//


    //Search variables
    var apiKey = 'f3d39d43b35ceed6b734e5456f101c16';
    var query = currentList.join(',');
    var startAt = 0;
    var endAt = 9;
    //Run search function once variable defined
    var ranSearch = false;
    var queryWait = setInterval(waitForQuery, 250);

    function waitForQuery() {
        //check if query has value and search has not been run
        if (query && !ranSearch) {
            searchResults();
            ranSearch = true;
            //stop checking
            clearInterval(queryWait);
        }
        else {
            query = currentList.join(',');
        }
    }
    //Get Results from API;
    function searchResults() {
        var queryURL = 'https://gtproxy2.herokuapp.com/api/food2fork/search?key=' + apiKey + '&q=' + query;
        $.ajax({
            //parameters
            type: 'GET',
            url: queryURL,
            dataType: 'json'
        }).done(function (response) {
            var recipeList = response.recipes;
            //Write to Dom
            //clear table
            $('#recipe-table-body').empty();
            //Get results based on start and end variables
            for (var i = startAt; i <= endAt; i++) {
                //Get recipe info
                var current = recipeList[i];
                var recipeID = current.recipe_id;
                //Write to DOM
                var newRow = $('<tr>');
                var newData = $('<td>');
                //image
                var newImage = $('<img>');
                newImage.attr('src', current.image_url);
                newImage.attr('height', '50');
                newImage.attr('alt', current.title);
                newImage.addClass('border-image');
                newData.append(newImage);
                newRow.append(newData);
                //title
                newData = $('<td>');
                newData.append(current.title);
                newRow.append(newData);
                //Source
                newData = $('<td>');
                var sourceLink = $('<a>');
                sourceLink.attr('href', current.source_url);
                sourceLink.attr('target', '_blank');
                sourceLink.text(current.publisher);
                newData.append(sourceLink);
                newRow.append(newData);
                //ingredients
                newData = $('<td>');
                var ingredientLink = $('<a>');
                ingredientLink.attr('href', recipeID);
                ingredientLink.text('Ingredients');
                ingredientLink.attr('data-url', current.source_url);
                ingredientLink.attr('data-name', current.title);
                ingredientLink.addClass('ingredient-link');
                newData.append(ingredientLink);
                newRow.append(newData);
                //append
                $('#recipe-table-body').append(newRow);
            }
        });
    }
    //Display Ingredients
    $(document).on('click', '.ingredient-link', function () {
        event.preventDefault();
        var target = event.target;
        var recipeID = $(target).attr('href');
        var name = $(target).attr('data-name');
        //Get ingredients from API
        var recipeURL = 'https://gtproxy2.herokuapp.com/api/food2fork/get?&key=' + apiKey + '&rId=' + recipeID;
        $.ajax({
            //parameters
            type: 'GET',
            url: recipeURL,
            dataType: 'json'
        }).done(function (response) {
            $('.modal-wrapper').empty();
            var ingredientList = response.recipe.ingredients;
            //write to dom
            //set up elements
            var ingredientDiv = $('<div>');
            ingredientDiv.addClass('ingredient-;ist-modal modal-bg');
            var title = $('<h3>');
            title.text(name);
            var list = $('<ul>');
            list.addClass('ingredient-list');
            list.text('Ingredients');
            ingredientDiv.append(title,list);
            //Pull results from response and write list
            for (var i = 0; i < ingredientList.length; i++) {
                var currentIngredient = ingredientList[i];
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
            ingredientDiv.append($('<br>'));
            //add close button
            var closeButton = $('<button>');
            closeButton.addClass('ingredients-close pure-button');
            closeButton.text('Close List');
            ingredientDiv.append(closeButton);
            //Write to Dom
            $('.modal-wrapper').append(ingredientDiv);
        })
    });
    //Close ingredient list;
    $(document).on('click', '.ingredients-close', function () {
        var target = event.target;
        $(target).closest('div').remove();
    });


    //----CONTACT US----//


    //Submit Comment
    $('#contact-submit').click(function () {
        //Fetch comment from input
        var comment = $('#contact-form').val();
        //Set up messages
        var errorMessage = "There doesn't seem to be anything here!";
        var successMessage = "Thanks for your comment!";
        //If comment is present, push to database
        if (!isAnonymous && comment) {
            //If logged in, store in user db and comment db
            userComments.push(comment);
            commentsDB.push({user: authdata.email, comment: comment});
            //Reset Form
            $('#contact-form').val('');
            $('#contact-form').attr('placeholder', 'Have more to say? Bring it on!');
            $('#contact-form').after('<p>' + successMessage + '</p>')
        } else if (comment) {
            //If anonymous, just store to comment db
            commentsDB.push({user: "Anonymous", comment: comment});
            //Reset form
            $('#contact-form').val(" ");
            $('#contact-form').attr('placeholder', 'Have more to say? Bring it on!');
            $('#contact-form').after('<p>' + successMessage + '</p>')
        } else {
            //Display error if field empty
            $('#contact-form').after('<p>' + errorMessage + '</p>')
        }
    })

});
