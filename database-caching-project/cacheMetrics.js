class CacheMetrics {
  constructor() {
    this.hits = 0;
    this.misses = 0;
    this.errors = 0;
    this.latencies = [];
  }
  
  recordHit(latencyMs) {
    this.hits++;
    this.latencies.push(latencyMs);
  }
  
  recordMiss() {
    this.misses++;
  }
  
  recordError() {
    this.errors++;
  }
  
  getHitRatio() {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }
  
  getP95Latency() {
    const sorted = this.latencies.sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index] || 0;
  }
  
  getAverageLatency() {
    if (this.latencies.length === 0) return 0;
    const sum = this.latencies.reduce((a, b) => a + b, 0);
    return sum / this.latencies.length;
  }
  
  getErrorRate() {
    const total = this.hits + this.misses + this.errors;
    return total > 0 ? this.errors / total : 0;
  }
  
  resetMetrics() {
    this.hits = 0;
    this.misses = 0;
    this.errors = 0;
    this.latencies = [];
  }
  
  getMetricsSummary() {
    return {
      hitRatio: this.getHitRatio(),
      p95Latency: this.getP95Latency(),
      averageLatency: this.getAverageLatency(),
      errorRate: this.getErrorRate(),
      totalRequests: this.hits + this.misses + this.errors
    };
  }
}

module.exports = CacheMetrics;