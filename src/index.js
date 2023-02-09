const express = require("express");

const axios = require("axios");
const cheerio = require("cheerio");
const app = express();
const port = process.env.PORT || 3000;
console.log("inciamos");

app.get("/", (req, res) => {
  console.log("saludamos");
  res.send("Hello World! :)");
});
app.get("/prueba", (req, res) => {
  console.log("prueba");
  try {
    axios.get("https://www.kitco.com/gbl/es/index.html").then(({ data }) => {
      const $ = cheerio.load(data);
      const fecha = $("b")
        .map((_, product) => {
          const $product = $(product);
          return $product.text();
        })
        .toArray();
      const pokemonNames = $("td.data")
        .map((_, product) => {
          const $product = $(product);
          return $product.text();
        })
        .toArray();
      //res.send(pokemonNames[0]);
      if (fecha.length > 0 && pokemonNames.length > 1) {
        res.send(
          "{'fecha':'" +
            fecha[0] +
            "','compra':" +
            pokemonNames[0] +
            ",'venta':" +
            pokemonNames[1] +
            "}"
        );
      } else {
        res.send("elementos no encontrados");
      }
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.listen(port);
console.log("server on port " + port);
