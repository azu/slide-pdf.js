// LICENSE : MIT
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

global.PDFJS = global.PDFJS || {};
//const stringToWorkerSrc = require("./string-to-worker-src");
//const workerCode = require("fs").readFileSync(__dirname + '/../node_modules/pdfjs-dist/build/pdf.worker.js', "utf-8");
require('pdfjs-dist/build/pdf.combined.js');
require('pdfjs-dist/web/compatibility.js');
require("custom-event-polyfill");
var TextLayerBuilder = require('./pdf.js-contrib/text_layer_builder').TextLayerBuilder;
var domify = require('domify');
var domMap = require('./dom-map');
var defaultInnerHTML = '<div class="pdf-slide-progress">\n    <div class="pdf-slide-progress-bar"></div>\n</div>\n<div class="pdf-loading"></div>\n<canvas class="pdf-canvas"></canvas>\n<div class="pdf-textLayer"></div>\n<div class="pdf-annotationLayer"></div>';
module.exports = (function () {
    function PDFJSController(_ref) {
        var container = _ref.container;
        var innerHTML = _ref.innerHTML;
        var pageNumber = _ref.pageNumber;
        var pdfjsDistDir = _ref.pdfjsDistDir;

        _classCallCheck(this, PDFJSController);

        this.pdfContainer = container;
        if (pdfjsDistDir) {
            var pdfjsDistDirWithoutSuffix = pdfjsDistDir.replace(/\/$/, '');
            global.PDFJS.workerSrc = pdfjsDistDirWithoutSuffix + '/build/pdf.worker.js';
            global.PDFJS.cMapUrl = pdfjsDistDirWithoutSuffix + '/cmaps/';
            global.PDFJS.cMapPacked = true;
        }
        this.pdfDoc = null;
        this.pageNum = pageNumber || 1;
        this.promiseQueue = Promise.resolve();
        this.pdfContainer = container;
        var html = innerHTML || defaultInnerHTML;
        var dom = domify(html);
        /*
         * @type {Object.<string, Node>}
         */
        var mapping = {
            progressBar: '.pdf-slide-progress-bar',
            canvas: '.pdf-canvas',
            textLayer: '.pdf-textLayer',
            annotationLayer: '.pdf-annotationLayer',
            loading: '.pdf-loading'
        };
        this.domMapObject = domMap(dom, mapping);
        container.appendChild(dom);
        this.canvasContext = this.domMapObject.canvas.getContext('2d');
        this.fitItSize();
    }

    _createClass(PDFJSController, [{
        key: 'loadDocument',
        value: function loadDocument(url) {
            var _this = this;

            // load complete
            var loading = this.domMapObject.loading;
            function hideLoadingIcon() {
                loading.style.display = 'none';
            }

            this.pdfContainer.addEventListener(this.constructor.Events.before_pdf_rendering, hideLoadingIcon);
            return PDFJS.getDocument(url).then(function (pdfDoc_) {
                _this.pdfDoc = pdfDoc_;
                return _this._queueRenderPage(_this.pageNum);
            }).then(function () {
                _this.pdfContainer.removeEventListener(_this.constructor.Events.before_pdf_rendering, hideLoadingIcon);
            });
        }
    }, {
        key: '_queueRenderPage',
        value: function _queueRenderPage(pageNum) {
            var _this2 = this;

            if (this.pdfDoc == null) {
                return this.promiseQueue;
            }
            this.promiseQueue = this.promiseQueue.then(function () {
                return _this2.renderPage(pageNum);
            });
            return this.promiseQueue;
        }
    }, {
        key: 'fitItSize',
        value: function fitItSize() {
            var _this3 = this;

            return new Promise(function (resolve) {
                var containerRect = _this3.pdfContainer.getBoundingClientRect();
                _this3.domMapObject.canvas.width = containerRect.width;
                _this3.domMapObject.canvas.height = containerRect.height;
                resolve(containerRect);
            }).then(function () {
                return _this3._queueRenderPage(_this3.pageNum);
            });
        }
    }, {
        key: '_cleanup',
        value: function _cleanup() {
            var range = document.createRange();
            var domMapObject = this.domMapObject;
            range.selectNodeContents(domMapObject.textLayer);
            range.deleteContents();
            range.selectNodeContents(domMapObject.annotationLayer);
            range.deleteContents();
        }
    }, {
        key: 'renderPage',
        value: function renderPage(pageNum) {
            var _this4 = this;

            var beforeEvent = new CustomEvent(this.constructor.Events.before_pdf_rendering, { detail: this });
            this.pdfContainer.dispatchEvent(beforeEvent);
            // Using promise to fetch the page
            return this.pdfDoc.getPage(pageNum).then(function (page) {
                _this4._cleanup();
                var domMapObject = _this4.domMapObject;
                var viewport = page.getViewport(domMapObject.canvas.width / page.getViewport(1).width);
                domMapObject.canvas.height = viewport.height;
                domMapObject.canvas.width = viewport.width;
                domMapObject.textLayer.style.width = domMapObject.canvas.style.width;
                domMapObject.textLayer.style.height = domMapObject.canvas.style.height;
                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: _this4.canvasContext,
                    viewport: viewport
                };
                var renderPromise = page.render(renderContext).promise;
                var textLayerPromise = page.getTextContent().then(function (textContent) {
                    var textLayerBuilder = new TextLayerBuilder({
                        textLayerDiv: domMapObject.textLayer,
                        viewport: viewport,
                        pageIndex: 0
                    });
                    textLayerBuilder.setTextContent(textContent);
                    textLayerBuilder.render();
                });
                return Promise.all([renderPromise, textLayerPromise]).then(function (result) {
                    _this4._setupAnnotations(page, viewport, domMapObject.annotationLayer);
                });
            }).then(function () {
                _this4._updateProgress(pageNum);
                var afterEvent = new CustomEvent(_this4.constructor.Events.after_pdf_rendering, { detail: _this4 });
                _this4.pdfContainer.dispatchEvent(afterEvent);
            });
        }
    }, {
        key: 'prevPage',
        value: function prevPage() {
            if (this.pageNum <= 1) {
                return;
            }
            this.pageNum--;
            return this._queueRenderPage(this.pageNum);
        }
    }, {
        key: 'nextPage',
        value: function nextPage() {
            if (this.pageNum >= this.pdfDoc.numPages) {
                return;
            }
            this.pageNum++;
            return this._queueRenderPage(this.pageNum);
        }
    }, {
        key: '_updateProgress',
        value: function _updateProgress(pageNum) {
            var progressBar = this.domMapObject.progressBar;
            if (progressBar !== null) {
                var numSlides = this.pdfDoc.numPages;
                var position = pageNum - 1;
                var percent = numSlides === 1 ? 100 : 100 * position / (numSlides - 1);
                progressBar.style.width = percent.toString() + '%';
            }
        }
    }, {
        key: '_setupAnnotations',
        value: function _setupAnnotations(page, viewport, annotationArea) {
            return page.getAnnotations().then(function (annotationsData) {
                var cViewport = viewport.clone({ dontFlip: true });
                for (var i = 0; i < annotationsData.length; i++) {
                    var data = annotationsData[i];
                    if (!data || !data.hasHtml) {
                        continue;
                    }
                    var element = PDFJS.AnnotationUtils.getHtmlElement(data);
                    var rect = data.rect;
                    var view = page.view;
                    rect = PDFJS.Util.normalizeRect([rect[0], view[3] - rect[1] + view[1], rect[2], view[3] - rect[3] + view[1]]);
                    element.style.left = rect[0] + 'px';
                    element.style.top = rect[1] + 'px';
                    element.style.position = 'absolute';
                    var transform = cViewport.transform;
                    var transformStr = 'matrix(' + transform.join(',') + ')';
                    PDFJS.CustomStyle.setProp('transform', element, transformStr);
                    var transformOriginStr = -rect[0] + 'px ' + -rect[1] + 'px';
                    PDFJS.CustomStyle.setProp('transformOrigin', element, transformOriginStr);
                    if (data.subtype === 'Link' && !data.url) {
                        // In this example,  we do not handle the `Link` annotation without url.
                        // If you want to handle these links, see `web/page_view.js`.
                        continue;
                    }
                    annotationArea.appendChild(element);
                }
            });
        }
    }], [{
        key: 'Events',
        get: function get() {
            return {
                'before_pdf_rendering': 'before-pdf-rendering',
                'after_pdf_rendering': 'after_pdf_rendering'
            };
        }
    }]);

    return PDFJSController;
})();
//# sourceMappingURL=PDFJSController.js.map