const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

// Función para verificar si una cadena contiene puntos y números
function contienePuntosYNumeros(cadena) {
  const tienePunto = /\./;
  const tieneNumero = /\d/;
  return tienePunto.test(cadena) && tieneNumero.test(cadena);
}

// Ruta raíz
app.get("/", (req, res) => {
  console.log("saludamos");
  res.send("Hello World! :)");
});

// Ruta de prueba
app.get("/prueba", async (req, res) => {
  console.log("prueba");
  try {
    const { data } = await axios.get("https://www.kitco.com");
    const $ = cheerio.load(data);
    const hhh = $("h3")
      .map((_, product) => $(product).text())
      .toArray();

    const filtrado = hhh.filter(contienePuntosYNumeros);

    // Imprimir el resultado filtrado
    console.log(filtrado);
    console.log("holap");

    if (filtrado.length > 1) {
      const fecha = new Date();
      const responseData = {
        success: true,
        data: {
          fecha: fecha.toISOString(),
          compra: filtrado[0],
          venta: filtrado[1],
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
  console.log("Servidor escuchando en el puerto " + port);
});
