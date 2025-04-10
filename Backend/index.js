const express = require('express');
const cors = require('cors');
const db = require('./connection');
require('dotenv').config();
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

const sessionStore = new MySQLStore({}, db.promise()); //Las sesiones de los usuarios se guardan en la base de datos.

app.use(session({
    secret: process.env.SESSION_SECRET, //cadena secreta para firmar las cookies de sesión
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

app.use('/auth', authRoutes);
app.use("/user", userRoutes);

app.use(express.static(path.join(__dirname, '../Frontend'))); //Sirve los archivos del frontend desde la carpeta Frontend

const redirectIfAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect('/index.html'); 
    }
    next();
};

app.get('/sign.html', redirectIfAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/sign.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión a la base de datos MySQL establecida');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
});