import * as matter from "gray-matter";

export const parseMarkdown = (
  markdown: string
): matter.GrayMatterFile<string> => {
  const output = matter(markdown);
  return output;
};
