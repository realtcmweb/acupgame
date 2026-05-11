const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

const octokit = new Octokit({
  auth: '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'
});

async function pushFiles() {
  const owner = 'realtcmweb';
  const repo = 'acupgame';
  const branch = 'main';
  
  const repoPath = '/home/justin/.openclaw/workspace/acupgame_new';
  
  async function getFiles(dir, basePath = '') {
    const files = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next') continue;
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);
        if (entry.isDirectory()) {
          const subFiles = await getFiles(fullPath, relativePath);
          files.push(...subFiles);
        } else {
          const content = fs.readFileSync(fullPath);
          files.push({ path: relativePath, content: content.toString('base64') });
        }
      }
    } catch (e) {}
    return files;
  }
  
  const files = await getFiles(repoPath);
  console.log(`Found ${files.length} files`);
  
  // Create blobs
  const blobs = await Promise.all(files.map(f => 
    octokit.git.createBlob({
      owner, repo,
      content: f.content,
      encoding: 'base64'
    }).then(r => ({ path: f.path, sha: r.data.sha }))
  ));
  
  // Create tree
  const { data: newTree } = await octokit.git.createTree({
    owner, repo,
    tree: blobs.map(b => ({ path: b.path, mode: '100644', type: 'blob', sha: b.sha }))
  });
  
  // Create initial commit (no parents for empty repo)
  const { data: newCommit } = await octokit.git.createCommit({
    owner, repo,
    message: 'feat: initial acupgame - Duolingo-style TCM learning app',
    tree: newTree.sha
  });
  
  // Create branch
  await octokit.git.createRef({
    owner, repo,
    ref: `refs/heads/${branch}`,
    sha: newCommit.sha
  });
  
  console.log('Pushed successfully!');
}

pushFiles().catch(e => console.error(e.message));
