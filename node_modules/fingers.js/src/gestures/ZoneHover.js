/**
 * @module gestures
 *
 * @class ZoneHover
 * @constructor
 * @param {Object} pOptions
 * @return {ZoneHover}
 */


var ZoneHover = (function (_super) {

    var DEFAULT_OPTIONS = {
    };

    function ZoneHover(pOptions) {
        _super.call(this, pOptions, DEFAULT_OPTIONS);
        this._zoneList = [];
        this._zoneMap = {};
    }

    ZoneHover.TYPE = {
        enter: "enter",
        leave: "leave"
    };
    ZoneHover.LAST_ZONE_ID = 0;

    Fingers.__extend(ZoneHover.prototype, _super.prototype, {

        _zoneList: null,
        _zoneMap: null,
        _zoneSize: 0,

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(this.listenedFingers.length === 0) {
                this._addListenedFinger(pNewFinger);

                for(var i=0; i<this._zoneSize; i++) {
                    this._checkZone(this._zoneList[i], pNewFinger);
                }
            }
        },

        _onFingerUpdate: function(pFinger) {
            for(var i=0; i<this._zoneSize; i++) {
                this._checkZone(this._zoneList[i], pFinger);
            }
        },

        _onFingerRemoved: function(pFinger) {
            var zone;
            for(var i=0; i<this._zoneSize; i++) {
                zone = this._zoneList[i];
                if(this._zoneMap[zone.id] === true) {
                    this._fireLeaveZone(zone);
                }
            }

            this._removeListenedFinger(pFinger);
        },

        /**
         * @typedef Zone
         * @type {Object}
         * @property {number} id
         * @property {number} left
         * @property {number} right
         * @property {number} top
         * @property {number} bottom
         */

        /**
         * @param {Zone} pZone
         */
        addZone: function(pZone) {
            if(this._zoneList.indexOf(pZone) === -1) {
                if(pZone.id === undefined) {
                    pZone.id = ZoneHover.LAST_ZONE_ID++;
                }

                this._zoneList.push(pZone);
                this._zoneMap[pZone.id] = false;
                this._zoneSize++;
            }

            return this;
        },

        /**
         * @param {Zone} pZone
         */
        removeZone: function(pZone) {
            var index = this._zoneList.indexOf(pZone);
            if(index !== -1) {
                this._zoneList.splice(index, 1);
                delete this._zoneMap[pZone.id];
                this._zoneSize--;
            }

            return this;
        },

        getHoveredZones: function() {
            var enteredZones = [];
            var zone;
            for(var i=0; i<this._zoneSize; i++) {
                zone = this._zoneList[i];
                if(this._zoneMap[zone.id] === true) {
                    enteredZones.push(zone);
                }
            }

            return enteredZones;
        },

        _checkZone: function(pZone, pFinger) {
            var isInZone = this._isInZone(pZone, pFinger.getX(), pFinger.getY());
            if(this._zoneMap[pZone.id] === false && isInZone) {
                this._zoneMap[pZone.id] = true;
                this._fireEnterZone(pZone);
            }
            else if(this._zoneMap[pZone.id] === true && !isInZone) {
                this._zoneMap[pZone.id] = false;
                this._fireLeaveZone(pZone);
            }
        },

        _fireEnterZone: function(pZone) {
            this.fire(_super.EVENT_TYPE.instant, {
                type: ZoneHover.TYPE.enter,
                zone: pZone
            });
        },

        _fireLeaveZone: function(pZone) {
            this.fire(_super.EVENT_TYPE.instant, {
                type: ZoneHover.TYPE.leave,
                zone: pZone
            });
        },

        _isInZone: function(pZone, pX, pY) {
            return (pX >= pZone.left &&
                pX <= pZone.right &&
                pY >= pZone.top &&
                pY <= pZone.bottom);
        }
    });

    return ZoneHover;
})(Fingers.Gesture);

Fingers.gesture.ZoneHover = ZoneHover;