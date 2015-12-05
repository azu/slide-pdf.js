# Fingers.js

#### A javascript library for simultaneous touch gestures
Fingers.js is a small javascript library that detects and fire gesture events on DOM objects.<br/>
This library detects __classical gestures__: Tap, Hold, Swipe, Pinch, Drag, Rotate, Scale.<br/>
It also detects __multiple gestures on different objects in the same time__.


## Features
- Light library (less than 4kb minified and gzipped)
- Work with mouse devices (1 finger) and touch devices (multiple fingers)
- Detect action gestures (Tap, MultipleTap, Hold, Swipe, Pinch) with as many number as you want
- Detect movement gestures (Drag, Rotate, Scale)
- Detect raw gestures (Fingers object managed)
- __Multiple gestures in same time__ (You can drag 2 different objects, rotate a third and swipe a fourth in same time)
- Easy to add your [custom gestures](/src/gestures/README.md).
- AMD/CommonJS support


## Usage
Fingers.js is simple to use. Just create an instance of Fingers on the wanted DOM object, then register the gestures you want.<br/>

    var element = document.getElementById('el_id');
    var fingers = new Fingers(element);
    var gesture1 = fingers.addGesture(Fingers.gesture.Tap);
    var gesture2 = fingers.addGesture(Fingers.gesture.Hold);

Gestures can have many handlers

    var element = document.getElementById('el_id');
    var fingers = new Fingers(element);
    var gesture1 = fingers.addGesture(Fingers.gesture.Tap);
    gesture1.addHandler(function(eventType, data, fingerList) {
        alert('Tap 1');
    });
    gesture1.addHandler(function(eventType, data, fingerList) {
        alert('Tap 2');
    });

Gestures handling mathods are chainable

    var element = document.getElementById('el_id');
    new Fingers(element)
        .addGesture(Fingers.gesture.Tap)
        .addHandler(function(eventType, data, fingerList) {alert('Tap 1');})
        .addHandler(function(eventType, data, fingerList) {alert('Tap 2');})
        .addHandler(function(eventType, data, fingerList) {alert('Tap 3');});

## Gesture
The following gestures are detected;

- hold (1 .. N fingers)
- tap (1 .. N fingers) and multiple taps (1 .. N successive taps)
- swipe (1 .. N fingers)
- Pinch (1 .. N fingers)
- drag (1 finger)
- rotate (2 fingers)
- scale (2 fingers)
- transform (rotate and scale) (2 fingers)
- raw (each finger is seen independently)

See [custom gestures](/src/gestures/README.md) for gesture details.

## Finger
Finger object is accessible from Gesture events<br/>
It contains all the informations about the finger from its beginning until its end.
It provides informations about:
- it time
- its position
- its moving direction
- its moving velocity

Informations are always available from Finger start or from Finger last move (ex: current velocity and average velocity)

## Examples
Examples are available in [/tests/manual folder](/tests/manual).
Try if on PC (but only with on finger) or on a Smartphone / Tablet with all your fingers, then enjoy it.