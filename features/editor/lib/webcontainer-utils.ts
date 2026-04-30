import { FileNode } from "@/features/test/hooks/use-local-files";

/**
 * Chuyển đổi mảng phẳng FileNode[] sang cấu trúc Nested Object của WebContainer
 */
export const transformToWebContainerFiles = (files: FileNode[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const root: any = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildTree = (parentId: string | null, currentDir: any) => {
    const children = files.filter((f) => f.parentId === parentId);

    children.forEach((node) => {
      if (node.type === "file") {
        currentDir[node.name] = {
          file: {
            contents: node.content || "",
          },
        };
      } else {
        currentDir[node.name] = {
          directory: {},
        };
        buildTree(node.id, currentDir[node.name].directory);
      }
    });
  };

  buildTree(null, root);
  return root;
};