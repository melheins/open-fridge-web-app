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
    //Set up ajax vars
    var apiKey = '102569c9def8a54e1e0e5b606c853753';
    var queryURL = 'http://food2fork.com/api/search?key=';
    //Push contents of ingredients list to array
    var array = [];
    //pull from Firebase
    ingredientDB.on('child_added', function(snapshot) {
        var val = snapshot.val();
        array.push(val);
    });
    // turn in to string
    var query = array.join("+");
    //Determine which results to display:
    var startAt = 0;
    var endAt = 9;
    //get results
    function searchResults () {
        $.ajax({
            //parameters
            type: 'GET',
            url: queryURL + apiKey,
            q: query,
            dataType: 'json',
            // once results received
            success: function(response) {
                console.log(response);
                //clear table
                $('#recipe-table-body').empty();
                for (var i = startAt; i <= endAt; i++) {
                    //Get recipe info
                    var current = response.recipes[i];
                    //Write to DOM
                    var newRow = $("<tr>");
                    var newData = $("<td>");
                    //title
                    newData.text(current.title);
                    newRow.append(newData);
                    //source
                    newData = $("<td>");
                    newData.text(current.publisher);
                    newRow.append(newData);
                    //

                    $('#recipe-table-body').append(newRow)
                }
            },
            error: function(error) {
                console.log(error)
            }
        })
    }

    searchResults();



});