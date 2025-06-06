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
      return `<div class="markdown-content">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </div>`;

    case 'paragraph':
      return `<p>
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </p>`;

    case 'text':
      return (ast as any).value || '';

    case 'image':
      return `<img src="${(ast as any).url || ''}" alt="${(ast as any).alt || ''}" />`;

    case 'heading':
      const level = (ast as any).depth || 1;
      return `<h${level}>
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </h${level}>`;

    case 'list':
      const listType = (ast as any).ordered ? 'ol' : 'ul';
      return `<${listType}>
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </${listType}>`;

    case 'listItem':
      return `<li>
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </li>`;

    case 'link':
      return `<a href="${(ast as any).url || '#'}">
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </a>`;

    case 'strong':
      return `<strong>
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </strong>`;

    case 'emphasis':
      return `<em>
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </em>`;

    case 'code':
      return `<code>${(ast as any).value || ''}</code>`;

    case 'codeBlock':
      return `<pre><code class="language-${(ast as any).lang || ''}">
        ${(ast as any).value || ''}
      </code></pre>`;

    case 'blockquote':
      return `<blockquote>
        ${(ast.children as MarkdownNode[])?.map(markdownAstToHtml).join('') || ''}
      </blockquote>`;

    case 'thematicBreak':
      return '<hr />';

    default:
      return '';
  }
} 