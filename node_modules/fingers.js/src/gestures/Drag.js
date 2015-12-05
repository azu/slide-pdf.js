/**
 * @module gestures
 *
 * @class Drag
 * @constructor
 * @param {Object} pOptions
 * @return {Drag}
 */


var Drag = (function (_super) {

    function Drag(pOptions) {
        _super.call(this, pOptions);
    }


    Fingers.__extend(Drag.prototype, _super.prototype, {

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(!this.isListening) {
                this._addListenedFinger(pNewFinger);

                this.fire(_super.EVENT_TYPE.start, null);
            }
        },

        _onFingerUpdate: function(pFinger) {
            this.fire(_super.EVENT_TYPE.move, null);
        },

        _onFingerRemoved: function(pFinger) {
            this.fire(_super.EVENT_TYPE.end, null);

            this._removeAllListenedFingers();
        }
    });

    return Drag;
})(Fingers.Gesture);

Fingers.gesture.Drag = Drag;