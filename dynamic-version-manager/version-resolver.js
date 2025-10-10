const axios = require('axios');
const semver = require('semver');

async function fetchAvailableVersions(packageName) {
  try {
    const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
    return Object.keys(response.data.versions);
  } catch (error) {
    console.error(`Error fetching versions for ${packageName}:`, error.message);
    return [];
  }
}

async function checkSecurity(packageName, version) {
  // This is a simplified example. In a real-world scenario, you'd integrate with a security advisory database.
  try {
    const response = await axios.get(`https://example.com/security-api/${packageName}/${version}`);
    return response.data.vulnerabilities || [];
  } catch (error) {
    console.error(`Error checking security for ${packageName}@${version}:`, error.message);
    return [];
  }
}

function findSecureVersion(availableVersions, securityIssues) {
  return availableVersions.find(version => 
    !securityIssues.some(issue => semver.satisfies(version, `>${issue.affectedVersions}`))
  );
}

function findBestVersion(availableVersions, currentVersion, policy) {
  const validVersions = availableVersions.filter(version => {
    const diff = semver.diff(currentVersion, version);
    if (diff === 'major' && !policy.allowMajor) return false;
    if (diff === 'minor' && !policy.allowMinor) return false;
    if (diff === 'patch' && !policy.allowPatch) return false;
    return semver.gt(version, currentVersion);
  });

  return validVersions.sort(semver.rcompare)[0] || currentVersion;
}

async function resolveVersion(packageName, currentVersion, policy) {
  const availableVersions = await fetchAvailableVersions(packageName);
  const securityIssues = await checkSecurity(packageName, currentVersion);
  
  if (securityIssues.length > 0 && policy.securityUpdates === 'always') {
    const secureVersion = findSecureVersion(availableVersions, securityIssues);
    if (secureVersion) return secureVersion;
  }
  
  return findBestVersion(availableVersions, currentVersion, policy);
}

module.exports = {
  resolveVersion,
  fetchAvailableVersions,
  checkSecurity,
  findSecureVersion,
  findBestVersion
};