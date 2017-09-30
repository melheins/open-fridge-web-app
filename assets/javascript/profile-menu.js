$(document).ready(function () {
    // Function to display and hide the profile menu when icon is clicked
    $("#profile").on("click", ".profile-icon", function () {
        $('.profile-menu').toggleClass("hidden");
    })
});