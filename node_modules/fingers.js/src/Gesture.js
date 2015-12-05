/**
 * @module fingers
 *
 * @class Gesture
 * @constructor
 * @param {Object} pOptions
 * @param {Object} pDefaultOptions
 * @return {Gesture}
 */

var Gesture = function(pOptions, pDefaultOptions) {
    this.options = Fingers.__extend({}, pDefaultOptions || {}, pOptions || {});
    this._handlerList = [];
    this.listenedFingers = [];
};

Gesture.EVENT_TYPE = {
    instant: "instant",
    start: "start",
    end: "end",
    move: "move"
};

Gesture.prototype = {

    options: null,
    _handlerList: null,
    _handlerListSize: 0,

    isListening: false,
    listenedFingers: null,

    /*---- Handlers ----*/
    addHandler: function(pHandler) {
        this._handlerList.push(pHandler);
        this._handlerListSize++;

        return this;
    },

    removeHandler: function(pHandler) {
        var index = this._handlerList.indexOf(pHandler);
        this._handlerList.splice(index, 1);
        this._handlerListSize--;

        return this;
    },

    removeAllHandlers: function() {
        this._handlerList.length = 0;
        this._handlerListSize = 0;

        return this;
    },

    fire: function(pType, pData) {
        for(var i=0; i<this._handlerListSize; i++) {
            this._handlerList[i](pType, pData, this.listenedFingers);
        }
    },

    /*---- Fingers events ----*/
    _onFingerAdded: function(pNewFinger, pFingerList) { /*To Override*/ },

    _onFingerUpdate: function(pFinger) { /*To Override*/ },

    _onFingerRemoved: function(pFinger) { /*To Override*/ },

    /*---- Actions ----*/
    _addListenedFingers: function(pFinger1, pFinger2, pFinger3) {
        for(var i= 0, size=arguments.length; i<size; i++) {
            this._addListenedFinger(arguments[i]);
        }
    },
    _addListenedFinger: function(pFinger) {
        this.listenedFingers.push(pFinger);
        pFinger._addHandlerObject(this);

        if(!this.isListening) {
            this.isListening = true;
        }
    },

    _removeListenedFingers: function(pFinger1, pFinger2, pFinger3) {
        for(var i= 0, size=arguments.length; i<size; i++) {
            this._removeListenedFinger(arguments[i]);
        }
    },
    _removeListenedFinger: function(pFinger) {
        pFinger._removeHandlerObject(this);

        var index = this.listenedFingers.indexOf(pFinger);
        this.listenedFingers.splice(index, 1);

        if(this.listenedFingers.length === 0) {
            this.isListening = false;
        }
    },

    _removeAllListenedFingers: function() {
        var finger;
        for(var i= 0, size=this.listenedFingers.length; i<size; i++) {
            finger = this.listenedFingers[i];

            finger._removeHandlerObject(this);
        }

        this.listenedFingers.length = 0;
        this.isListening = false;
    },

    /*---- Utils ----*/
    isListenedFinger: function(pFinger) {
        return (this.isListening && this.getListenedPosition(pFinger) > -1);
    },

    getListenedPosition: function(pFinger) {
        return this.listenedFingers.indexOf(pFinger);
    }
};

Fingers.Gesture = Gesture;