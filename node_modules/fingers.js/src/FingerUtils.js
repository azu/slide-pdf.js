/**
 * @module fingers
 *
 * @class FingerUtils
 */

var FingerUtils = {

    getFingersAngle: function(pFinger1, pFinger2) {
        return Utils.getAngle(pFinger2.currentP.x - pFinger1.currentP.x, pFinger2.currentP.y - pFinger1.currentP.y);
    },

    getFingersDistance: function(pFinger1, pFinger2) {
        return Utils.getDistance(pFinger2.currentP.x - pFinger1.currentP.x, pFinger2.currentP.y - pFinger1.currentP.y);
    },

    getFingersCenter: function(pFinger1, pFinger2) {
        return {
            x: Math.round((pFinger1.currentP.x + pFinger2.currentP.x) / 2),
            y: Math.round((pFinger1.currentP.y + pFinger2.currentP.y) / 2)
        };
    },

    getMultipleFingersCenter: function(pFinger1, pFinger2, pFinger3, pFinger4, pFinger5) {
        var center = {
            x: 0,
            y: 0
        };
        var size = arguments.length;
        for(var i= 0; i<size; i++) {
            center.x += arguments[i].currentP.x;
            center.y += arguments[i].currentP.y;
        }
        center.x = Math.round(center.x / size);
        center.y = Math.round(center.y / size);

        return center;
    }
};

Fingers.FingerUtils = FingerUtils;


