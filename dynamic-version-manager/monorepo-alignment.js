const semver = require('semver');
const fs = require('fs').promises;
const path = require('path');

async function getPackages(monorepoRoot) {
  const packages = [];
  const contents = await fs.readdir(monorepoRoot, { withFileTypes: true });
  
  for (const item of contents) {
    if (item.isDirectory()) {
      const packageJsonPath = path.join(monorepoRoot, item.name, 'package.json');
      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        packages.push({ name: packageJson.name, dependencies: packageJson.dependencies });
      } catch (error) {
        // Ignore directories without package.json
      }
    }
  }
  
  return packages;
}

function getHighestCompatible(version1, version2) {
  if (!version1) return version2;
  if (!version2) return version1;
  return semver.gt(version1, version2) ? version1 : version2;
}

function alignMonorepoVersions(packages, sharedDeps) {
  const versionMap = new Map();
  
  // Find the highest compatible version used anywhere
  for (const pkg of packages) {
    for (const [dep, version] of Object.entries(pkg.dependencies || {})) {
      if (sharedDeps.includes(dep)) {
        versionMap.set(dep, getHighestCompatible(versionMap.get(dep), version));
      }
    }
  }
  
  return Object.fromEntries(versionMap);
}

async function updatePackageJsons(monorepoRoot, alignedVersions) {
  const packages = await getPackages(monorepoRoot);
  
  for (const pkg of packages) {
    const packageJsonPath = path.join(monorepoRoot, pkg.name, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    let updated = false;
    for (const [dep, version] of Object.entries(alignedVersions)) {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        packageJson.dependencies[dep] = version;
        updated = true;
      }
    }
    
    if (updated) {
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`Updated ${pkg.name} package.json`);
    }
  }
}

module.exports = {
  getPackages,
  alignMonorepoVersions,
  updatePackageJsons
};