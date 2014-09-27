/**
 * Created by azu on 2014/09/24.
 * LICENSE : MIT
 */
"use strict";
var pdfURL = './test/fixtures/slide.pdf';
var throttle = require("lodash.throttle");

var PDFController = require("./lib/pdf-controller");
var controller = new PDFController(document.getElementById("pdf-container"));
controller.loadDocument(pdfURL).then(function () {
    document.getElementById('prev').addEventListener('click', controller.prevPage.bind(controller));
    document.getElementById('next').addEventListener('click', controller.nextPage.bind(controller));
}).catch(function (error) {
    console.error(error);
});
window.addEventListener("resize", throttle(function (event) {
    controller.fitItSize();
}, 100));