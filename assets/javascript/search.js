
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
    var currentList = [];

    //Add Ingredient
    $("#add-ingredient").click(function () {
        event.preventDefault();
        //Get user input
        var ingredient = $("#ingredient-input").val();
        //If field is not empty,
        console.log(currentList.indexOf(ingredient));
        if (ingredient && currentList.indexOf(ingredient) < 0){
            //Push to ingredients list
            ingredientDB.push(ingredient);
            //Clear input
            $("#ingredient-input").val(" ");
        }
        else if (currentList.indexOf(ingredient) >= 0){
            $("#ingredient-input").addClass('error')
        }
        else {
            $("#ingredient-input").addClass('error-text')
        }
    });
    $(document).on("keyup", "#ingredient-input" , function () {
        // if enter key hit
        if (event.which === 13) {
            //run search
            $("#add-ingredient").click();
        }
    });
    //Update List with firebase data
    ingredientDB.on('child_added', function(snapshot) {
        //Get value from Firebase
        var value = snapshot.val();
        //Push to array
        currentList.push(value)  ;
        //get name from firebase
        var key = snapshot.key;
        //Create list item with remove button and append
        //button
        var removeButton = $("<button>");
        removeButton.addClass('remove');
        removeButton.attr('data-key', key);
        removeButton.attr('data-item');
        console.log(name);
        removeButton.text('x');
        // List Item
        var li = $("<li>");
        li.addClass('ingredient');
        //append
        li.append(removeButton);
        li.append(value);
        $("#ingredient-list").append(li)

        console.log(currentList)
    });

    //Remove item from list
    //on click
    $(document).click('.remove', function (event) {
        //get value from clicked element
        var clicked = event.target;
        var removeKey = $(clicked).attr('data-key');
        console.log(removeKey);
        //remove from firebase
        ingredientDB.child(removeKey).remove();
        clicked.closest('li').remove();
        var removeItem = $(clicked).attr('data-item');
        var removeIndex = currentList.indexOf(removeItem);
        currentList.splice($.inArray(removeItem, currentList ), 1)
        //remove item from db
    });

});