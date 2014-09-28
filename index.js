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
controller.loadDocument(pdfURL).then(initializedEvent).catch(function (error) {
    console.error(error);
});
container.addEventListener(controller.events.before_pdf_rendering, function (event) {
    var context = controller.canvasContext;
    var cornerColor = getCornerColor(context);
    container.style.backgroundColor = cornerColor;
    document.body.style.backgroundColor = cornerColor;
    controller.domMapObject.canvas.style.visibility = "hidden";
});
container.addEventListener(controller.events.after_pdf_rendering, function (event) {
    var context = controller.canvasContext;
    var cornerColor = getCornerColor(context);
    container.style.backgroundColor = cornerColor;
    document.body.style.backgroundColor = cornerColor;
    controller.domMapObject.canvas.style.visibility = "visible";
});

function initializedEvent() {
    document.getElementById('js-prev').addEventListener('click', controller.prevPage.bind(controller));
    document.getElementById('js-next').addEventListener('click', controller.nextPage.bind(controller));

    window.addEventListener("resize", throttle(function (event) {
        controller.fitItSize();
    }, 100));
    document.onkeydown = function (event) {
        var kc = event.keyCode;
        console.log(event.keyCode);
        if (event.shiftKey || event.ctrlKey || event.metaKey) {
            return;
        }
        if (kc === 37 || kc === 40 || kc === 75 || kc === 65) {
            // left, down, K, A
            event.preventDefault();
            controller.prevPage();
        } else if (kc === 38 || kc === 39 || kc === 74 || kc === 83) {
            // up, right, J, S
            event.preventDefault();
            controller.nextPage();
        }

    };
    // swipe
    var hammertime = new Hammer(document.body);
    hammertime.on('swipeleft', function (event) {
        controller.nextPage();
    });

    hammertime.on('swiperight', function (event) {
        controller.prevPage();

    });
}
