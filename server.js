const express = require("express");
const { PDFDocument, rgb, StandardFonts, degrees } = require("pdf-lib");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 4000;
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { getChartUrl } = require("./chartUrl");
const moment = require("moment-timezone");
require("dotenv").config();

// Use body-parser to parse JSON requests
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json());
app.use(cors());

const pdfsFolderPath = path.join(__dirname, "pdfs");
const assetsFolderPath = path.join(__dirname, "assets");

if (!fs.existsSync(pdfsFolderPath)) {
  fs.mkdirSync(pdfsFolderPath);
}

if (!fs.existsSync(assetsFolderPath)) {
  fs.mkdirSync(assetsFolderPath);
}

app.use("/pdfs", express.static(pdfsFolderPath));
app.use("/assets", express.static(assetsFolderPath));

app.get("/generate-pdf", async (req, res) => {
  try {
    const crimeResult = await axios.get(
      "https://api.usa.gov/crime/fbi/cde/arrest/state/AK/all?from=2015&to=2020&API_KEY=iiHnOKfno2Mgkt5AynpvPpUQTEyxE77jo1RU8PIv"
    );

    const labels = [];
    const values = [];

    crimeResult.data.data.map((ele) => {
      labels.push(ele.data_year);
      values.push(ele.Burglary);
    });

    const chartUrl = getChartUrl({ labels, data: values });

    const response = await axios.get(chartUrl, {
      responseType: "arraybuffer",
    });

    const chartBuffer = response.data;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold); // You can use a different font
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica); // You can use a different font

    const pageWidth = 595;
    const pageHeight = 842;

    const padding = 16;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const pageSize = page.getSize();
    const rectX = padding;

    const logoUint8Array = fs.readFileSync("./assets/logo.png");
    const logo = await pdfDoc.embedPng(logoUint8Array);

    page.drawImage(logo, {
      x: 16,
      y: pageSize.height - 32,
      width: 92,
      height: 16,
    });

    page.drawText("123 Main Street, Dover, NH 03820-4667", {
      x: 412,
      y: pageSize.height - 26,
      size: 9,
      font,
      color: rgb(9 / 255, 14 / 255, 36 / 255),
      lineHeight: 16,
    });

    const hrUint8Array = fs.readFileSync("./assets/hr.png");
    const hrLine = await pdfDoc.embedPng(hrUint8Array);

    const hrLineImageDims = hrLine.scale(1);

    page.drawImage(hrLine, {
      x: 16,
      y: pageSize.height - 40,
      width: hrLineImageDims.width,
      height: hrLineImageDims.height,
    });

    const locationUint8Array = fs.readFileSync("./assets/location-share.png");
    const location = await pdfDoc.embedPng(locationUint8Array);

    const locationImageDims = location.scale(1);

    page.drawImage(location, {
      x: 16,
      y: pageSize.height - 66,
      width: locationImageDims.width,
      height: locationImageDims.height,
    });

    page.drawText("Crime", {
      x: 36,
      y: pageSize.height - 61,
      size: 10,
      font: fontNormal,
      color: rgb(9 / 255, 14 / 255, 36 / 255),
      lineHeight: 24,
    });

    page.drawImage(hrLine, {
      x: 70,
      y: pageSize.height - 60,
      width: hrLineImageDims.width - 54,
      height: hrLineImageDims.height,
      scale: 0.5,
    });

    const upperBox =
      "M0 12.7592C0 5.71249 5.71249 0 12.7592 0H550.241C557.288 0 563 5.71249 563 12.7592V24H0V12.7592Z";
    const lowerBox =
      "M0 0H563V163C563 169.627 557.627 175 551 175H12C5.37258 175 0 169.627 0 163V0Z";

    const upperBoxColor = rgb(232 / 255, 238 / 255, 251 / 255);
    const lowerBoxColor = rgb(242 / 255, 244 / 255, 245 / 255);

    page.drawSvgPath(upperBox, {
      x: rectX,
      y: 768,
      borderColor: upperBoxColor,
      color: upperBoxColor,
      borderWidth: 2,
      scale: 1,
    });

    page.drawSvgPath(lowerBox, {
      x: rectX,
      y: 742,
      borderColor: lowerBoxColor,
      color: lowerBoxColor,
      borderWidth: 2,
      scale: 1,
    });

    const innerBoxuint8Array = fs.readFileSync("./assets/innerBox.png");
    const innerBox = await pdfDoc.embedPng(innerBoxuint8Array);

    const innerBoxDimensions = innerBox.scale(1);
    const innerBoxColor = rgb(1, 1, 1);

    page.drawImage(innerBox, {
      x: 38,
      y: pageSize.height - 258,
      width: innerBoxDimensions.width,
      height: innerBoxDimensions.height,
      color: innerBoxColor,
      borderColor: innerBoxColor,
      borderWidth: 2,
      scale: 1,
    });

    const fontSize = 9;
    const fontColor = rgb(20 / 255, 99 / 255, 255 / 255); // Text color
    const lineHeight = 10;
    const text = "Burglary";

    page.drawText(text, {
      x: 30,
      y: 754,
      size: fontSize,
      font: fontNormal,
      color: fontColor,
      lineHeight,
    });

    const chartPng = await pdfDoc.embedPng(chartBuffer);
    const chartDimensions = chartPng.scale(0.5);

    page.drawImage(chartPng, {
      x: 50,
      y: pageSize.height - 248,
      width: chartDimensions.width,
      height: chartDimensions.height,
    });

    page.drawText("Arrests", {
      x: 30,
      y: 650,
      size: 10,
      font: fontNormal,
      color: rgb(30 / 255, 30 / 255, 30 / 255),
      lineHeight: 24,
      rotate: degrees(90),
    });

    page.drawImage(hrLine, {
      x: 16,
      y: pageSize.height - 802,
      width: hrLineImageDims.width,
      height: hrLineImageDims.height,
    });

    page.drawText(`Report Genereted on ${moment().format("MMMM D, YYYY")}`, {
      x: 16,
      y: pageSize.height - 820,
      size: 9,
      font,
      color: rgb(20 / 255, 99 / 255, 255 / 255),
      lineHeight: 16,
    });

    page.drawText("RealAssist Property Report | Page 1 ", {
      x: 402,
      y: pageSize.height - 820,
      size: 9,
      font,
      color: rgb(9 / 255, 14 / 255, 36 / 255),
      lineHeight: 16,
    });

    page.drawText("of 25", {
      x: 558,
      y: pageSize.height - 820,
      size: 9,
      font,
      color: rgb(98 / 255, 110 / 255, 153 / 255),
      lineHeight: 16,
    });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    const pdfFileName = "chart.pdf";
    const localFilePath = path.join(__dirname, "pdfs", pdfFileName);

    fs.writeFileSync(localFilePath, pdfBytes);

    res.send({ status: "SUCCESS", url: process.env.URL });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
