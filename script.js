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

video.onresize = function () {
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
  const MARKER_SIZE = 8;
  const color = 'yellow';

  context.fillStyle = color;
  context.strokeStyle = color;
  context.fillRect(marker.x - MARKER_SIZE / 2, marker.y - MARKER_SIZE / 2, MARKER_SIZE, MARKER_SIZE);
}

function plotFeatures(keypoints) {
  if (options.showCorners) {
    for (let i = 0; i < keypoints.length; i += 2) {
      context.fillStyle = 'red';
      context.fillRect(keypoints[i], keypoints[i + 1], 3, 3);
    }
  }
}

const options = new function () {
  this.addBinding = (name, value, element) => {
    Object.defineProperty(this, name, {
      enumerable: true,
      get: () => element.value,
      set: (value) => element.value = value
    });
    this[name] = value;
  };

  this.addBoolean = (name, value, element) => {
    Object.defineProperty(this, name, {
      enumerable: true,
      get: () => element.checked,
      set: (value) => element.checked = value
    });
    this[name] = value;
  };
};

options.addBinding('blur', 3, document.getElementById('blur'));
options.addBinding('fastThreshold', 10, document.getElementById('threshold'));
options.addBinding('numberOfBindings', 4, document.getElementById('numberOfBindings'));
options.addBoolean('showCorners', true, document.getElementById('showCorners'));

const TagTracker = function() {
  TagTracker.base(this, 'constructor');
  this.tags = [];
  this.bindings = [];
}
tracking.inherits(TagTracker, tracking.Tracker);

TagTracker.prototype.track = function(pixels, width, height) {  
  const blur = tracking.Image.blur(pixels, width, height, options.blur);
  const grayscale = tracking.Image.grayscale(blur, width, height);
  const keypoints = tracking.Fast.findCorners(grayscale, width, height, options.fastThreshold);
  const descriptors = tracking.Brief.getDescriptors(grayscale, width, keypoints);

  this.bindings = keypoints;

  const results = [];
  this.tags.forEach(tag => {
    if (tag.keypoints) {
      const matches = tracking.Brief.reciprocalMatch(keypoints, descriptors, tag.keypoints, tag.descriptors);
      matches.sort((a, b) => b.confidence - a.confidence);
    
      //ToDo: use smart algorithm to bind, not just avarage
      let dx = 0;
      let dy = 0;
      for (i = 0; i < options.numberOfBindings; i++) {
        dx += matches[i].keypoint2[0] - matches[i].keypoint1[0];
        dy += matches[i].keypoint2[1] - matches[i].keypoint1[1];
      }
      tag.x -= dx / options.numberOfBindings;
      tag.y -= dy / options.numberOfBindings;
    }

    tag.keypoints = keypoints;
    tag.descriptors = descriptors;
    results.push({x: tag.x, y: tag.y});
  });

  this.emit('track', {
    data: results
  });
}

TagTracker.prototype.addTag = function (x, y) {
  this.tags.push({ x: x, y: y});
}

const tagTracker = new TagTracker();

tagTracker.on('track', function (event) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  plotFeatures(this.bindings);
  
  event.data.forEach(drawMarker);
});

const tracker = tracking.track('#video', tagTracker);