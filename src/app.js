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

function plotMarkers(markers, color, size) {
  context.fillStyle = color;
  markers.forEach(marker => {
    context.fillRect(marker.x - Math.floor(size / 2), marker.y - Math.floor(size / 2), size, size);
  });
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

  if (options.showCorners) {
    const markers = [];
    for (let i = 0; i < this.bindings.length - 1; i+=2) {
      markers.push({ x: this.bindings[i], y: this.bindings[i + 1] });
    }
    plotMarkers(markers, 'red', 3);
  }

  plotMarkers(event.tags, 'yellow', 8);
});

const tracker = tracking.track('#video', tagTracker);