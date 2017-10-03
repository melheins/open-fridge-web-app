$(document).ready(function() {
    // Initialize Firebase
    var config = {
        apiKey: 'AIzaSyANkZ57CA6LXADMNJJakfABMdHj8fR7ZuY',
        authDomain: 'open-fridge-d8ce8.firebaseapp.com',
        databaseURL: 'https://open-fridge-d8ce8.firebaseio.com',
        projectId: 'open-fridge-d8ce8',
        storageBucket: 'open-fridge-d8ce8.appspot.com',
        messagingSenderId: '906230734866'
    };
    firebase.initializeApp(config);
    var db = firebase.database();
    var queryDB = db.ref('/query');
    //pull from Firebase
    var query = '';
    queryDB.on('value', function (snapshot) {
        snapshot = snapshot.val();
        query = snapshot.array;
        console.log(snapshot.array);
    });
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
    })
});
