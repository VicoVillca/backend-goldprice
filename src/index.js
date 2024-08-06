const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

// Función para verificar si una cadena contiene solo puntos, números y comas
function contienePuntosNumerosYComas(cadena) {
  const regex = /^[\d.,]+$/;
  return regex.test(cadena);
}

// Ruta de prueba
app.get("/prueba", async (req, res) => {
  try {
    const { data } = await axios.get("https://www.kitco.com");
    const $ = cheerio.load(data);

    const elementos = $("span")
      .map((_, element) => $(element).text())
      .toArray();
    
    const filtrado = elementos.filter(contienePuntosNumerosYComas);

    console.log(filtrado);

    if (filtrado.length > 1) {
      const fechaHoraActual = new Date();
      const opciones = {
        timeZone: 'America/La_Paz',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      const horaExacta = fechaHoraActual.toLocaleString('es-BO', opciones);

      const responseData = {
        success: true,
        data: {
          fecha: horaExacta,
          array: filtrado,
        },
      };

      res.json(responseData);
    } else {
      res.json({ success: false, message: "Datos no encontrados!" });
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.json({ success: false, message: "Error al obtener los datos" });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
