import type * as mdast from 'mdast';

export interface MarkdownNode {
  type: string;
  children?: MarkdownNode[];
  value?: string;
  url?: string;
  alt?: string | null;
  data?: {
    name?: string;
    token?: string;
  };
}

/**
 * 将Markdown AST转换为HTML字符串
 */
export function markdownAstToHtml(ast: mdast.Root | MarkdownNode): string {
  if (!ast) return '';

  switch (ast.type) {
    case 'root':
      return `<div class="markdown-content" style="max-width: 800px; margin: 0 auto; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </div>`;

    case 'paragraph':
      return `<p style="margin: 1em 0; line-height: 1.6; color: #2c3e50;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </p>`;

    case 'text':
      return (ast as any).value || '';

    case 'image':
      return `<img src="${(ast as any).url || ''}" alt="${(ast as any).alt || ''}" style="max-width: 100%; height: auto; margin: 1em 0;" />`;

    case 'heading':
      const level = (ast as any).depth || 1;
      return `<h${level} style="margin: 1.5em 0 0.5em; font-weight: 600; color: #1a202c; line-height: 1.25;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </h${level}>`;

    case 'list':
      const listType = (ast as any).ordered ? 'ol' : 'ul';
      return `<${listType} style="margin: 1em 0; padding-left: 2em;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </${listType}>`;

    case 'listItem':
      return `<li style="margin: 0.5em 0;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </li>`;

    case 'link':
      return `<a href="${(ast as any).url || '#'}" style="color: #3182ce; text-decoration: none; border-bottom: 1px solid #3182ce;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </a>`;

    case 'strong':
      return `<strong style="font-weight: 600; color: #1a202c;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </strong>`;

    case 'emphasis':
      return `<em style="font-style: italic; color: #4a5568;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </em>`;

    case 'code':
      return `<code style="padding: 0.2em 0.4em; background-color: #f7fafc; border-radius: 3px; font-family: monospace;">${(ast as any).value || ''}</code>`;

    case 'codeBlock':
      return `<pre style="margin: 1em 0; padding: 1em; background-color: #f7fafc; border-radius: 5px; overflow-x: auto;"><code class="language-${(ast as any).lang || ''}" style="font-family: monospace; line-height: 1.4;">
        ${(ast as any).value || ''}
      </code></pre>`;

    case 'blockquote':
      return `<blockquote style="margin: 1em 0; padding-left: 1em; border-left: 4px solid #cbd5e0; color: #4a5568;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </blockquote>`;

    case 'thematicBreak':
      return '<hr style="margin: 2em 0; border: none; border-top: 1px solid #e2e8f0;" />';

    case 'table':
      return `<table style="width: 100%; border-collapse: collapse; margin: 1em 0;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </table>`;

    case 'ul':
      return `<ul style="margin: 1em 0; padding-left: 2em; list-style-type: disc;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </ul>`;

    case 'ol':
      return `<ol style="margin: 1em 0; padding-left: 2em; list-style-type: decimal;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </ol>`;

    case 'li':
      return `<li style="margin: 0.5em 0;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </li>`;

    case 'h1':
      return `<h1 style="margin: 1.5em 0 0.5em; font-size: 2em; font-weight: 600; color: #1a202c;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </h1>`;

    case 'h2':
      return `<h2 style="margin: 1.5em 0 0.5em; font-size: 1.5em; font-weight: 600; color: #1a202c;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </h2>`;

    case 'h3':
      return `<h3 style="margin: 1.5em 0 0.5em; font-size: 1.25em; font-weight: 600; color: #1a202c;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </h3>`;

    case 'h4':
      return `<h4 style="margin: 1.5em 0 0.5em; font-size: 1em; font-weight: 600; color: #1a202c;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </h4>`;

    case 'h5':
      return `<h5 style="margin: 1.5em 0 0.5em; font-size: 0.875em; font-weight: 600; color: #1a202c;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </h5>`;

    case 'h6':
      return `<h6 style="margin: 1.5em 0 0.5em; font-size: 0.85em; font-weight: 600; color: #1a202c;">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </h6>`;

    default:
      return '';
  }
} 