const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const puerto = 3000;
const urlAgenda = "http://www.raydelto.org/agenda.php";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function validarDatos(contacto) {
    if (!contacto) return false;

    const { nombre, apellido, telefono } = contacto;

    if (!nombre || !apellido || !telefono) {
        return false;
    }

    if (
        typeof nombre !== "string" ||
        typeof apellido !== "string" ||
        typeof telefono !== "string"
    ) {
        return false;
    }

    return true;
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/contactos", async (req, res) => {
    try {
        const respuesta = await axios.get(urlAgenda);

        res.status(200).json({
            exito: true,
            total: Array.isArray(respuesta.data) ? respuesta.data.length : 0,
            contactos: respuesta.data
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: "Error al listar los contactos",
            detalle: error.message
        });
    }
});

app.post("/api/contactos", async (req, res) => {
    try {
        const datos = req.body;

        if (!validarDatos(datos)) {
            return res.status(400).json({
                exito: false,
                mensaje: "Debes enviar nombre, apellido y telefono"
            });
        }

        const contactoNuevo = {
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            telefono: datos.telefono.trim()
        };

        const respuesta = await axios.post(urlAgenda, contactoNuevo, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        res.status(201).json({
            exito: true,
            mensaje: "Contacto almacenado correctamente",
            contacto: contactoNuevo,
            respuestaServidor: respuesta.data
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: "Error al almacenar el contacto",
            detalle: error.message
        });
    }
});

app.listen(puerto, () => {
    console.log(`Servidor activo en http://localhost:${puerto}`);
});