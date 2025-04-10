let history = []; // Array para guardar los estados de la tabla
let redoStack = [];
const maxLineBreaks = 0;
const maxCharactersPerCell = 20;
const maxCharactersForHourCell = 13;
const tbody = document.querySelector("#dias tbody");
const inputElement = document.getElementById("editableInput");

// ------------------------------------------------------------------------------------------Celdas

//--------------- Titulo editable
inputElement.addEventListener("input", function () {
    if (this.value.length > 15) {
        this.value = this.value.slice(0, 15); 
    }
});

// Crear las filas y celdas dinámicamente 
for (let i = 0; i < 5; i++) {                      //matriz representada por un array de celdas
    const fila = document.createElement("tr");

    for (let j = 0; j < 6; j++) {
        const celda = document.createElement("td");
        celda.contentEditable = "true";

        celda.style.direction = 'ltr';  
        celda.style.textAlign = 'center';

        if (j === 0) {
            celda.classList.add("hour-cell");
        }

        fila.appendChild(celda);
    }
    tbody.appendChild(fila);
}


// Aplicar restricciones y validaciones según la celda
document.querySelectorAll("#dias td[contenteditable='true']").forEach(cell => {  
    cell.addEventListener("keydown", function (e) {
        const lineBreaks = (this.innerText.match(/\n/g) || []).length;

        if (this.classList.contains("hour-cell")) {
            if (this.innerText.length >= maxCharactersForHourCell && e.key !== "Backspace" && e.key !== "Delete") {
                e.preventDefault();
                return;
            }

            if (!e.key.match(/[\d:-\s]/) && e.key.length === 1) {
                e.preventDefault();
                return;
            }
        } else {
           
            if (e.key === "Enter" && lineBreaks >= maxLineBreaks) {
                e.preventDefault(); 
                return;
            }

            if (this.innerText.length >= maxCharactersPerCell && e.key !== "Backspace" && e.key !== "Delete") {
                e.preventDefault(); 
                return;
            }
        }
    });

    cell.addEventListener("paste", function (e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const htmlSource = (e.clipboardData || window.clipboardData).getData('text/html');

        if (htmlSource.includes("<td")) {
            return; 
        }
        const maxCharacters = this.classList.contains("hour-cell")
            ? maxCharactersForHourCell //Forma resumida de if
            : maxCharactersPerCell;

        let filteredText = text.slice(0, maxCharacters);

        if (this.classList.contains("hour-cell")) {
            filteredText = filteredText.replace(/[^0-9:-\s]/g, ""); 
        }

        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(filteredText));
    });
     //evita que se arrastren palabras
    cell.addEventListener("dragover", function (e) {
    if (this.classList.contains("hour-cell")) {
        e.preventDefault();
    }
});

cell.addEventListener("drop", function (e) {
    if (this.classList.contains("hour-cell")) {
        e.preventDefault(); 
    }
});
});


// Evitar pegar imágenes en las celdas editables
document.addEventListener("paste", function(e) {
    let clipboardData = e.clipboardData || window.clipboardData;
    let items = clipboardData.items;
    for (let item of items) {
        if (item.type.includes("image")) {
            e.preventDefault();
            return;
        }
    }
});

// -----------------------------------------------------  Estilos para celdas

// Activar o desactivar negrita en celdas editables
function toggleBold() {
    let selection = window.getSelection();
    if (selection.rangeCount > 0) {
        let range = selection.getRangeAt(0);

        let parentElement = range.commonAncestorContainer.parentElement;
        
        if (parentElement.style.fontWeight === "bold") {
            parentElement.style.fontWeight = "normal";
        } else {
            parentElement.style.fontWeight = "bold";
        }
    }
}


// Cambiar el color de la fuente al texto seleccionado 
const colorInput = document.getElementById("colorfuente");

colorInput.addEventListener("input", () => { //input de tipo color
    const color = colorInput.value; 
    const selection = window.getSelection();

    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const parentElement = range.commonAncestorContainer.parentElement;

        if (parentElement && parentElement.closest("tbody")) {
            const selectedText = range.toString();

            const tempSpan = document.createElement("span");
            tempSpan.style.color = color;

            range.extractContents();
            tempSpan.textContent = selectedText; 
            range.insertNode(tempSpan); 

            const newRange = document.createRange();
            newRange.selectNodeContents(tempSpan);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    }
});


