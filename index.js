/**
 * Created by azu on 2014/09/24.
 * LICENSE : MIT
 */
"use strict";
//
// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
//
var url = './test/fixtures/slide.pdf';
var PDFController = require("./lib/pdf-controller");
var controller = new PDFController(document.getElementById("pdf-container"));
controller.fitItSize();
controller.loadDocument(url).then(function () {
    document.getElementById('prev').addEventListener('click', controller.prevPage);
    document.getElementById('next').addEventListener('click', controller.nextPage);
}).catch(function (error) {
    console.error(error);
});
