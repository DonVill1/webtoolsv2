import { marked } from "marked";

/** Renders first-party Markdown only (repo-authored guide bodies). */
export async function Markdown({ source }: { source: string }) {
  const html = await marked.parse(source, { gfm: true, breaks: false });
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
