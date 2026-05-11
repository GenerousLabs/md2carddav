import matter from "npm:gray-matter";

export const parseMarkdown = (markdown: string): matter.GrayMatterFile<string> => {
  return matter(markdown);
};
