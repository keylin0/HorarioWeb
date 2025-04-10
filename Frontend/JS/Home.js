/* --------- Mini menú (barra de navegación) ---------- */
document.addEventListener("DOMContentLoaded", () => { 
    const menu = document.querySelector(".etinav");
    const menud = document.querySelector(".menud");
 
    menu.addEventListener("click", () => {
        menu.classList.toggle("open");
        menud.classList.toggle("active");
    });
    
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) { 
            menu.classList.remove("open");
            menud.classList.remove("active");
        }
    });

    if (window.innerWidth > 768) {
        menu.classList.remove("open");
        menud.classList.remove("active");
    }
});

