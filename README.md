# Marker.js

An attempt to implement object marking and marks tracking on the moving picture purely in the browser

### Motivation
This can be used during manual cell counting process in order to mark already counted cells. Microscope needs to be connected as camera device in this case

### Implementation details
Implementation mainly relies on [tracking.js](https://trackingjs.com/) library to parse data from camera and find image corners and then uses [Rubber Sheeting](https://en.wikipedia.org/wiki/Rubbersheeting) algorythm to calculate new position of the marker(s).
Also wonderfull [MathJS](http://mathjs.org/) library is used for matrix operations. 
