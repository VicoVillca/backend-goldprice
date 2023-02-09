const puppeteer = require("puppeteer");
const express = require("express");
const jsdom = require("jsdom");
const app = express();
const port = process.env.PORT || 3000;
console.log("inciamos");
app.get("/prueba", (req, res) => {
  res.send("Hello World!");
});
app.get("/oro", async (req, res) => {
  try {
    // Abrimos una instancia del puppeteer y accedemos a la url de google
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const response = await page.goto("https://www.kitco.com/gbl/es/index.html");
    const body = await response.text();
    const {
      window: { document },
    } = new jsdom.JSDOM(body);

    const elem = document.querySelectorAll("table");

    if (elem.length > 6) {
      const c = elem[6].textContent;
      let x = "";
      let sw = 0;
      for (let i = 0; i < c.length; i++) {
        const element = c[i];
        const asqui = element.charCodeAt(0);
        if (asqui != 9 && asqui != 10 && asqui != 32) {
          //console.log(typeof element+"-"+element+"("+element.charCodeAt(0)+")");
          x = x + element;
          sw = 1;
        } else {
          if (asqui == 10 && sw == 1) {
            x = x + ",";
            sw = 0;
          }
        }
      }
      const array = x.split(",");
      console.log("{");
      console.log("'fecha' : " + array[1] + ",");
      console.log("'compra' : " + Number(array[4]) + ",");
      console.log("'venta' : " + Number(array[5]));
      console.log("}");
      res.send(
        "{'fecha':" +
          array[1] +
          ",'compra' : " +
          Number(array[4]) +
          ",'venta' : " +
          Number(array[5]) +
          "}"
      );
    } else {
      res.send("erro al obtener el precio");
    }
    await browser.close();
  } catch (error) {
    res.send(error);
  }
});

app.listen(port);
console.log("server on port " + port);
