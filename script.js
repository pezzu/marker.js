function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

const constraints = {
  video: true
};

const video = document.querySelector('#video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

function initVideo() {
  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    video.srcObject = stream;
  });
}

initVideo();

document.querySelector('#capture-button').onclick = function () {  
  video.play();
  tracker.run();
};

document.querySelector('#stop-button').onclick = function () {  
  tracker.stop();
  video.pause();
};

video.onplay = function () {
  resizeCanvasTo(this);
};

function resizeCanvasTo(element) {
  canvas.width = element.offsetWidth;
  canvas.height = element.offsetHeight;
}


const MARKER_SIZE = 6;

const dim = canvas.getBoundingClientRect();
canvas.onclick = function (event) {
  tagTracker.addMarker(event.clientX - dim.left, event.clientY - dim.top);
}


const TagTracker = function() {
  TagTracker.base(this, 'constructor');
  this.tags = [];
}

tracking.inherits(TagTracker, tracking.Tracker);

TagTracker.prototype.track = function(pixels, width, height) {
  const results = [];

  this.emit('track', {
    data: results
  });
}

TagTracker.prototype.addMarker = function (x, y) {
  this.tags.push({ x: x, y: y });
}

TagTracker.prototype.drawMarkers = function () {
  this.tags.forEach(marker => { 
    const color = 'red';
    context.fillStyle = color;
    context.strokeStyle = color;
    context.fillRect(marker.x - MARKER_SIZE / 2, marker.y - MARKER_SIZE / 2, MARKER_SIZE, MARKER_SIZE);
  });
}


const tagTracker = new TagTracker();

tagTracker.on('track', function (event) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  tagTracker.drawMarkers();
  event.data.forEach(rect => {
  
  });
});

const tracker = tracking.track('#video', tagTracker);