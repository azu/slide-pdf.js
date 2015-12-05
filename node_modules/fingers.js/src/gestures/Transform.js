/**
 * @module gestures
 *
 * @class Transform
 * @constructor
 * @param {Object} pOptions
 * @param {Function} pHandler
 * @return {Transform}
 */


var Transform = (function (_super) {

    var DEFAULT_OPTIONS = {
        rotation: true,
        scale: true
    };

    function Transform(pOptions) {
        _super.call(this, pOptions, DEFAULT_OPTIONS);

        this.data = {
            totalRotation: 0,
            deltaRotation: 0,
            totalScale: 1,
            deltaScale: 1
        };
    }

    Fingers.__extend(Transform.prototype, _super.prototype, {

        _startAngle: 0,
        _lastAngle: 0,
        _startDistance: 0,
        _lastDistance: 0,
        data: null,

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(!this.isListening && pFingerList.length >= 2) {
                this._addListenedFingers(pFingerList[0], pFingerList[1]);

                if(this.options.rotation) {
                    this._lastAngle = this._getFingersAngle();
                    this._startAngle = this._lastAngle;
                    this.data.totalRotation = 0;
                    this.data.deltaRotation = 0;
                }

                if(this.options.scale) {
                    this._lastDistance = this._getFingersDistance();
                    this._startDistance = this._lastDistance;
                    this.data.totalScale = 1;
                    this.data.deltaScale = 1;
                }

                this.fire(_super.EVENT_TYPE.start, this.data);
            }
        },

        _onFingerUpdate: function(pFinger) {
            if(this.options.rotation) {
                var newAngle = this._getFingersAngle();
                this.data.totalRotation = this._startAngle - newAngle;
                this.data.deltaRotation = this._lastAngle - newAngle;
                this._lastAngle = newAngle;
            }

            if(this.options.scale) {
                var newDistance = this._getFingersDistance();
                this.data.totalScale = newDistance / this._startDistance;
                this.data.deltaScale = newDistance / this._lastDistance;
                this._lastDistance = newDistance;
            }

            this.fire(_super.EVENT_TYPE.move, this.data);
        },

        _onFingerRemoved: function(pFinger) {
            this.fire(_super.EVENT_TYPE.end, this.data);

            this._removeAllListenedFingers();
        },

        _getFingersAngle: function() {
            return Fingers.FingerUtils.getFingersAngle(this.listenedFingers[0], this.listenedFingers[1]);
        },

        _getFingersDistance: function() {
            return Fingers.FingerUtils.getFingersDistance(this.listenedFingers[0], this.listenedFingers[1]);
        }
    });

    return Transform;
})(Fingers.Gesture);

Fingers.gesture.Transform = Transform;


/**
 * @module gestures
 *
 * @class Rotate
 * @constructor
 * @param {Object} pOptions
 * @param {Function} pHandler
 * @return {Rotate}
 */

var Rotate = (function (_super) {

    function Rotate(pOptions) {
        pOptions = pOptions || {};
        pOptions.rotation = true;
        pOptions.scale = false;
        _super.call(this, pOptions);
    }

    Fingers.__extend(Rotate.prototype, _super.prototype);

    return Rotate;
})(Transform);

Fingers.gesture.Rotate = Rotate;


/**
 * @module gestures
 *
 * @class Scale
 * @constructor
 * @param {Object} pOptions
 * @return {Pinch}
 */

var Scale = (function (_super) {

    function Scale(pOptions) {
        pOptions = pOptions || {};
        pOptions.rotation = false;
        pOptions.scale = true;
        _super.call(this, pOptions);
    }

    Fingers.__extend(Scale.prototype, _super.prototype);

    return Scale;
})(Transform);

Fingers.gesture.Scale = Scale;