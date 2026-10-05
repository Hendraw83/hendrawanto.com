import {pathToFileURL} from 'node:url';

export const counter = 'hendrawanto.com/visits-20261005';
export const dataPath = 'data/visit-count.json';
export const dataBranch = 'visit-count-data';

export function parseTotal(response, status) {
  if (status === 404) return 0;
  if (status !== 200 || !response || !Number.isSafeInteger(response.total) || response.total < 0) {
    throw new Error('The counter returned an invalid total; the saved count was preserved.');
  }
  return response.total;
}

async function main() {
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (repository !== 'Hendraw83/hendrawanto.com' || !token) throw new Error('Expected repository and workflow token are required.');
  const base = 'https://api.github.com/repos/' + repository;
  const headers = {Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'};
  const request = (url, options = {}) => fetch(url, {...options, signal: AbortSignal.timeout(20000)});
  const source = await request('https://hits.sh/api/urns/' + counter);
  const total = parseTotal(source.status === 200 ? await source.json() : null, source.status);
  const current = await request(base + '/contents/' + dataPath + '?ref=' + dataBranch, {headers});
  if (!current.ok) throw new Error('Cannot read the data branch; no branch or count was overwritten.');
  const file = await current.json();
  const previous = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
  if (previous.counter !== counter || !Number.isSafeInteger(previous.total) || total < previous.total) {
    throw new Error('The counter decreased or changed source; the saved count was preserved.');
  }
  const snapshot = {
    counter, total, startedAt: '2026-10-05', updatedAt: new Date().toISOString(),
    metric: 'consented visits; 30-minute browser inactivity window',
    updatedBy: 'GitHub Actions / visit-count-cache',
    runUrl: process.env.GITHUB_RUN_ID ? 'https://github.com/' + repository + '/actions/runs/' + process.env.GITHUB_RUN_ID : null
  };
  const updated = await request(base + '/contents/' + dataPath, {
    method: 'PUT', headers: {...headers, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      message: 'Refresh aggregate visit count: ' + total,
      content: Buffer.from(JSON.stringify(snapshot, null, 2) + '\n').toString('base64'),
      sha: file.sha, branch: dataBranch
    })
  });
  if (!updated.ok) throw new Error('The data update failed or another writer changed it; no force update was attempted.');
  console.log('Saved aggregate visit count:', total, snapshot.updatedAt);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
