const dotenv = require('dotenv').config();
const jwt = require('jwt-simple');
const NodeCache = require('node-cache');
const cache = new NodeCache();

let JWT_SECRET = undefined;
let NODE_CACHE_TTL = 0;

class NodeJWTReplayGuard {
  constructor() {}

  setJWTSecret(secret) {
    JWT_SECRET = secret;
  }
  setNodeCacheTTL(ttl) {
    NODE_CACHE_TTL = ttl;
  }
  storeToken(token, req) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    cache.set(ip, token, NODE_CACHE_TTL);
  }
  replayGuard(req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const token = req.headers['authorization'] ? req.headers['authorization'].replace(/Bearer /g, '') : undefined;
    if (!JWT_SECRET && process.env.JWT_SECRET) {
      this.setJWTSecret(process.env.JWT_SECRET);
    } else if (!JWT_SECRET && !process.env.JWT_SECRET) {
      throw new Error('JWT Secret not defined in node-replay-guard');
    }
    const decoded = jwt.decode(token, JWT_SECRET);
    if (decoded) {
      const tokenStore = cache.get(ip);
      if (tokenStore === token) {
        next();
      } else {
        throw new Error('Unauthorized');
      }
    }
  }
}

module.exports = new NodeJWTReplayGuard();