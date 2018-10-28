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
        const matches = tracking.Brief.reciprocalMatch(keypoints, descriptors, tag.keypoints, tag.descriptors);
        matches.sort((a, b) => b.confidence - a.confidence);
      
        //ToDo: use smart algorithm to bind, not just avarage
        let dx = 0;
        let dy = 0;
        for (i = 0; i < this.options.numberOfBindings; i++) {
          dx += matches[i].keypoint2[0] - matches[i].keypoint1[0];
          dy += matches[i].keypoint2[1] - matches[i].keypoint1[1];
        }
        tag.x -= dx / this.options.numberOfBindings;
        tag.y -= dy / this.options.numberOfBindings;
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