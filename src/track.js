const TagTracker = function(options) {
  TagTracker.base(this, 'constructor');
  this.tags = [];
  this.bindings = [];
  this.options = options;
}
tracking.inherits(TagTracker, tracking.Tracker);
  
TagTracker.prototype.track = function(pixels, width, height) {  
  const blur = tracking.Image.blur(pixels, width, height, this.options.blur);
  const grayscale = tracking.Image.grayscale(blur, width, height);
  const keypoints = tracking.Fast.findCorners(grayscale, width, height, this.options.fastThreshold);
  const descriptors = tracking.Brief.getDescriptors(grayscale, width, keypoints);

  this.bindings = keypoints;

  const results = [];
  this.tags.forEach(tag => {
    if (tag.keypoints) {
      const matches = tracking.Brief.reciprocalMatch(tag.keypoints, tag.descriptors, keypoints, descriptors);
      matches.sort((a, b) => b.confidence - a.confidence);
    
      const numberOfBindings = Math.min(this.options.numberOfBindings, matches.length);

      // x' = a0 + a1x + a2y
      // y' = b0 + b2x + b2y

      // |a0|   | 1 x1 y1 |-1   |x'1|
      // |a1| = | 1 x2 y2 |   * |x'2|
      // |a2|   | 1 x3 y3 |     |x'3|

      // |b0|   | 1 x1 y1 |-1   |y'1|
      // |b1| = | 1 x2 y2 |   * |y'2|
      // |b2|   | 1 x3 y3 |     |y'3|

      const x = [];
      const y = [];
      for (i = 0; i < numberOfBindings - 2; i++) {
        const M = [
          [1, matches[i + 0].keypoint1[0], matches[i + 0].keypoint1[1]],
          [1, matches[i + 1].keypoint1[0], matches[i + 1].keypoint1[1]],
          [1, matches[i + 2].keypoint1[0], matches[i + 2].keypoint1[1]]
        ];

        if (math.det(M) != 0) {  
          const Mi = math.inv(M);

          const a = math.multiply(Mi, [matches[i + 0].keypoint2[0], matches[i + 1].keypoint2[0], matches[i + 2].keypoint2[0]]);
          const b = math.multiply(Mi, [matches[i + 0].keypoint2[1], matches[i + 1].keypoint2[1], matches[i + 2].keypoint2[1]]);

          x.push(a[0] + a[1] * tag.x + a[2] * tag.y);
          y.push(b[0] + b[1] * tag.x + b[2] * tag.y);
        }
      }

      tag.x = Math.round(avt(x));
      tag.y = Math.round(avt(y));
    }

    tag.keypoints = keypoints;
    tag.descriptors = descriptors;
    results.push({x: tag.x, y: tag.y});
  });

  this.emit('track', {
    tags: results
  });
}
  
TagTracker.prototype.addTag = function (x, y) {
  this.tags.push({ x: x, y: y});
}

// AVT filtering
function avt(rawData) {
  const std = math.std(rawData, 'uncorrected');
  const avg = rawData.reduce((a, v) => a + v) / rawData.length;
  const filtered = rawData.filter(v => v > (avg - std) && v < (avg + std)); 

  return filtered.reduce((a, v) => a + v) / filtered.length;
}
