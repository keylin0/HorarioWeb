const express = require("express");
const router = express.Router(); //define las rutas que manejarán las solicitudes HTTP.
const db = require("../connection");
const authMiddleware = require("../middleware/authMiddleware");

// Guardar datos de tabla
router.post("/guardarhorario", authMiddleware, async (req, res) => {
    const userId = req.session.userId;
    const { horarioData } = req.body;

    if (!Array.isArray(horarioData) || horarioData.length === 0) {
        return res.status(400).json({ success: false, message: "Datos de horario inválidos o vacíos." });
    }

    try { 
        const [existingHorario] = await db.promise().query('SELECT * FROM horarios WHERE user_id = ?', [userId]);

        if (existingHorario.length > 0) {
            const horarioDataString = JSON.stringify(horarioData);  
            await db.promise().query('UPDATE horarios SET horario_data = ? WHERE user_id = ?', [horarioDataString, userId]);
        } else {
            const horarioDataString = JSON.stringify(horarioData); 
            await db.promise().query('INSERT INTO horarios (user_id, horario_data) VALUES (?, ?)', [userId, horarioDataString]);
        }

        res.status(200).json({ success: true, message: "Horario guardado exitosamente." });
    } catch (error) {
        console.error("Error al guardar el horario en la base de datos:", error);
        res.status(500).json({ success: false, message: "Hubo un problema al guardar el horario." });
    }
});


// Obtener datos de tabla
router.post("/obtenerhorarios", async (req, res) => {
    const userId = req.session?.userId;

    if (!userId) {
        return res.status(200).json({ success: true, horarios: [] });
    }

    try {
        const [result] = await db.promise().query(
            "SELECT horario_data FROM horarios WHERE user_id = ?",
            [userId]
        );

        if (result.length > 0) {
            const horarios = result.map(item => ({
                horario_data: JSON.parse(item.horario_data)
            }));
            res.status(200).json({ success: true, horarios });
        } else {
            res.status(200).json({ success: true, horarios: [] });
        }
    } catch (error) {
        console.error("Error al obtener los horarios:", error);
        res.status(500).json({ success: false, message: "Hubo un error al obtener los horarios." });
    }
});


module.exports = router;