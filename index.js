/**
 * Created by azu on 2014/09/24.
 * LICENSE : MIT
 */
"use strict";
var pdfURL = './test/fixtures/sourcemap.pdf';
var throttle = require("lodash.throttle");
// define lang
PDFJS.cMapUrl = "../cmaps/";
PDFJS.cMapPacked = true;
var PDFController = require("./lib/pdf-controller");
var container = document.getElementById("pdf-container");
var controller = new PDFController(container);

function getCornerColor(context) {
    var canvasColor = context.getImageData(0, 0, 1, 1);
    var pixels = canvasColor.data;
    var r = pixels[0];
    var g = pixels[1];
    var b = pixels[2];
    return "rgb(" + r + ',' + g + ',' + b + ")";
}
controller.loadDocument(pdfURL).then(function () {
    document.getElementById('prev').addEventListener('click', controller.prevPage.bind(controller));
    document.getElementById('next').addEventListener('click', controller.nextPage.bind(controller));
}).catch(function (error) {
    console.error(error);
});
container.addEventListener(controller.events.before_pdf_rendering, function (event) {
    var context = controller.canvasContext;
    var cornerColor = getCornerColor(context);
    container.style.backgroundColor = cornerColor;
    document.body.style.backgroundColor = cornerColor;
    controller.domMapObject.canvas.style.display = "none";
});
container.addEventListener(controller.events.after_pdf_rendering, function (event) {
    var context = controller.canvasContext;
    var cornerColor = getCornerColor(context);
    container.style.backgroundColor = cornerColor;
    document.body.style.backgroundColor = cornerColor;
    controller.domMapObject.canvas.style.display = "";
});

document.onkeydown = function (event) {
    var kc = event.keyCode;
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
        return;
    }
    if (kc === 37 || kc === 40 || kc === 8 || kc === 72) {
        // left, down, H, J, backspace, PgUp - BACK
        event.preventDefault();
        controller.prevPage();
    } else if (kc === 38 || kc === 39 || kc === 32 || kc === 75 || kc === 76 || kc === 34) {
        // up, right, K, L, space, PgDn - FORWARD
        event.preventDefault();
        controller.nextPage();
    }
};

window.addEventListener("resize", throttle(function (event) {
    controller.fitItSize();
}, 100));

// swipe
var hammertime = new Hammer(container);
hammertime.on('swipeleft', function(event) {
    controller.nextPage();
});

hammertime.on('swiperight', function(event) {
    controller.prevPage();

});
