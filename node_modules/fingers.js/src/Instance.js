/**
 * @module fingers
 */

/**
 * create new fingers instance
 * all methods should return the instance itself, so it is chainable.
 *
 * @class Instance
 * @constructor
 * @param {HTMLElement} pElement
 * @return {Instance}
 */

var Instance = function(pElement) {
    this._init(pElement);
};

Instance.HAS_TOUCHEVENTS = ('ontouchstart' in window);
Instance.IS_MOBILE = /mobile|tablet|ip(ad|hone|od)|android|silk/i.test(navigator.userAgent);
Instance.LISTEN_TOUCH_EVENTS = (Instance.HAS_TOUCHEVENTS && Instance.IS_MOBILE);

/**
 * @property FINGER_MAP
 * @type {Object.<Number>, Finger>}
 */
Instance.FINGER_MAP = {};

Instance.prototype = {
    /**
     * @property element
     * @type {HTMLElement}
     */
    element: null,

    /**
     * @property fingerList
     * @type {Array.<Finger>}
     */
    fingerList: null,

    /**
     * @property fingerCreatedMap
     * @type {Object.<Number>, Finger>}
     */
    fingerCreatedMap: null,

    /**
     * @property fingerIdList
     * @type {Array.<Gesture>}
     */
    gestureList: null,

    /*---- INIT ----*/
    _init: function(pElement) {
        this.element = pElement;
        this.fingerList = [];
        this.fingerCreatedMap = {};
        this.gestureList = [];

        this.startListening();
    },

    getElement: function() {
        return this.element;
    },

    /*---- gestures ----*/
    getGestures: function() {
        return this.gestureList;
    },

    addGesture: function(PGestureClass, pOptions) {
        var gesture = new PGestureClass(pOptions);
        this.gestureList.push(gesture);

        return gesture;
    },

    removeGesture: function(pGesture) {
        pGesture.removeAllHandlers();
        var index = this.gestureList.indexOf(pGesture);
        this.gestureList.splice(index, 1);
    },

    removeAllGestures: function() {
        for(var i= 0, size=this.gestureList.length; i<size; i++) {
            this.gestureList[i].removeAllHandlers();
        }
        this.gestureList.length = 0;
    },

    /*---- Native event listening ----*/
    startListening: function() {
        if(this._stopListeningF === null) {
            var _this = this;
            if(Instance.LISTEN_TOUCH_EVENTS) {
                var onTouchStartF = this._onTouchStart.bind(this);
                var onTouchMoveF = this._onTouchMove.bind(this);
                var onTouchEndF = this._onTouchEnd.bind(this);
                var onTouchCancelF = this._onTouchCancel.bind(this);

                this.element.addEventListener("touchstart", onTouchStartF);
                this.element.addEventListener("touchmove", onTouchMoveF);
                this.element.addEventListener("touchend", onTouchEndF);
                this.element.addEventListener("touchcancel", onTouchCancelF);

                this._stopListeningF = function() {
                    _this.element.removeEventListener("touchstart", onTouchStartF);
                    _this.element.removeEventListener("touchmove", onTouchMoveF);
                    _this.element.removeEventListener("touchend", onTouchEndF);
                    _this.element.removeEventListener("touchcancel", onTouchCancelF);
                };
            }
            else {
                this._onMouseMoveF = this._onMouseMove.bind(this);
                this._onMouseUpF = this._onMouseUp.bind(this);

                var onMouseDownF = this._onMouseDown.bind(this);
                this.element.addEventListener("mousedown", onMouseDownF);

                this._stopListeningF = function() {
                    _this.element.removeEventListener("mousedown", onMouseDownF);
                    document.removeEventListener("mousemove", this._onMouseMoveF);
                    document.removeEventListener("mouseup", this._onMouseUpF);
                };
            }
        }
    },

    _stopListeningF: null,
    stopListening: function() {
        if(this._stopListeningF !== null) {
            this._removeAllFingers(Date.now());

            this._stopListeningF();
            this._stopListeningF = null;
        }
    },

    /*-------- Touch events ----*/
    _onTouchStart: function(pTouchEvent) {
        var touch;
        for(var i= 0, size=pTouchEvent.changedTouches.length; i<size; i++) {
            touch = pTouchEvent.changedTouches[i];
            this._createFinger(touch.identifier, pTouchEvent.timeStamp, touch.pageX, touch.pageY);
        }
    },

    _onTouchMove: function(pTouchEvent) {
        var touch;
        for(var i= 0, size=pTouchEvent.changedTouches.length; i<size; i++) {
            touch = pTouchEvent.changedTouches[i];
            this._updateFingerPosition(touch.identifier, pTouchEvent.timeStamp, touch.pageX, touch.pageY);
        }

        pTouchEvent.preventDefault();
    },

    _onTouchEnd: function(pTouchEvent) {
        for(var i= 0, size=pTouchEvent.changedTouches.length; i<size; i++) {
            this._removeFinger(pTouchEvent.changedTouches[i].identifier, pTouchEvent.timeStamp);
        }
    },

    _onTouchCancel: function(pTouchEvent) {
        //Security to prevent chrome bugs
        var finger;
        for(var i= 0, size=pTouchEvent.changedTouches.length; i<size; i++) {
            finger = Instance.FINGER_MAP[pTouchEvent.changedTouches[i].identifier];
            if(finger !== undefined && this._getFingerPosition(finger) !== -1) {
                //Remove all fingers
                this._removeAllFingers(pTouchEvent.timeStamp);
                break;
            }
        }
    },

    /*-------- Mouse events ----*/
    _onMouseDown: function(pMouseEvent) {
        if(pMouseEvent.button === 0) {
            //Prevention against alert popups that loose mouse finger reference
            var finger = Instance.FINGER_MAP[pMouseEvent.button];
            if(finger === undefined || this._getFingerPosition(finger) === -1) {
                document.addEventListener("mousemove", this._onMouseMoveF);
                document.addEventListener("mouseup", this._onMouseUpF);

                this._createFinger(pMouseEvent.button, pMouseEvent.timeStamp, pMouseEvent.pageX, pMouseEvent.pageY);

                pMouseEvent.preventDefault();
            }
        }
    },

    _onMouseMoveF: null,
    _onMouseMove: function(pMouseEvent) {
        if(pMouseEvent.button === 0) {
            this._updateFingerPosition(pMouseEvent.button, pMouseEvent.timeStamp, pMouseEvent.pageX, pMouseEvent.pageY);
        }
    },

    _onMouseUpF: null,
    _onMouseUp: function(pMouseEvent) {
        //In all cases, remove listener
        document.removeEventListener("mousemove", this._onMouseMoveF);
        document.removeEventListener("mouseup", this._onMouseUpF);

        this._removeFinger(0, pMouseEvent.timeStamp);
    },

    /*---- Fingers ----*/
    _createFinger: function(pFingerId, pTimestamp, pX, pY) {
        var finger;
        if(Instance.FINGER_MAP[pFingerId] === undefined) {
            finger = new Finger(pFingerId, pTimestamp, pX, pY);
            Instance.FINGER_MAP[pFingerId] = finger;
            this.fingerCreatedMap[pFingerId] = finger;
        }
        else {
            finger = Instance.FINGER_MAP[pFingerId];
        }

        this.fingerList.push(finger);
        finger.nbListeningInstances++;

        for(var i=0, size=this.gestureList.length; i<size; i++) {
            this.gestureList[i]._onFingerAdded(finger, this.fingerList);
        }
    },

    _removeFinger: function(pFingerId, pTimestamp) {
        var finger = Instance.FINGER_MAP[pFingerId];
        if(finger !== undefined) {
            this.fingerList.splice(this._getFingerPosition(finger), 1);
            delete this.fingerCreatedMap[finger.id];
            finger.nbListeningInstances--;

            //Only last one can remove a finger
            if(finger.nbListeningInstances === 0) {
                finger._setEndP(pTimestamp);
                delete Instance.FINGER_MAP[finger.id];

                finger._clearHandlerObjects();
            }
        }
    },

    _removeAllFingers: function(pTimestamp) {
        var list = this.fingerList.splice(0);
        for(var i= 0, size=list.length; i<size; i++) {
            this._removeFinger(list[i].id, pTimestamp);
        }
    },

    _updateFingerPosition: function(pFingerId, pTimestamp, pX, pY) {
        //Only creator can update a finger
        var finger = this.fingerCreatedMap[pFingerId];
        if(finger !== undefined) {
            finger._setCurrentP(pTimestamp, pX, pY);
        }
    },

    /*---- utils ----*/
    _getFingerPosition: function(pFinger) {
        return this.fingerList.indexOf(pFinger);
    }

};




Fingers.Instance = Instance;