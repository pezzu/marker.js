function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}


const video = document.getElementById('video');
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

document.getElementById('capture-button').onclick = function () {  
  video.play();
  tracker.run();
};

document.getElementById('stop-button').onclick = function () {  
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
options.addBinding('fastThreshold', 40, document.getElementById('threshold'));
options.addBinding('numberOfBindings', 10, document.getElementById('numberOfBindings'));
options.addBoolean('showCorners', true, document.getElementById('showCorners'));



const tagTracker = new TagTracker(options);

tagTracker.on('track', function (event) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  plotFeatures(this.bindings);
  
  event.data.forEach(drawMarker);
});

const tracker = tracking.track('#video', tagTracker);