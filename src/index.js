const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const crypto = require('crypto');
const PASSWORD_MD5 = '1870cb7cee0bd66626445af488c1ef7f'; // MD5 de "password"

const app = express();
app.use(express.json());           // Para application/json
app.use(express.urlencoded({ extended: true })); // Para x-www-form-urlencoded

// 2. Luego CORS (si lo usas)
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

app.post("/get-html", async (req, res) => {
  try {
    // Obtener la URL del cuerpo de la solicitud
    const { url, password } = req.body;
    
    // Validar que se proporcionó una URL
    if (!url && !password) {
      return res.status(400).json({
        success: false,
        message: "Por favor, proporciona una URL en el cuerpo de la solicitud"
      });
    }

    const passwordMd5 = crypto.createHash('md5').update(password).digest('hex');
    
    if (passwordMd5 !== PASSWORD_MD5) {
      return res.status(401).json({
        success: false,
        message: "Contraseña incorrecta"
      });
    }

    // Realizamos una solicitud HTTP a la página (igual que en /prueba)
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    res.json({
      success: true,
      url: url,
      html: data, // HTML completo y crudo
      length: data.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener el HTML",
      error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

