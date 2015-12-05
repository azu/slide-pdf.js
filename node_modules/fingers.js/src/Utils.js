/**
 * @module fingers
 *
 * @class Utils
 */

var Utils = {

    DIRECTION: {
        UP: 'up',
        DOWN: 'down',
        LEFT: 'left',
        RIGHT: 'right'
    },

    GROW: {
        IN: 'in',
        OUT: 'out'
    },

    getVelocity: function(deltaTime, deltaPos) {
        return Math.abs(deltaPos / deltaTime) || 0;
    },

    getOrientedVelocity: function(deltaTime, deltaPos) {
        return (deltaPos / deltaTime) || 0;
    },

    getAngle: function(x, y) {
        return Math.atan2(x, y);
    },

    getDirection: function(deltaX, deltaY) {
        if(Math.abs(deltaX) >= Math.abs(deltaY)) {
            return (deltaX > 0) ? this.DIRECTION.RIGHT : this.DIRECTION.LEFT;
        }
        else {
            return (deltaY > 0) ? this.DIRECTION.DOWN : this.DIRECTION.UP;
        }
    },

    isVertical: function isVertical(direction) {
        return direction === this.DIRECTION.UP || direction === this.DIRECTION.DOWN;
    },

    getDistance: function(x, y) {
        return Math.sqrt((x * x) + (y * y));
    }
};

Fingers.Utils = Utils;


