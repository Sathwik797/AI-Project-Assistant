import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const frontendRoot = new URL('..', import.meta.url);

test('tasksApi.createTask forwards its complete JSON payload', async () => {
  const source = await readFile(new URL('src/services/api.js', `${frontendRoot}/`), 'utf8');
  assert.match(
    source,
    /createTask:\s*\(projectId, data\)\s*=>\s*api\.post\(`\/projects\/\$\{projectId\}\/tasks`, data\)/,
  );
});

test('document UI consumes canonical is_indexed and index_info.chunk_count fields', async () => {
  const files = [
    'src/components/documents/DocumentTable.jsx',
    'src/components/dashboard/RecentDocuments.jsx',
    'src/components/dashboard/ProjectInsights.jsx',
    'src/pages/Assistant.jsx',
    'src/pages/Overview.jsx',
  ];

  for (const file of files) {
    const source = await readFile(new URL(file, `${frontendRoot}/`), 'utf8');
    assert.match(source, /\.is_indexed/);
    assert.doesNotMatch(source, /\.indexed\b/);
  }

  const documentsPage = await readFile(new URL('src/pages/Documents.jsx', `${frontendRoot}/`), 'utf8');
  assert.match(documentsPage, /index_info\?\.chunk_count/);
  assert.doesNotMatch(documentsPage, /chunks_created/);
});

test('workspace routes include the canonical project prefix and assistant route', async () => {
  const source = await readFile(new URL('src/App.jsx', `${frontendRoot}/`), 'utf8');
  assert.match(source, /path="\/projects\/:projectId"/);
  assert.match(source, /path="\/projects"/);
  for (const route of ['overview', 'assistant', 'documents', 'requirements', 'user-stories', 'tasks', 'conflicts']) {
    assert.match(source, new RegExp(`path="${route}"`));
  }
});
