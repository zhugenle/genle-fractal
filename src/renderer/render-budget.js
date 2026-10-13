'use strict';

// Prefer a cheaper shader tier before reducing raster density. Never blur the image.
class FractalRenderBudget {
  constructor(gl) {
    this.gl = gl;
    this.timer = gl?.getExtension('EXT_disjoint_timer_query') || null;
    this.maxDimension = gl ? Math.min(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE), gl.getParameter(gl.MAX_TEXTURE_SIZE)) : 4096;
    this.factor = 1;
    this.ceiling = 1;
    this.floor = 1.25;
    this.configuredQuality = null;
    this.shaderQuality = 3;
    this.lastQualityAdjustment = 0;
    this.area = 0;
    this.cost = 0;
    this.gpuMs = 0;
    this.samples = 0;
    this.lastAdjustment = 0;
    this.pending = [];
    this.activeQuery = null;
    this.queryFrame = 0;
  }

  dimensions(width, height, nativeFactor, dynamic, selectedQuality=3) {
    width = Math.max(1, width); height = Math.max(1, height);
    const hardwareLimit = Math.min(this.maxDimension / width, this.maxDimension / height);
    nativeFactor = Math.min(nativeFactor, hardwareLimit);
    const area = width * height;
    const ceiling = Math.min(nativeFactor, Math.sqrt(2000000 / area));
    const qualityChanged=this.configuredQuality!==selectedQuality;
    if(qualityChanged){
      this.configuredQuality=selectedQuality;this.shaderQuality=selectedQuality;
      this.factor=ceiling;this.resetSamples();this.lastQualityAdjustment=0;
    }
    if (!qualityChanged && this.area && Math.abs(area / this.area - 1) > .15) {
      this.factor *= Math.sqrt(this.area / area);
      this.resetSamples();
    }
    this.area = area;
    this.ceiling = ceiling;
    this.floor = Math.min(1.25, ceiling);
    this.factor = Math.max(this.floor, Math.min(this.factor, ceiling));
    const factor = dynamic ? this.factor : nativeFactor;
    return {
      width: Math.max(1, Math.round(width * factor)),
      height: Math.max(1, Math.round(height * factor)),
      detailHeight: Math.max(1, Math.round(height * nativeFactor)),
      mappingHeight: Math.max(1, Math.round(height * nativeFactor)),
      shaderQuality: dynamic ? this.shaderQuality : selectedQuality,
      factor, nativeFactor
    };
  }

  resetSamples() { this.cost = 0; this.samples = 0; }

  observe(ms, now) {
    if (!Number.isFinite(ms) || ms <= 0) return;
    this.cost = this.samples ? this.cost * .75 + ms * .25 : ms;
    this.samples++;
    if (this.samples < 3 || now - this.lastAdjustment < 900) return;
    // Reducing secondary-ray/shadow work keeps pixel density and surface normals sharp.
    const minimumQuality=Math.min(1,this.configuredQuality??3);
    if(this.cost>34&&this.shaderQuality>minimumQuality){
      this.shaderQuality--;this.lastQualityAdjustment=now;this.lastAdjustment=now;this.resetSamples();return;
    }
    if(this.cost<14&&this.factor>=this.ceiling-.015&&this.shaderQuality<this.configuredQuality&&now-this.lastQualityAdjustment>=4000){
      this.shaderQuality++;this.lastQualityAdjustment=now;this.lastAdjustment=now;this.resetSamples();return;
    }
    let next = this.factor;
    // Fast reductions, slow recovery, and a quiet middle band avoid pumping.
    if (this.cost > 34) next *= Math.max(.7, Math.sqrt(27 / this.cost) * .95);
    else if (this.cost < 22) next += .06;
    next = Math.max(this.floor, Math.min(next, this.ceiling));
    this.lastAdjustment = now;
    if (Math.abs(next - this.factor) >= .015) {
      this.factor = Math.max(this.floor, Math.min(this.ceiling, Math.round(next * 100) / 100));
      this.resetSamples();
    }
  }

  begin(factor, adaptive, shaderQuality=this.shaderQuality) {
    if (!this.timer || this.pending.length >= 4 || (++this.queryFrame % 3)) return;
    const query = this.timer.createQueryEXT();
    this.activeQuery = { query, factor, adaptive, shaderQuality };
    this.timer.beginQueryEXT(this.timer.TIME_ELAPSED_EXT, query);
  }

  end() {
    if (!this.activeQuery) return;
    this.timer.endQueryEXT(this.timer.TIME_ELAPSED_EXT);
    this.pending.push(this.activeQuery);
    this.activeQuery = null;
  }

  poll(now, adaptive) {
    if (!this.timer || !this.pending.length) return;
    if (this.gl.getParameter(this.timer.GPU_DISJOINT_EXT)) {
      for (const item of this.pending) this.timer.deleteQueryEXT(item.query);
      this.pending.length = 0;
      this.gpuMs = 0;
      this.resetSamples();
      return;
    }
    while (this.pending.length) {
      const item = this.pending[0];
      if (!this.timer.getQueryObjectEXT(item.query, this.timer.QUERY_RESULT_AVAILABLE_EXT)) break;
      this.pending.shift();
      const ms = this.timer.getQueryObjectEXT(item.query, this.timer.QUERY_RESULT_EXT) / 1000000;
      this.timer.deleteQueryEXT(item.query);
      this.gpuMs = ms;
      if (adaptive && item.adaptive && item.shaderQuality===this.shaderQuality && Math.abs(item.factor - this.factor) < .015) this.observe(ms, now);
    }
  }

  dispose() {
    if (this.timer) for (const item of this.pending) this.timer.deleteQueryEXT(item.query);
    this.pending.length = 0;
  }
}
