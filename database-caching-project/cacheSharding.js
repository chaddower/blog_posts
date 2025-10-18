const crypto = require('crypto');

class ShardedCache {
  constructor(redisNodes) {
    this.nodes = redisNodes;
    this.ring = this.buildHashRing();
  }
  
  buildHashRing() {
    const ring = [];
    for (const [i, node] of this.nodes.entries()) {
      // Create virtual nodes for better distribution
      for (let vnode = 0; vnode < 160; vnode++) {
        const hash = this.hashFunction(`${i}:${vnode}`);
        ring.push([hash, node]);
      }
    }
    return ring.sort((a, b) => a[0] - b[0]);
  }
  
  hashKey(key) {
    return this.hashFunction(key);
  }
  
  hashFunction(key) {
    return crypto.createHash('md5').update(key).digest('hex');
  }
  
  getNodeForKey(key) {
    const hash = this.hashKey(key);
    // Find the first node with hash >= key hash
    for (const [nodeHash, node] of this.ring) {
      if (nodeHash >= hash) return node;
    }
    return this.ring[0][1]; // Wrap around
  }
  
  async get(key) {
    const node = this.getNodeForKey(key);
    return node.get(key);
  }
  
  async set(key, value, ttl) {
    const node = this.getNodeForKey(key);
    return node.setex(key, ttl, value);
  }
  
  async del(key) {
    const node = this.getNodeForKey(key);
    return node.del(key);
  }
  
  async mget(keys) {
    const nodeMap = new Map();
    for (const key of keys) {
      const node = this.getNodeForKey(key);
      if (!nodeMap.has(node)) {
        nodeMap.set(node, []);
      }
      nodeMap.get(node).push(key);
    }
    
    const promises = [];
    for (const [node, nodeKeys] of nodeMap.entries()) {
      promises.push(node.mget(nodeKeys));
    }
    
    const results = await Promise.all(promises);
    return results.flat();
  }
  
  async mset(keyValuePairs) {
    const nodeMap = new Map();
    for (const [key, value] of Object.entries(keyValuePairs)) {
      const node = this.getNodeForKey(key);
      if (!nodeMap.has(node)) {
        nodeMap.set(node, {});
      }
      nodeMap.get(node)[key] = value;
    }
    
    const promises = [];
    for (const [node, nodePairs] of nodeMap.entries()) {
      promises.push(node.mset(nodePairs));
    }
    
    return Promise.all(promises);
  }
}

module.exports = ShardedCache;