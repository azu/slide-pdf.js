/**
 * @module gestures
 *
 * @class Hold
 * @constructor
 * @param {Object} pOptions
 * @return {Swipe}
 */



var Hold = (function (_super) {

    var DEFAULT_OPTIONS = {
        nbFingers: 1,
        disanceThreshold: 10,
        duration: 500
    };

    function Hold(pOptions) {
        _super.call(this, pOptions, DEFAULT_OPTIONS);
        this._onHoldTimeLeftF = this._onHoldTimeLeft.bind(this);
    }

    Fingers.__extend(Hold.prototype, _super.prototype, {

        timer: null,

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(!this.isListening && pFingerList.length >= this.options.nbFingers) {
                for(var i=0; i<this.options.nbFingers; i++) {
                    this._addListenedFinger(pFingerList[i]);
                }

                clearTimeout(this.timer);
                this.timer = setTimeout(this._onHoldTimeLeftF, this.options.duration);
            }
        },

        _onFingerUpdate: function(pFinger) {
            var size = this.listenedFingers.length;
            for(var i= 0; i<size; i++) {
                if(this.listenedFingers[i].getDistance() > this.options.disanceThreshold) {
                    this._onHoldCancel();
                    break;
                }
            }
        },

        _onFingerRemoved: function(pFinger) {
            this._onHoldCancel();
        },

        _onHoldTimeLeftF: null,
        _onHoldTimeLeft: function() {
            this.fire(_super.EVENT_TYPE.instant, null);
        },

        _onHoldCancel: function() {
            clearTimeout(this.timer);
            this._removeAllListenedFingers();
        }
    });

    return Hold;
})(Fingers.Gesture);

Fingers.gesture.Hold = Hold;