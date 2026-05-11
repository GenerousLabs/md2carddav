import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getFilesFromPath } from '@subject/services/md/services/files/files.service.ts';

describe('getFilesFromPath', () => {
  it('returns matching files for *.md filter', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'md2carddav-files-'));
    await writeFile(join(dir, 'a.md'), '');
    await writeFile(join(dir, 'b.md'), '');
    await writeFile(join(dir, 'c.txt'), '');
    const files = await getFilesFromPath(dir, ['*.md']);
    assert.equal(files.length, 2);
    assert.ok(files.every(f => f.path.endsWith('.md')));
    await rm(dir, { recursive: true });
  });

  it('returns only matching files for *.contact.md filter', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'md2carddav-files-'));
    await writeFile(join(dir, 'a.contact.md'), '');
    await writeFile(join(dir, 'b.md'), '');
    const files = await getFilesFromPath(dir, ['*.contact.md']);
    assert.equal(files.length, 1);
    assert.ok(files[0].path.endsWith('.contact.md'));
    await rm(dir, { recursive: true });
  });

  it('returns empty array when no files match the filter', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'md2carddav-files-'));
    await writeFile(join(dir, 'a.txt'), '');
    const files = await getFilesFromPath(dir, ['*.md']);
    assert.equal(files.length, 0);
    await rm(dir, { recursive: true });
  });

  it('throws for a non-existent directory', async () => {
    await assert.rejects(
      () => getFilesFromPath('/tmp/does-not-exist-ever-12345', ['*.md']),
      /does not exist/
    );
  });

  it('throws when path is a file not a directory', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'md2carddav-files-'));
    const file = join(dir, 'not-a-dir.md');
    await writeFile(file, '');
    await assert.rejects(
      () => getFilesFromPath(file, ['*.md']),
      /not a directory/i
    );
    await rm(dir, { recursive: true });
  });
});