// ------------------------------------------------------------------------------ Botones

// -- Mensaje pantalla
function showToast(message, type) {
    const toastContainer = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `${message} <span class="close-btn">&times;</span>`;
    toastContainer.appendChild(toast);

    const closeBtn = toast.querySelector(".close-btn"); //Selecciona un botón o se cierra en 5 segundos
    closeBtn.addEventListener("click", () => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 500);
    });

    setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 500);
    }, 5000); 
}


// ---------------------------------------------------------------------- Botón guardar

// Guardar tabla
async function save() {
    const tabla = document.querySelector("#dias tbody"); //recopila datos de cada fila y celda almacenandolos en array
    const datosHorario = [];

    const inputTitulo = document.querySelector("#editableInput").value.trim();
    if (inputTitulo) {
        datosHorario.push(["TITULO", inputTitulo]);
    }

    tabla.querySelectorAll("tr").forEach(fila => {
        const filaDatos = [];
        fila.querySelectorAll("td").forEach(celda => {
            const textoCelda = celda.innerHTML.trim().replace(/\s+/g, ' '); // Usamos innerHTML para capturar el estilo
            if (textoCelda && textoCelda !== "") {
                filaDatos.push(textoCelda);
            } else {
                filaDatos.push("");  
            }
        });

        if (filaDatos.length > 0) {
            datosHorario.push(filaDatos); //matriz donde cada fila de la tabla es un array
        }
    });

    if (datosHorario.length === 0) {
        showToast("No hay datos para guardar", "error");
        return;
    }

    try {
        const response = await fetch("/user/guardarhorario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ horarioData: datosHorario })
        });

        if (response.status === 401) {
            showToast("Debe iniciar sesión para guardar", "error");
            return;
        }

        const data = await response.json();
        if (data.success) {
            showToast("Guardado con éxito", "success");
        } else {
            showToast("Error al guardar el horario", "error");
        }
    } catch (error) {
        console.error("Error al guardar el horario:", error);
        showToast("Hubo un problema al guardar el horario", "error");
    }
}


// Cargar datos guardados en horario
async function loadHorarios() {
    try {
        const response = await fetch("/user/obtenerhorarios", {
            method: "POST",
            credentials: "include"  
        });

        if (response.status === 401) {
            console.log("Usuario no autenticado.");
            return;
        }

        const data = await response.json();

        if (data.success && data.horarios && data.horarios.length > 0) {
            const horarioGuardado = data.horarios[0].horario_data;
            mostrarHorarioEnTabla(horarioGuardado);
        } else {
            console.log("No hay horarios.");
        }
    } catch (error) {
        console.error("Error al cargar los horarios:", error);
    }
}

// Mostrar el horario en la tabla
function mostrarHorarioEnTabla(horarioData) {
    if (!horarioData || horarioData.length === 0) return;

    let titulo = "";
    if (horarioData[0][0] === "TITULO") {
        titulo = horarioData[0][1];
        horarioData = horarioData.slice(1); 
    }

    if (titulo) {
        document.querySelector("#editableInput").value = titulo;
    }

    const tabla = document.querySelector("#dias tbody");
    const filas = tabla.querySelectorAll("tr");

    horarioData.forEach((filaData, filaIndex) => {
        if (filas[filaIndex]) {
            const celdas = filas[filaIndex].querySelectorAll("td");
            filaData.forEach((dato, colIndex) => {
                if (celdas[colIndex]) {
                    celdas[colIndex].innerHTML = dato; // InnerHTML para agregar el contenido con los estilos
                }
            });
        } else {
            const nuevaFila = tabla.insertRow(filaIndex);
            filaData.forEach(dato => {
                const nuevaCelda = nuevaFila.insertCell();
                nuevaCelda.innerHTML = dato; 
            });
        }
    });
}



// Boton de descarga
function downloadImage() {
    let table = document.getElementById("horario");
    let titulo = document.querySelector("#editableInput").value.trim() || "Sin_titulo"; 

    html2canvas(table).then(canvas => {
        let link = document.createElement("a");
        link.download = `${titulo}.png`; 
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
}

// Boton de diseño
document.getElementById("toggleDesign").addEventListener("click", function() {
    let designOptions = document.getElementById("designOptions");
    designOptions.style.display = designOptions.style.display === "none" ? "flex" : "none";
});
