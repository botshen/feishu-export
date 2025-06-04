import { createProgressDisplay } from "../process-bar/bar-display";

interface TOCItem {
  text: string;
  level: number;
  children: TOCItem[];
}

/**
 * 展开所有折叠的目录项
 */
async function expandAllNodes(rootElement: Element): Promise<void> {
  const expandArrows = rootElement.querySelectorAll('.workspace-tree-view-node-expand-arrow--collapsed');

  for (const arrow of expandArrows) {
    const button = arrow.querySelector('[role="button"]');
    if (button) {
      (button as HTMLElement).click();
      // 等待子节点加载
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // 再次检查是否有新的折叠节点（处理多级目录的情况）
  const newExpandArrows = rootElement.querySelectorAll('.workspace-tree-view-node-expand-arrow--collapsed');
  if (newExpandArrows.length > 0) {
    await expandAllNodes(rootElement);
  }
}

/**
 * 从 DOM 元素中提取目录项的文本
 */
function extractTextFromElement(element: Element): string {
  const contentSpan = element.querySelector('.workspace-tree-view-node-content');
  return contentSpan?.textContent?.trim() || '';
}

/**
 * 计算目录项的层级
 */
function calculateLevel(element: Element): number {
  const nodeDiv = element.querySelector('.workspace-tree-view-node');
  if (!nodeDiv) return 0;

  const level = nodeDiv.getAttribute('data-node-level');
  return level ? parseInt(level, 10) : 0;
}

/**
 * 构建目录树结构
 */
function buildTOCTree(rootElement: Element): TOCItem[] {
  const items: TOCItem[] = [];
  const stack: { item: TOCItem; level: number }[] = [];

  // 获取所有目录项
  const nodes = rootElement.querySelectorAll('.workspace-tree-view-node-wrapper');

  nodes.forEach((node) => {
    const text = extractTextFromElement(node);
    if (!text) return;

    const level = calculateLevel(node);
    const item: TOCItem = { text, level, children: [] };

    // 根据层级关系构建树结构
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      items.push(item);
    } else {
      stack[stack.length - 1].item.children.push(item);
    }

    stack.push({ item, level });
  });

  return items;
}

/**
 * 打印目录树
 */
function printTreeItem(item: TOCItem, prefix: string = ''): string {
  let result = `${prefix}${item.text}\n`;

  if (item.children.length > 0) {
    const childPrefix = prefix + '  ';
    item.children.forEach((child, index) => {
      const isLast = index === item.children.length - 1;
      const linePrefix = isLast ? '└─ ' : '├─ ';
      result += printTreeItem(child, prefix + (isLast ? '   ' : '│  ') + linePrefix);
    });
  }

  return result;
}

/**
 * 导出打印目录树的主函数
 */
export async function printTOC(): Promise<void> {
  const tocElement = document.getElementById('TOC-ROOT');
  if (!tocElement) {
    console.log('未找到目录结构');
    return;
  }

  // 先展开所有折叠的节点
  await expandAllNodes(tocElement);

  // 等待一下以确保所有节点都已展开
  await new Promise(resolve => setTimeout(resolve, 500));

  const tree = buildTOCTree(tocElement);
  let output = '文档目录结构：\n\n';

  tree.forEach((item, index) => {
    const isLast = index === tree.length - 1;
    const prefix = isLast ? '└─ ' : '├─ ';
    output += printTreeItem(item, prefix);
  });

  console.log(output);
} 