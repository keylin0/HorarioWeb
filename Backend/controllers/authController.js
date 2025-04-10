const db = require("../connection"); //Importación
const bcrypt = require("bcryptjs");

exports.checkSession = (req, res) => { //Verifica si hay un usuario logueado mediante la sesión.
    if (req.session.userId) {
        return res.json({ loggedIn: true, username: req.session.username });
    } else {
        return res.json({ loggedIn: false });
    }
};

// Registro del usuario
exports.register = async (req, res) => {
    try {
        console.log("Datos recibidos:", req.body);

        const { username, email, password } = req.body; //recibe a

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const [existingUser] = await db.promise().query("SELECT id FROM usuarios WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.promise().query(
            "INSERT INTO usuarios (username, email, passwrd) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );

        req.session.userId = result.insertId;
        req.session.username = username;

        res.status(201).json({ message: "Usuario registrado con éxito", username });
    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

// Inicio de sesión
exports.login = async (req, res) => {
    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const [users] = await db.promise().query("SELECT * FROM usuarios WHERE username = ?", [username]);

        if (users.length === 0) {
            return res.status(400).json({ message: "Usuario o contraseña incorrectos" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, users[0].passwrd);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Usuario o contraseña incorrectos" });
        }

        req.session.userId = users[0].id;
        req.session.username = users[0].username;

        res.json({ message: "Inicio de sesión exitoso", username: users[0].username });
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

// Cerrar sesión
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Error al cerrar sesión" });
        }

        res.clearCookie('connect.sid');
        res.json({ message: "Sesión cerrada exitosamente" });
    });
};


// Eliminar cuenta
exports.delete = async (req, res) => {
    try {
        const userId = req.session.userId; 

        await db.promise().query("DELETE FROM usuarios WHERE id = ?", [userId]);

        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: "Error al cerrar sesión" });
            }
            res.json({ message: "Cuenta eliminada con éxito" });
        });
    } catch (error) {
        console.error("Error al eliminar cuenta:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};
