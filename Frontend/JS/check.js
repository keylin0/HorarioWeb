// ----------------------- Autenticación
document.addEventListener("DOMContentLoaded", async function () { //espera que el DOM se haya cargado completamente
    const signButton = document.getElementById("signbutton"); //Define varias variables de botones de la interfaz de usuario
    const deleteButton = document.getElementById("deleteButton");
    const logoutButton = document.getElementById("logoutButton");
    const confirmDeleteButton = document.getElementById("confirmDeleteButton");

    async function checkSession() { 
        try {
            const response = await fetch("/auth/checkSession", { credentials: "include" }); // Realiza una solicitud para verificar si el usuario está autenticado.

            if (!response.ok) throw new Error("Error en la solicitud");

            const data = await response.json(); 

            if (data.loggedIn) {
                console.log("Usuario autenticado:", data.username);

                signButton.style.display = "none";
                deleteButton.style.display = "inline-block";
                logoutButton.style.display = "inline-block";

                if (window.location.pathname === "/sign.html") {
                    window.location.href = "http://localhost:3000";
                }

            } else {
                signButton.style.display = "inline-block";
                deleteButton.style.display = "none";
                logoutButton.style.display = "none";
            }
        } catch (error) {
            console.error("Error al verificar sesión:", error);
        }
    }

    await checkSession();

    // Eliminar
    deleteButton.addEventListener("click", () => {
        deletePopup.classList.remove("hidden");  
    });

    confirmDeleteButton.addEventListener("click", async () => {
    try {
        const response = await fetch("/auth/delete", {
            method: "DELETE",
            credentials: "include", 
        });

        if (response.ok) {
            const data = await response.json(); 
            console.log("Cuenta eliminada correctamente:", data.message); 
            window.location.href = "http://localhost:3000"; 
        } else {
            const data = await response.json();
            console.log(data.message); 
        }
    } catch (error) {
        console.error("Error al eliminar la cuenta:", error); 
    }
});

// Salir
logoutButton.addEventListener("click", async function () {
    try {
        const response = await fetch("/auth/logout", {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) throw new Error("Error al cerrar sesión");

        signButton.style.display = "inline-block";
        deleteButton.style.display = "none";
        logoutButton.style.display = "none";

        if (window.location.pathname !== "/index.html") {
            window.location.href = "http://localhost:3000";
        }
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});
});
