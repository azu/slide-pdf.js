/**
 * @module fingers
 *
 * @class Finger
 * @constructor
 * @param {Number} pId
 * @param {Number} pTimestamp
 * @param {Number} pX
 * @param {Number} pY
 * @return {Finger}
 */

var Finger = function(pId, pTimestamp, pX, pY) {
    this.id = pId;
    this.state = Finger.STATE.ACTIVE;
    this._handlerList = [];

    this.startP = new Position(pTimestamp, pX, pY);
    this.previousP = new Position(pTimestamp, pX, pY);
    this.currentP = new Position(pTimestamp, pX, pY);

    this._cacheArray = new CacheArray();
};

var CACHE_INDEX_CREATOR = 0;
Finger.cacheIndexes = {
    deltaTime: CACHE_INDEX_CREATOR++,
    totalTime: CACHE_INDEX_CREATOR++,

    deltaX: CACHE_INDEX_CREATOR++,
    deltaY: CACHE_INDEX_CREATOR++,
    deltaDistance: CACHE_INDEX_CREATOR++,
    totalX: CACHE_INDEX_CREATOR++,
    totalY: CACHE_INDEX_CREATOR++,
    totalDistance: CACHE_INDEX_CREATOR++,

    deltaDirection: CACHE_INDEX_CREATOR++,
    totalDirection: CACHE_INDEX_CREATOR++,

    velocityX: CACHE_INDEX_CREATOR++,
    velocityY: CACHE_INDEX_CREATOR++,
    velocity: CACHE_INDEX_CREATOR++,
    velocityAverage: CACHE_INDEX_CREATOR++,
    orientedVelocityX: CACHE_INDEX_CREATOR++,
    orientedVelocityY: CACHE_INDEX_CREATOR++
};

Finger.STATE = {
    ACTIVE: "active",
    REMOVED: "removed"
};

Finger.CONSTANTS = {
    inactivityTime: 100
};

