
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

    //Add Ingredient
    $("#add-ingredient").click(function () {
        event.preventDefault();

        var ingredient = $("#ingredient-input").val();
        db.ref('/ingredients').push(ingredient);

        $("#ingredient-input").val(" ");

    });
    //Update List with firebase data
    firebase.database().ref('/ingredients').on('child_added', function(snapshot) {
        console.log(snapshot.val());
        //Get value from Firebase
        var value = snapshot.val();
        //get name from firebase
        var name = snapshot.name;
        //Create list item with remove button and append
        //button
        var removeButton = $("<button>");
        removeButton.addClass('remove');
        removeButton.attr('id', name);
        removeButton.text('x');
        // List Item
        var li = $("<li>");
        li.addClass('ingredient');
        //append
        li.append(removeButton);
        li.append(value);
        $("#ingredient-list").append(li)


    });
});