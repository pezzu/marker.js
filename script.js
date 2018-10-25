function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}


const video = document.querySelector('#video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

function initVideo() {
  const constraints = {
    video: true
  };

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

canvas.onclick = function (event) {
  const dim = canvas.getBoundingClientRect();
  tagTracker.addTag(event.clientX - dim.left, event.clientY - dim.top);
}

function drawMarker(marker) {
  const MARKER_SIZE = 6;
  const color = 'red';

  context.fillStyle = color;
  context.strokeStyle = color;
  context.fillRect(marker.x - MARKER_SIZE / 2, marker.y - MARKER_SIZE / 2, MARKER_SIZE, MARKER_SIZE);
}


const TagTracker = function() {
  TagTracker.base(this, 'constructor');
  this.tags = [];
}

tracking.inherits(TagTracker, tracking.Tracker);

TagTracker.prototype.track = function(pixels, width, height) {
  const results = this.tags;

  this.emit('track', {
    data: results
  });
}

TagTracker.prototype.addTag = function (x, y) {
  this.tags.push({ x: x, y: y });
}

const tagTracker = new TagTracker();

tagTracker.on('track', function (event) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  event.data.forEach(drawMarker);
});

const tracker = tracking.track('#video', tagTracker);