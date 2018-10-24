function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

const constraints = {
  video: true
};

const video = document.querySelector('#video');

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
	const w = element.offsetWidth;
  const h = element.offsetHeight;
  const cv = document.getElementById("canvas");
  cv.width = w;
  cv.height =h;
}


function doTrack() {
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');

  const colorTracker = new tracking.ColorTracker(['magenta', 'cyan', 'yellow']);

  colorTracker.on('track', function (event) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  
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