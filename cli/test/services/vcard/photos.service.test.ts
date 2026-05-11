import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  getPhotoExtension,
  getPhotoAsDataURL,
} from '@subject/services/vcard/services/photos/photos.service.ts';

// getPhotoFromVcfer is tested indirectly through generateContactFromVcard

describe('getPhotoExtension', () => {
  it('returns .jpeg for image/jpeg', () => {
    assert.equal(getPhotoExtension('image/jpeg'), '.jpeg');
  });

  it('returns .png for image/png', () => {
    assert.equal(getPhotoExtension('image/png'), '.png');
  });

  it('returns .gif for image/gif', () => {
    assert.equal(getPhotoExtension('image/gif'), '.gif');
  });

  it('returns .jpeg when mediatype is undefined', () => {
    assert.equal(getPhotoExtension(undefined), '.jpeg');
  });

  it('returns .jpeg for malformed mediatype with no slash', () => {
    assert.equal(getPhotoExtension('imagejpeg'), '.jpeg');
  });
});

describe('getPhotoAsDataURL', () => {
  it('returns data URI for a .jpg file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'md2carddav-photo-'));
    await writeFile(join(dir, 'photo.jpg'), 'fake-jpeg-data');
    const result = await getPhotoAsDataURL(dir, 'photo.jpg');
    assert.ok(result.startsWith('data:image/jpeg,'));
    await rm(dir, { recursive: true });
  });

  it('returns data URI for a .png file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'md2carddav-photo-'));
    await writeFile(join(dir, 'photo.png'), 'fake-png-data');
    const result = await getPhotoAsDataURL(dir, 'photo.png');
    assert.ok(result.startsWith('data:image/png,'));
    await rm(dir, { recursive: true });
  });

  it('passes through an existing data: URI unchanged', async () => {
    const dataUri = 'data:image/jpeg;base64,abc123';
    const result = await getPhotoAsDataURL('/tmp', dataUri);
    assert.equal(result, dataUri);
  });

  it('throws for unsupported file extension', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'md2carddav-photo-'));
    await writeFile(join(dir, 'photo.bmp'), 'fake-bmp-data');
    await assert.rejects(
      () => getPhotoAsDataURL(dir, 'photo.bmp'),
      /Invalid photo/
    );
    await rm(dir, { recursive: true });
  });

  it('throws for non-existent file', async () => {
    await assert.rejects(
      () => getPhotoAsDataURL('/tmp', 'does-not-exist.jpg')
    );
  });
});
