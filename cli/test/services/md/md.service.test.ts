import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getMdContacts } from '@subject/services/md/md.service.ts';
import { mockContext } from '../../helpers/mock-context.ts';

const VALID_MD = `---\nuid: test-uid-001\ntitle: Jane Doe\n---\n`;
const INVALID_MD = `---\ntitle: Missing UID\n---\n`;

describe('getMdContacts', () => {
  it('returns contacts for valid markdown files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'md2carddav-md-'));
    await writeFile(join(dir, 'jane.md'), VALID_MD);
    const ctx = mockContext(dir);
    const results = await getMdContacts(ctx);
    assert.equal(results.length, 1);
    assert.ok('contact' in results[0]);
    if ('contact' in results[0]) {
      assert.equal(results[0].contact.uid, 'test-uid-001');
      assert.equal(results[0].contact.title, 'Jane Doe');
    }
    await rm(dir, { recursive: true });
  });

  it('returns error entry for invalid markdown files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'md2carddav-md-'));
    await writeFile(join(dir, 'invalid.md'), INVALID_MD);
    const ctx = mockContext(dir);
    const results = await getMdContacts(ctx);
    assert.equal(results.length, 1);
    assert.ok('error' in results[0]);
    await rm(dir, { recursive: true });
  });

  it('processes both valid and invalid files without stopping', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'md2carddav-md-'));
    await writeFile(join(dir, 'valid.md'), VALID_MD);
    await writeFile(join(dir, 'invalid.md'), INVALID_MD);
    const ctx = mockContext(dir);
    const results = await getMdContacts(ctx);
    assert.equal(results.length, 2);
    const contacts = results.filter(r => 'contact' in r);
    const errors = results.filter(r => 'error' in r);
    assert.equal(contacts.length, 1);
    assert.equal(errors.length, 1);
    await rm(dir, { recursive: true });
  });

  it('respects fileFilter from config', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'md2carddav-md-'));
    await writeFile(join(dir, 'jane.contact.md'), VALID_MD);
    await writeFile(join(dir, 'other.md'), VALID_MD.replace('test-uid-001', 'test-uid-002'));
    const ctx = {
      ...mockContext(dir),
      config: {
        carddav: {
          url: 'https://dav.example.com',
          credentials: { username: 'user', password: 'pass' },
          authMethod: 'Basic' as const,
        },
        md: { directory: dir, fileFilter: ['*.contact.md'] },
      },
    };
    const results = await getMdContacts(ctx);
    assert.equal(results.length, 1);
    await rm(dir, { recursive: true });
  });

  it('returns empty array for empty directory', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'md2carddav-md-'));
    const ctx = mockContext(dir);
    const results = await getMdContacts(ctx);
    assert.equal(results.length, 0);
    await rm(dir, { recursive: true });
  });
});
