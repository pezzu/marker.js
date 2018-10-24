function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

const constraints = {
  video: true
};

const video = document.querySelector('#videostream');

document.querySelector('#capture-button').onclick = function () {
  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    video.srcObject = stream;
  });
};

document.querySelector('#stop-button').onclick = function () {
  video.pause();
};