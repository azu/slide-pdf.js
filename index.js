/**
 * Created by azu on 2014/09/24.
 * LICENSE : MIT
 */
"use strict";
var pdfURL = './test/fixtures/slide.pdf';
var throttle = require("lodash.throttle");

var PDFController = require("./lib/pdf-controller");
var container = document.getElementById("pdf-container");
var controller = new PDFController(container);

controller.loadDocument(pdfURL).then(function () {
    document.getElementById('prev').addEventListener('click', controller.prevPage.bind(controller));
    document.getElementById('next').addEventListener('click', controller.nextPage.bind(controller));
}).catch(function (error) {
    console.error(error);
});
container.addEventListener(controller.events.before_pdf_rendering, function (event) {
    controller.domMapObject.canvas.style.opacity = 0.2;
});
container.addEventListener(controller.events.after_pdf_rendering, function (event) {
    controller.domMapObject.canvas.style.opacity = 1.0;
});

document.onkeydown = function (e) {
    var kc = e.keyCode;
    if (kc === 37 || kc === 40 || kc === 8 || kc === 72 || kc === 74 || kc === 33) {
        // left, down, H, J, backspace, PgUp - BACK
        controller.prevPage();
    } else if (kc === 38 || kc === 39 || kc === 32 || kc === 75 || kc === 76 || kc === 34) {
        // up, right, K, L, space, PgDn - FORWARD
        controller.nextPage();
    }
};

window.addEventListener("resize", throttle(function (event) {
    controller.fitItSize();
}, 100));