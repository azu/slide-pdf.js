/**
 * @module fingers
 */

// AMD export
if(typeof define == 'function' && define.amd) {
    define(function() {
        return Fingers;
    });
// commonjs export
} else if(typeof module !== 'undefined' && module.exports) {
    module.exports = Fingers;
// browser export
} else {
    window.Fingers = Fingers;
}