/**
 * @module fingers
 *
 * @class CacheArray
 * @constructor
 * @return {CacheArray}
 */

var CacheArray = function() {
    this._cache = [];
};

CacheArray.prototype = {
    _cache: null,

    isCachedValue: function(pIndex) {
        return (this._cache[pIndex] !== undefined);
    },

    getCachedValue: function(pIndex) {
        return this._cache[pIndex];
    },

    setCachedValue: function(pIndex, pValue) {
        this._cache[pIndex] = pValue;
    },

    clearCachedValue: function(pIndex) {
        delete this._cache[pIndex];
    },

    clearCache: function() {
        this._cache.length = 0;
    },

    getCachedValueOrUpdate: function(pIndex, pUpdateF, pUpdateContext) {
        var cacheValue = this.getCachedValue(pIndex);
        if(cacheValue === undefined) {
            cacheValue = pUpdateF.call(pUpdateContext);
            this.setCachedValue(pIndex, cacheValue);
        }
        return cacheValue;
    }
};

Fingers.CacheArray = CacheArray;