const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

// Ruta de prueba
app.get("/prueba", async (req, res) => {
  try {
    // Realizamos una solicitud HTTP a la página
    const { data } = await axios.get("https://www.kitco.com/charts/gold");
    
    // Cargamos el HTML con Cheerio
    const $ = cheerio.load(data);
    
    // Extraemos los scripts que contienen el JSON
    const scripts = $("script")
      .map((_, element) => $(element).text())
      .toArray();

    // Verificamos si encontramos scripts
    if (scripts.length > 1) {
      const json = JSON.parse(scripts[scripts.length - 1]);
      const metalQuote = json.props.pageProps.dehydratedState.queries.find(query => query.state.data.GetMetalQuoteV3);
      const goldData = metalQuote.state.data.GetMetalQuoteV3.results[0];

      // Obtenemos la fecha y hora actual
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

      // Respondemos con los datos solicitados
      res.json({
        success: true,
        data: {
          fecha: horaExacta,
          array: [goldData.ask, goldData.bid],
        },
      });
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

