"use strict";
var query = require("querystring").parse(location.search.slice(1));
if (query.slide == null) {
    alert("Please URL: ?slide=<PDF URL>");
}
var pdfURL = query.slide;
var throttle = require("lodash.throttle");
var PDFController = require("pdf.js-controller");
var container = document.getElementById("pdf-container");
var controller = new PDFController({
    container: container,
    pdfjsDistDir: "./node_modules/pdfjs-dist/"
});

controller.loadDocument(pdfURL).then(initializedEvent).catch(function (error) {
    console.error(error);
});
function getCornerColor(context) {
    var canvasColor = context.getImageData(0, 0, 1, 1);
    var pixels = canvasColor.data;
    var r = pixels[0];
    var g = pixels[1];
    var b = pixels[2];
    return "rgb(" + r + ',' + g + ',' + b + ")";
}

container.addEventListener(PDFController.Events.before_pdf_rendering, function (event) {
    var context = controller.canvasContext;
    var cornerColor = getCornerColor(context);
    container.style.backgroundColor = cornerColor;
    document.body.style.backgroundColor = cornerColor;
    controller.domMapObject.canvas.style.visibility = "hidden";
});
container.addEventListener(PDFController.Events.after_pdf_rendering, function (event) {
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
    if (Fingers.Instance.IS_MOBILE) {
        var fingers = new Fingers(document.body);
        var swipeGesture = fingers.addGesture(Fingers.gesture.Swipe);
        swipeGesture.addHandler(function (type, data, fingers) {
            if (data.direction === "left") {
                controller.nextPage();
            } else if (data.direction === "right") {
                controller.prevPage();
            }
        });
    }
}

