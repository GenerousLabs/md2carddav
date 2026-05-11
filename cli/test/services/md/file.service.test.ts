import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getFileContents } from '@subject/services/md/services/file/file.service.ts';

describe('getFileContents', () => {
  it('returns success with file contents for an existing file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'md2carddav-file-'));
    const path = join(dir, 'test.md');
    await writeFile(path, 'hello world');
    const result = await getFileContents(path);
    assert.equal(result.success, true);
    if (!result.success) throw new Error('Expected success');
    assert.equal(result.result, 'hello world');
    await rm(dir, { recursive: true });
  });

  it('returns failure for a non-existent file (does not throw)', async () => {
    const result = await getFileContents('/tmp/does-not-exist-ever-12345.md');
    assert.equal(result.success, false);
    if (!result.success) {
      assert.ok(typeof result.error === 'string');
      assert.ok(typeof result.code === 'string');
    }
  });

  it('returns multi-line file contents intact', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'md2carddav-file-'));
    const path = join(dir, 'multi.md');
    const content = '---\nuid: abc\ntitle: Jane\n---\nSome body.';
    await writeFile(path, content);
    const result = await getFileContents(path);
    assert.equal(result.success, true);
    if (!result.success) throw new Error('Expected success');
    assert.equal(result.result, content);
    await rm(dir, { recursive: true });
  });
});
