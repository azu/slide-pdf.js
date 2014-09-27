/**
 * Created by azu on 2014/09/27.
 * LICENSE : MIT
 */
"use strict";

function PDFController(container) {
    this.pdfDoc = null;
    this.scale = 1;
    this.pageNum = 1;
    this.pdfContainer = container;
    var canvas = document.createElement("canvas");
    this.canvas = canvas;
    this.canvasContext = canvas.getContext('2d');
    container.appendChild(canvas);
    var textLayerDiv = document.createElement("div");
    textLayerDiv.setAttribute("class", "textLayer");
    container.appendChild(textLayerDiv);
    this.textLayerDiv = textLayerDiv;
    var annotationLayer = document.createElement("div");
    annotationLayer.setAttribute("class", "annotationLayer");
    container.appendChild(annotationLayer);
    this.annotationLayer = annotationLayer;
}
var prop = PDFController.prototype;
prop.loadDocument = function (url) {
    var that = this;
    return PDFJS.getDocument(url).then(function (pdfDoc_) {
        that.pdfDoc = pdfDoc_;
        that.queueRenderPage(that.pageNum);
    });
};
prop.queueRenderPage = function (pageNum) {
    this.renderPage(pageNum);
};
prop.fitItSize = function () {
    var containerRect = this.pdfContainer.getBoundingClientRect();
    this.canvas.width = containerRect.width;
    this.canvas.height = containerRect.height;
};
prop.renderPage = function renderPage(num) {
    var that = this;
    // Using promise to fetch the page
    return that.pdfDoc.getPage(num).then(function (page) {
        var viewport = page.getViewport(that.canvas.width / page.getViewport(1.0).width);
        that.canvas.height = viewport.height;
        that.canvas.width = viewport.width;
        that.textLayerDiv.style.width = that.canvas.style.width;
        that.textLayerDiv.style.height = that.canvas.style.height;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: that.canvasContext,
            viewport: viewport
        };
        var renderPromise = page.render(renderContext).promise;
        var textLayerPromise = page.getTextContent().then(function (textContent) {
            var textLayerBuilder = new TextLayerBuilder({
                textLayerDiv: that.textLayerDiv,
                viewport: viewport,
                pageIndex: 0
            });
            textLayerBuilder.setTextContent(textContent);
        });
        Promise.all([renderPromise, textLayerPromise]).then(function (result) {
            console.info(result);
            setupAnnotations(page, viewport, annotationLayer);
        });
    });
};
prop.prevPage = function prevPage() {
    if (this.pageNum <= 1) {
        return;
    }
    this.pageNum--;
    this.queueRenderPage(this.pageNum);
};
prop.nextPage = function onNextPage() {
    if (this.pageNum >= this.pdfDoc.numPages) {
        return;
    }
    this.pageNum++;
    this.queueRenderPage(this.pageNum);
};
function setupAnnotations(page, viewport, annotationArea) {
    return page.getAnnotations().then(function (annotationsData) {
        viewport = viewport.clone({
            dontFlip: true
        });
        for (var i = 0; i < annotationsData.length; i++) {
            var data = annotationsData[i];
            if (!data || !data.hasHtml) {
                continue;
            }

            var element = PDFJS.AnnotationUtils.getHtmlElement(data);
            var rect = data.rect;
            var view = page.view;
            rect = PDFJS.Util.normalizeRect([
                rect[0],
                view[3] - rect[1] + view[1],
                rect[2],
                view[3] - rect[3] + view[1]
            ]);
            element.style.left = (rect[0]) + 'px';
            element.style.top = (rect[1]) + 'px';
            element.style.position = 'absolute';

            var transform = viewport.transform;
            var transformStr = 'matrix(' + transform.join(',') + ')';
            CustomStyle.setProp('transform', element, transformStr);
            var transformOriginStr = -rect[0] + 'px ' + -rect[1] + 'px';
            CustomStyle.setProp('transformOrigin', element, transformOriginStr);

            if (data.subtype === 'Link' && !data.url) {
                // In this example,  we do not handle the `Link` annotation without url.
                // If you want to handle these links, see `web/page_view.js`.
                continue;
            }
            annotationArea.appendChild(element);
        }
    });
}

module.exports = PDFController;