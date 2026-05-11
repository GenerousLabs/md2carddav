import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown } from '@subject/services/md/services/markdown/markdown.service.ts';

describe('parseMarkdown', () => {
  it('extracts data object from YAML frontmatter', () => {
    const md = '---\nuid: abc\ntitle: Jane Doe\n---\n';
    const result = parseMarkdown(md);
    assert.deepEqual(result.data, { uid: 'abc', title: 'Jane Doe' });
  });

  it('returns empty data when no frontmatter present', () => {
    const result = parseMarkdown('Just some content with no frontmatter.');
    assert.deepEqual(result.data, {});
  });

  it('returns body content after frontmatter', () => {
    const md = '---\nuid: abc\n---\nSome body text.';
    const result = parseMarkdown(md);
    assert.equal(result.content.trim(), 'Some body text.');
  });

  it('handles multi-line YAML values', () => {
    const md = '---\nuid: abc\ntitle: Jane\ndesc: |\n  Line one\n  Line two\n---\n';
    const result = parseMarkdown(md);
    assert.equal(result.data.uid, 'abc');
    assert.ok(result.data.desc.includes('Line one'));
  });

  it('handles arrays in frontmatter', () => {
    const md = '---\nuid: abc\ntitle: Jane\nphones:\n  - "+1234"\n  - "+5678"\n---\n';
    const result = parseMarkdown(md);
    assert.deepEqual(result.data.phones, ['+1234', '+5678']);
  });

  it('returns empty content string when body is absent', () => {
    const md = '---\nuid: abc\ntitle: Jane\n---\n';
    const result = parseMarkdown(md);
    assert.equal(result.content.trim(), '');
  });
});
