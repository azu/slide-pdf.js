/**
 * Created by azu on 2014/09/24.
 * LICENSE : MIT
 */
"use strict";
//
// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
//
var url = 'test/fixtures/document.pdf';


//
// Disable workers to avoid yet another cross-origin issue (workers need
// the URL of the script to be loaded, and dynamically loading a cross-origin
// script does not work).
//
// PDFJS.disableWorker = true;

//
// If pdf.js must be execute via eval or pdf.worker.js is located at the
// different location that pdf.js, specify workerSrc.
//
// PDFJS.workerSrc = '../../build/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 0.8,
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d');
var textLayerDiv = document.querySelector("#pdf-container .textLayer");
var annotationLayer = document.querySelector("#pdf-container .annotationLayer");
/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function (page) {
        var viewport = page.getViewport(scale);
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        textLayerDiv.style.width = canvas.style.width;
        textLayerDiv.style.height = canvas.style.height;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        var renderPromise = page.render(renderContext).promise.then(function () {
            pageRendering = false;
            if (pageNumPending !== null) {
                // New page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
        var textLayerPromise = page.getTextContent().then(function (textContent) {
            var textLayerBuilder = new TextLayerBuilder({
                textLayerDiv: textLayerDiv,
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

    // Update page counters
    document.getElementById('page_num').textContent = pageNum;
}

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
            console.info("element", element);
            annotationArea.appendChild(element);
        }
    });
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}
document.getElementById('prev').addEventListener('click', onPrevPage);

/**
 * Displays next page.
 */
function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}
document.getElementById('next').addEventListener('click', onNextPage);

/**
 * Asynchronously downloads PDF.
 */
PDFJS.getDocument(url).then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // Initial/first page rendering
    renderPage(pageNum);
});