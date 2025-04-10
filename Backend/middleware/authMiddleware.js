const db = require("../connection");

const authMiddleware = async (req, res, next) => {
    try {
        if (req.session.userId) {
            const [rows] = await db.promise().query("SELECT * FROM usuarios WHERE id = ?", [req.session.userId]);

            if (rows.length === 0) {
                req.session.destroy();
                return res.redirect("/sign.html"); 
            }

            if (req.path === "/sign.html") {
                return res.redirect("/index.html"); 
            }

            return next(); 
        } else {
            if (req.path === "/guardarhorario") {
                return res.status(401).json({ message: "Debe iniciar sesión para guardar" });
            }

            return next(); 
        }
    } catch (error) {
        console.error("Error en authMiddleware:", error);
        res.status(500).send("Error interno del servidor");
    }
};

module.exports = authMiddleware;
