
var Fingers = function Fingers(pElement) {
    return new Fingers.Instance(pElement);
};

Fingers.__extend = function(obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
        if (source) {
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
};