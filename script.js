function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

const constraints = {
  video: true
};

const video = document.querySelector('#videostream');
let mediaStream;

document.querySelector('#capture-button').onclick = function () {
  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    mediaStream = stream;
    video.srcObject = stream;
  });
};

document.querySelector('#stop-button').onclick = function () {
  video.pause();
  mediaStream.stop();
};