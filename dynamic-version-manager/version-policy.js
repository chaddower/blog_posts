const policies = {
  production: {
    allowMajor: false,
    allowMinor: true,
    allowPatch: true,
    securityUpdates: 'always',
    updateFrequency: 'weekly'
  },
  development: {
    allowMajor: true,
    allowMinor: true,
    allowPatch: true,
    securityUpdates: 'immediate',
    updateFrequency: 'daily'
  },
  staging: {
    allowMajor: false,
    allowMinor: true,
    allowPatch: true,
    securityUpdates: 'always',
    updateFrequency: 'biweekly'
  }
};

const categories = {
  critical: ['express', 'fastify', 'koa'],
  security: ['helmet', 'cors', 'bcrypt'],
  utility: ['lodash', 'moment', 'axios'],
  development: ['eslint', 'jest', 'webpack']
};

const categoryPolicies = {
  critical: {
    ...policies.production,
    allowMinor: false
  },
  security: {
    ...policies.production,
    securityUpdates: 'immediate'
  },
  utility: policies.production,
  development: policies.development,
  default: policies.production
};

function getCategoryPolicy(packageName) {
  for (const [category, packages] of Object.entries(categories)) {
    if (packages.includes(packageName)) {
      return categoryPolicies[category];
    }
  }
  return categoryPolicies.default;
}

function getEnvironmentPolicy(environment) {
  return policies[environment] || policies.production;
}

module.exports = {
  policies,
  categories,
  categoryPolicies,
  getCategoryPolicy,
  getEnvironmentPolicy
};