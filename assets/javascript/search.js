$(document).ready(function() {
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
    //Set up ajax api
    var apiKey = '102569c9def8a54e1e0e5b606c853753';
    //Push contents of ingredients list to array
    var qArray = [];
    var queryJoin = "";
    //pull from Firebase
    ingredientDB.on('child_added', function(snapshot) {
        var val = snapshot.val();
        qArray.push(val);
        console.log(qArray);
        queryJoin = qArray.join();
    });
    //Determine which results to display:
    var startAt = 0;
    var endAt = 9;
    //get results
    console.log(queryJoin);
    var queryURL = 'https://gtproxy2.herokuapp.com/api/food2fork/search?key=' + apiKey + "&q=" + queryJoin;

    when
    searchResults(queryURL);

    function searchResults (url) {

        $.ajax({
            //parameters
            type: 'GET',
            url: url,
            dataType: 'json',
            // once results received
            success: function(response) {
                console.log(response);
                console.log(queryURL);
                console.log(queryJoin);
                //clear table
                $('#recipe-table-body').empty();
                for (var i = startAt; i <= endAt; i++) {
                    //Get recipe info
                    var current = response.recipes[i];
                    var recipeID = current.recipe_id;
                    //Write to DOM
                    var newRow = $("<tr>");
                    var newData = $("<td>");
                    var newDiv =  $("<div>");
                    //title
                    var title = current.title;
                    //image
                    var newImage = $("<img>");
                    newImage.attr("src", current.image_url);
                    newImage.attr("height", "50");
                    newImage.attr("alt", title);
                    //Source
                    var sourceLink = $("<a>");
                    sourceLink.attr("href", current.source_url);
                    sourceLink.text(current.publisher);
                    //ingredients
                    var ingredientLink = $("<a>");
                    ingredientLink.attr("href", recipeID);
                    ingredientLink.attr("rel", "modal-open");
                    ingredientLink.text("Ingredients");
                    newData.append(sourceLink);
                    newRow.append(newData);
                    //append
                    newData.append(newImage, title, sourceLink, ingredientLink);
                    newRow.append(newData);
                    $('#recipe-table-body').append(newRow);
                    //set up modal
                    var recipeURL = 'https://gtproxy2.herokuapp.com/api/food2fork/get?&key=';
                    var addon = "&rid=";
                    $.ajax({
                        //parameters
                        type: 'GET',
                        url: recipeURL + apiKey + addon + recipeID,
                        dataType: 'json',
                        success: function(response) {
                            console.log(response);
                            console.log(recipeURL + apiKey + addon + recipeID);
                        },
                        error: function(error) {
                            console.log(error)
                        }
                    })
                }
            },
            error: function(error) {
                console.log(error)
            }
        })
    }




});