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
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  tagTracker.addTag(event.clientX - dim.left, event.clientY - dim.top, imageData.data, canvas.width, canvas.height);
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

TagTracker.prototype.blur = 3;
TagTracker.prototype.fastThreshold = 60;
TagTracker.prototype.numberOfBindings = 4;

TagTracker.prototype.track = function(pixels, width, height) {  
  const blur = tracking.Image.blur(pixels, width, height, this.blur);
  const grayscale = tracking.Image.grayscale(blur, width, height);
  const keypoints = tracking.Fast.findCorners(grayscale, width, height, this.fastThreshold);
  const descriptors = tracking.Brief.getDescriptors(grayscale, width, keypoints);

  const results = [];
  this.tags.forEach(tag => {
    const matches = tracking.Brief.reciprocalMatch(keypoints, descriptors, tag.keypoints, tag.descriptors);
    matches.sort((a, b) => b.confidence - a.confidence);
    
    //ToDo: use smart algorithm to bind, not just avarage
    let dx = 0;
    let dy = 0;
    for (i = 0; i < this.numberOfBindings; i++) {
      dx += matches[i].keypoint2[0] - matches[i].keypoint1[0];
      dy += matches[i].keypoint2[1] - matches[i].keypoint1[1];
    }
    dx = dx / this.numberOfBindings;
    dy = dy / this.numberOfBindings;

    results.push({ x: tag.x + dx, y: tag.y + dy });
  });

  this.emit('track', {
    data: results
  });
}

TagTracker.prototype.addTag = function (x, y, pixels, width, height) {
  const blur = tracking.Image.blur(pixels, width, height, this.blur);
  const grayscale = tracking.Image.grayscale(blur, width, height);
  const keypoints = tracking.Fast.findCorners(grayscale, width, height, this.fastThreshold);
  const descriptors = tracking.Brief.getDescriptors(grayscale, width, keypoints);
  
  this.tags.push({ x: x, y: y, keypoints: keypoints, descriptors: descriptors });
}

const tagTracker = new TagTracker();

tagTracker.on('track', function (event) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  event.data.forEach(drawMarker);
});

const tracker = tracking.track('#video', tagTracker);