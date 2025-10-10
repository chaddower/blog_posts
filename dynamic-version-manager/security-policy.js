const axios = require('axios');
const semver = require('semver');

async function runSecurityAudit(dependencies) {
  // This is a simplified example. In a real-world scenario, you'd use npm audit or a third-party security service.
  const audit = { vulnerabilities: [] };

  for (const [pkg, version] of Object.entries(dependencies)) {
    try {
      const response = await axios.get(`https://example.com/security-api/${pkg}/${version}`);
      const vulnerabilities = response.data.vulnerabilities || [];
      audit.vulnerabilities.push(...vulnerabilities.map(v => ({ ...v, package: pkg })));
    } catch (error) {
      console.error(`Error checking security for ${pkg}@${version}:`, error.message);
    }
  }

  return audit;
}

async function applySecurityPolicy(dependencies) {
  const audit = await runSecurityAudit(dependencies);
  const updates = {};
  
  for (const vuln of audit.vulnerabilities) {
    if (vuln.severity === 'critical' || vuln.severity === 'high') {
      const patchedVersions = vuln.patched_versions.split('||').map(v => v.trim());
      const latestPatch = patchedVersions
        .filter(v => semver.valid(v))
        .sort(semver.rcompare)[0];
      
      if (latestPatch) {
        updates[vuln.package] = latestPatch;
      }
    }
  }
  
  return updates;
}

function isSecurityUpdate(currentVersion, newVersion, vulnerabilities) {
  return vulnerabilities.some(vuln => 
    semver.satisfies(currentVersion, vuln.vulnerable_versions) &&
    !semver.satisfies(newVersion, vuln.vulnerable_versions)
  );
}

module.exports = {
  runSecurityAudit,
  applySecurityPolicy,
  isSecurityUpdate
};