// ------------------- Lógica del registro
document.addEventListener("DOMContentLoaded", function () { //El código espera que el DOM se haya cargado completamente.
    const loginForm = document.querySelector("#contesesion form"); //Selecciona los formularios de inicio de sesión y registro a través de sus identificadores.
    const registerForm = document.querySelector("#conteregi form");

    if (loginForm) { //Cuando un usuario envía el formulario, ejecuta las funciones
        loginForm.addEventListener("submit", loginUser);
    } else {
        console.error("No se encontró el formulario de inicio de sesión.");
    }

    if (registerForm) {
        registerForm.addEventListener("submit", registerUser);
    } else {
        console.error("No se encontró el formulario de registro.");
    }
});

function loginUser(event) {
    event.preventDefault();

    const username = document.getElementById('ininame').value;
    const password = document.getElementById('inicontra').value;

    if (!username || !password) {
        document.getElementById('inierror').textContent = "Todos los campos son obligatorios";
        return;
    }


fetch("/auth/login", { 
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"  
    },
    credentials: "include",  
    body: JSON.stringify({ username, password }),
})
    .then(response => {
        console.log("Respuesta recibida:", response);
        return response.json();
    })
    .then(data => {

        if (data.message === "Inicio de sesión exitoso") {
            window.location.href = 'http://localhost:3000';
        } else {
            document.getElementById('inierror').textContent = " " + data.message;
        }
    })
    .catch(error => {
        console.error("Error:", error);
        document.getElementById('inierror').textContent = "Error en el servidor";
    });
}

function registerUser(event) {
    event.preventDefault();

    const username = document.getElementById('reginame').value;
    const email = document.getElementById('regiemail').value;
    const password = document.getElementById('regicontra').value;

    if (!username || !email || !password) {
        document.getElementById('regierror').textContent = "Todos los campos son obligatorios";
        return;
    }

    fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ username, email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Usuario registrado con éxito") {
            window.location.href = '/index.html'; 
        } else {
            document.getElementById('regierror').textContent = data.message;  
        }
    })
    .catch(error => {
        console.error('Error en el registro:', error);
        document.getElementById('regierror').textContent = "Error en el servidor";
    });
}