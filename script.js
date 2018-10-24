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
const markers = [];

function addMarker(x, y) {
  markers.push({ x: x, y: y });
}

function drawMarkers() {
  markers.forEach(marker => { 
    const color = 'red';
    context.fillStyle = color;
    context.strokeStyle = color;
    context.fillRect(marker.x - MARKER_SIZE / 2, marker.y - MARKER_SIZE / 2, MARKER_SIZE, MARKER_SIZE);
  });
}

const dim = canvas.getBoundingClientRect();
canvas.onclick = function (event) {
  addMarker(event.clientX - dim.left, event.clientY - dim.top);
}


function doTrack() {
  const colorTracker = new tracking.ColorTracker(['magenta', 'cyan', 'yellow']);

  colorTracker.on('track', function (event) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  
    drawMarkers();

    if (event.data.length === 0) {
      // No colorTracker were detected in this frame.
    } else {
      event.data.forEach(function (rect) {
        context.strokeStyle = rect.color;
        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
        console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
      });
    }
  });

  return tracking.track('#video', colorTracker);
}

const tracker = doTrack();