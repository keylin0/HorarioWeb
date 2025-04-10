document.addEventListener("DOMContentLoaded", async function () {
    const response = await fetch("/auth/checkSession", {
        method: "GET",  
        credentials: "include"
    });

    const data = await response.json();

    if (data.loggedIn) {
        window.location.href = 'http://localhost:3000';  
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const signUpForm = document.getElementById('conteregi'); 
    const signInForm = document.getElementById('contesesion'); 

    const signUpButton = document.getElementById('iniciobtn'); 
    const signInButton = document.getElementById('btnsesion');

    signUpButton.addEventListener('click', function (event) {
        event.preventDefault();
        signInForm.style.display = "none";  
        signUpForm.style.display = "block"; 
    });

    signInButton.addEventListener('click', function (event) {
        event.preventDefault();
        signUpForm.style.display = "none"; 
        signInForm.style.display = "block"; 
    });
});


