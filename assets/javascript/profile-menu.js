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
    var user = '';
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            user = firebase.auth().currentUser;
            console.log(user);
        };
    });
    console.log('test');

    //PROFILE


    // Function to display and hide the profile menu when icon is clicked

    $("#profile").on("click", ".profile-icon", function () {
        $('.profile-menu').toggleClass("hidden");
        $('#profile-links').removeClass('hidden');
        $('#login-form').addClass('hidden');
        user = firebase.auth().currentUser;
        if (user) {
            $('#sign-in').addClass('hidden');
            $('#user-display').text(user.email);
        } else {
            $('#sign-out').addClass('hidden');
            $('#favorites-link').addClass('hidden')
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
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode ===  'auth/email-already-in-use' || errorCode === 'auth/invalid-email') {
                $('#email').after('<p>' + errorMessage + '<p>');
            }else{
                console.log(errorCode)
            }
        });
        $('#login-form').addClass('hidden');
        $('#profile-links').removeClass('hidden');
    });
    //Sign in
    $('#sign-in-link').click(function () {
        var email = $('#email').val();
        var password = $('#password').val();
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            //Handle Errors
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                $('#password').after('<p>' + errorMessage + '</p>');
            } else if (errorCode ===  'auth/invalid-email' || errorCode === 'auth/user-not-found') {
                alert(errorMessage);
                $('#email').after('<p>' + errorMessage + '</p>');

            } else {
                console.log(errorCode)
            }
            user = firebase.auth().currentUser;
            $('#login-form').addClass('hidden');
            $('#profile-links').removeClass('hidden');
            $('#sign-in').addClass('hidden');
            $('#sign-out').removeClass('hidden');
            $('#user-display').text(user.email);
            $('#favorites-link').removeClass('hidden');
        });

    });

    $('#sign-out').click(function () {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
        });
        $('#sign-in').removeClass('hidden');
        $('#sign-out').addClass('hidden');
        $('#user-display').text('Sign In to view favorites');
        $('#favorites-link').addClass('hidden');
    })


});