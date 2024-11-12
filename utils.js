const fs = require('fs');
const path = require('path')

function isGitRepository(dir) {
  let currentDir = dir;
  while (currentDir !== path.parse(currentDir).root) {
    if (fs.existsSync(path.join(currentDir, '.git'))) {
      return true;
    }
    currentDir = path.dirname(currentDir);
  }
  return false;
}

function getGitRootDir(dir) {
  let currentDir = dir;
  while (currentDir !== path.parse(currentDir).root) {
    if (fs.existsSync(path.join(currentDir, '.git'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  throw new Error('Root not found.');
}

function getGitRemoteUrl(dir) {
  const rootDir = getGitRootDir(dir);

  const configPath = path.join(rootDir, '.git', 'config');
  if (!fs.existsSync(configPath)) {
    throw new Error('.git/config not found');
  }

  const configContent = fs.readFileSync(configPath, 'utf8');
  const remoteUrlMatch = configContent.match(/\[remote "origin"\][\s\S]*?url = (.+)/);
  if (!remoteUrlMatch) {
    throw new Error('remote "origin" URL not found');
  }

  return remoteUrlMatch[1].trim();
}

module.exports = {
  isGitRepository,
  getGitRemoteUrl
}