Finger.prototype = {
    /**
     * @property id
     * @type {Number}
     */
    id: null,
    state: null,
    startP: null,
    previousP: null,
    currentP: null,
    nbListeningInstances: 0,
    _cacheArray: null,
    _handlerList: null,
    _handlerListSize: 0,

    _addHandlerObject: function(pHandlerObject) {
        this._handlerList.push(pHandlerObject);
        this._handlerListSize = this._handlerList.length;
    },

    _removeHandlerObject: function(pHandlerObject) {
        var index = this._handlerList.indexOf(pHandlerObject);
        this._handlerList.splice(index, 1);
        this._handlerListSize = this._handlerList.length;
    },

    _clearHandlerObjects: function() {
        this._handlerList.length = 0;
        this._handlerListSize = 0;
    },

    _setCurrentP: function(pTimestamp, pX, pY, pForceSetter) {
        if(this.getX() != pX || this.getY() != pY || pForceSetter) { //Prevent chrome multiple events for same position (radiusX, radiusY)
            this._cacheArray.clearCache();

            this.previousP.copy(this.currentP);
            this.currentP.set(pTimestamp, pX, pY);

            for(var i= 0; i<this._handlerListSize; i++) {
                this._handlerList[i]._onFingerUpdate(this);
            }
        }
    },

    _setEndP: function(pTimestamp) {
        //Only update if end event is not "instant" with move event
        if((pTimestamp - this.getTime()) > Finger.CONSTANTS.inactivityTime) {
            this._setCurrentP(pTimestamp, this.getX(), this.getY(), true);
        }

        this.state = Finger.STATE.REMOVED;

        var handlerList = this._handlerList.slice(0);
        for(var i= 0; i<handlerList.length; i++) {
            handlerList[i]._onFingerRemoved(this);
        }
    },

    /*---- time ----*/
    getTime: function() {
        return this.currentP.timestamp;
    },

    getDeltaTime: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.deltaTime, this._getDeltaTime, this);
    },
    _getDeltaTime: function() {
        return this.currentP.timestamp - this.previousP.timestamp;
    },

    getTotalTime: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.totalTime, this._getTotalTime, this);
    },
    _getTotalTime: function() {
        return this.currentP.timestamp - this.startP.timestamp;
    },

    getInactivityTime: function() {
        var delta = Date.now() - this.currentP.timestamp;
        return (delta > Finger.CONSTANTS.inactivityTime) ? delta : 0;
    },

    /*---- position ----*/
    getX: function() {
        return this.currentP.x;
    },

    getY: function() {
        return this.currentP.y;
    },

    /*---- distance ----*/
    getDeltaX: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.deltaX, this._getDeltaX, this);
    },
    _getDeltaX: function() {
        return this.currentP.x - this.previousP.x;
    },

    getDeltaY: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.deltaY, this._getDeltaY, this);
    },
    _getDeltaY: function() {
        return this.currentP.y - this.previousP.y;
    },

    getDeltaDistance: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.deltaDistance, this._getDeltaDistance, this);
    },
    _getDeltaDistance: function() {
        return Utils.getDistance(this.getDeltaX(), this.getDeltaY());
    },

    getTotalX: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.totalX, this._getTotalX, this);
    },
    _getTotalX: function() {
        return this.currentP.x - this.startP.x;
    },

    getTotalY: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.totalY, this._getTotalY, this);
    },
    _getTotalY: function() {
        return this.currentP.y - this.startP.y;
    },

    getDistance: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.totalDistance, this._getDistance, this);
    },
    _getDistance: function() {
        return Utils.getDistance(this.getTotalX(), this.getTotalY());
    },

    /*---- direction ----*/
    getDeltaDirection: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.deltaDirection, this._getDeltaDirection, this);
    },
    _getDeltaDirection: function() {
        return Utils.getDirection(this.getDeltaX(), this.getDeltaY());
    },

    getDirection: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.totalDirection, this._getDirection, this);
    },
    _getDirection: function() {
        return Utils.getDirection(this.getTotalX(), this.getTotalY());
    },

    /*---- velocity ----*/
    getVelocityX: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.velocityX, this._getVelocityX, this);
    },
    _getVelocityX: function() {
        return Utils.getVelocity(this.getDeltaTime(), this.getDeltaX());
    },

    getVelocityY: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.velocityY, this._getVelocityY, this);
    },
    _getVelocityY: function() {
        return Utils.getVelocity(this.getDeltaTime(), this.getDeltaY());
    },

    getVelocity: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.velocity, this._getVelocity, this);
    },
    _getVelocity: function() {
        return Utils.getVelocity(this.getDeltaTime(), this.getDeltaDistance());
    },

    getVelocityAverage: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.velocityAverage, this._getVelocity, this);
    },
    _getVelocityAverage: function() {
        return Utils.getVelocity(this.getTotalTime(), this.getDistance());
    },

    getOrientedVelocityX: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.orientedVelocityX, this._getOrientedVelocityX, this);
    },
    _getOrientedVelocityX: function() {
        return Utils.getOrientedVelocity(this.getDeltaTime(), this.getDeltaX());
    },

    getOrientedVelocityY: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.orientedVelocityY, this._getOrientedVelocityY, this);
    },
    _getOrientedVelocityY: function() {
        return Utils.getOrientedVelocity(this.getDeltaTime(), this.getDeltaY());
    }
};

Fingers.Finger = Finger;



var Position = function(pTimestamp, pX, pY) {
    this.set(pTimestamp, pX, pY);
};

Position.prototype = {
    /**
     * @property timestamp
     * @type {Number}
     */
    timestamp: null,

    /**
     * @property x
     * @type {Number}
     */
    x: null,

    /**
     * @property y
     * @type {Number}
     */
    y: null,

    set: function(pTimestamp, pX, pY) {
        this.timestamp = pTimestamp;
        this.x = pX;
        this.y = pY;
    },

    copy: function(pPosition) {
        this.timestamp = pPosition.timestamp;
        this.x = pPosition.x;
        this.y = pPosition.y;
    }
};

Fingers.Position = Position;


