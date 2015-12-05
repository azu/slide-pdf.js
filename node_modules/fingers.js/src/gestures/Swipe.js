/**
 * @module gestures
 *
 * @class Swipe
 * @constructor
 * @param {Object} pOptions
 * @return {Swipe}
 */



var Swipe = (function (_super) {

    var DEFAULT_OPTIONS = {
        nbFingers: 1,
        swipeVelocityX: 0.6,
        swipeVelocityY: 0.6
    };

    function Swipe(pOptions) {
        _super.call(this, pOptions, DEFAULT_OPTIONS);

        this.data = {
            direction: null,
            velocity: 0
        };
    }

    Fingers.__extend(Swipe.prototype, _super.prototype, {

        data: null,

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(!this.isListening && pFingerList.length >= this.options.nbFingers) {
                for(var i=0; i<this.options.nbFingers; i++) {
                    this._addListenedFinger(pFingerList[i]);
                }
            }
        },

        _onFingerUpdate: function(pFinger) {
        },

        _onFingerRemoved: function(pFinger) {
            var isSameDirection = true;
            var direction = this.listenedFingers[0].getDeltaDirection();
            var maxVelocityX = 0;
            var maxVelocityY = 0;

            var size = this.listenedFingers.length;
            for(var i= 0; i<size; i++) {
                isSameDirection = isSameDirection && (direction === this.listenedFingers[i].getDeltaDirection());

                maxVelocityX = Math.max(maxVelocityX, this.listenedFingers[i].getVelocityX());
                maxVelocityY = Math.max(maxVelocityY, this.listenedFingers[i].getVelocityY());
            }

            if(isSameDirection &&
                (maxVelocityX > this.options.swipeVelocityX || maxVelocityY > this.options.swipeVelocityY)) {
                this.data.direction = direction;
                this.data.velocity = (maxVelocityX > this.options.swipeVelocityX) ? maxVelocityX : maxVelocityY;

                this.fire(_super.EVENT_TYPE.instant, this.data);
            }

            this._removeAllListenedFingers();
        }
    });

    return Swipe;
})(Fingers.Gesture);

Fingers.gesture.Swipe = Swipe;