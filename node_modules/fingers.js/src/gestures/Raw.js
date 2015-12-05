/**
 * @module gestures
 *
 * @class Raw
 * @constructor
 * @param {Object} pOptions
 * @return {Raw}
 */


var Raw = (function (_super) {

    var DEFAULT_OPTIONS = {
        nbMaxFingers: Number.MAX_VALUE
    };

    function Raw(pOptions) {
        _super.call(this, pOptions, DEFAULT_OPTIONS);
    }


    Fingers.__extend(Raw.prototype, _super.prototype, {

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(this.listenedFingers.length < this.options.nbMaxFingers) {
                this._addListenedFinger(pNewFinger);

                this.fire(_super.EVENT_TYPE.start, pNewFinger);
            }
        },

        _onFingerUpdate: function(pFinger) {
            this.fire(_super.EVENT_TYPE.move, pFinger);
        },

        _onFingerRemoved: function(pFinger) {
            this.fire(_super.EVENT_TYPE.end, pFinger);

            this._removeListenedFinger(pFinger);
        }
    });

    return Raw;
})(Fingers.Gesture);

Fingers.gesture.Raw = Raw;