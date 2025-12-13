import React, { useState, useCallback, useEffect } from 'react';

export interface PermissionNode {
  id: number;
  display_name: string;
  name?: string;
  description?: string;
  url?: string;
  icon_file?: string | null;
  icon_text?: string;
  is_parent?: number | null;
  status?: string;
  order?: number;
  children?: PermissionNode[];
}

interface PermissionTreeProps {
  data: PermissionNode[];
  selectedPermissionIds?: number[];
  onChange?: (selected: number[]) => void;
}

const PermissionTree: React.FC<PermissionTreeProps> = ({ data, selectedPermissionIds = [], onChange }) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [selected, setSelected] = useState<number[]>(selectedPermissionIds);

  useEffect(() => {
    setSelected(selectedPermissionIds);
    // Auto-expand parents of selected items
    if (selectedPermissionIds.length > 0) {
      const expandedIds: Record<number, boolean> = {};
      const expandParents = (node: PermissionNode) => {
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => {
            if (selectedPermissionIds.includes(child.id)) {
              expandedIds[node.id] = true;
            }
            expandParents(child);
          });
        }
      };
      data.forEach(node => expandParents(node));
      setExpanded(expandedIds);
    }
  }, [selectedPermissionIds, data]);

  useEffect(() => {
    if (onChange) onChange(selected);
  }, [selected, onChange]);

  const isChecked = useCallback(
    (id: number) => selected.includes(id),
    [selected]
  );

  // Recursively collect all descendant IDs
  const collectIds = (node: PermissionNode): number[] => {
    let ids = [node.id];
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        ids = ids.concat(collectIds(child));
      });
    }
    return ids;
  };

  // Recursively check if all children are checked
  const areAllChildrenChecked = (node: PermissionNode): boolean => {
    if (!node.children || node.children.length === 0) return isChecked(node.id);
    return node.children.every((child) => areAllChildrenChecked(child));
  };

  // Recursively check if any child is checked
  const isAnyChildChecked = (node: PermissionNode): boolean => {
    if (!node.children || node.children.length === 0) return isChecked(node.id);
    return node.children.some((child) => isAnyChildChecked(child));
  };

  // Build parent-child map for all nodes
  const buildParentMap = (nodes: PermissionNode[], parentMap: Map<number, PermissionNode> = new Map()) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          parentMap.set(child.id, node);
        });
        buildParentMap(node.children, parentMap);
      }
    });
    return parentMap;
  };

  const parentMap = buildParentMap(data);

  // Collect all parent IDs for a given node
  const collectParentIds = (nodeId: number): number[] => {
    const parentIds: number[] = [];
    let currentId = nodeId;
    while (parentMap.has(currentId)) {
      const parent = parentMap.get(currentId)!;
      parentIds.push(parent.id);
      currentId = parent.id;
    }
    return parentIds;
  };

  // Handle checkbox toggle (parent or child)
  const handleToggle = (node: PermissionNode, checked: boolean) => {
    const allIds = collectIds(node);
    const parentIds = collectParentIds(node.id);
    
    setSelected((prev) => {
      let next: number[];
      if (checked) {
        // Add all IDs + all parent IDs (deduped)
        next = Array.from(new Set([...prev, ...allIds, ...parentIds]));
        // Auto-expand all parents
        setExpanded((exp) => {
          const newExp = { ...exp };
          parentIds.forEach((id) => {
            newExp[id] = true;
          });
          return newExp;
        });
      } else {
        // Remove all IDs
        next = prev.filter((id) => !allIds.includes(id));
        // Check if we need to uncheck parents
        parentIds.forEach((parentId) => {
          const parentNode = findNodeById(data, parentId);
          if (parentNode) {
            const parentChildren = parentNode.children || [];
            const hasAnyCheckedChild = parentChildren.some((child) => {
              const childIds = collectIds(child);
              return childIds.some((id) => next.includes(id));
            });
            if (!hasAnyCheckedChild) {
              next = next.filter((id) => id !== parentId);
            }
          }
        });
      }
      return next;
    });
  };

  // Helper function to find node by ID
  const findNodeById = (nodes: PermissionNode[], id: number): PermissionNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Expand/collapse toggle
  const handleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Recursive render
  const renderNode = (node: PermissionNode, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const expandedState = expanded[node.id] ?? false;
    const checked = isChecked(node.id);
    const allChildrenChecked = hasChildren ? node.children!.every((c) => isChecked(c.id)) : false;
    const indeterminate = hasChildren && isAnyChildChecked(node) && !allChildrenChecked;

    return (
      <div key={node.id} className="mb-0.5">
        <div 
          className="flex items-center gap-2 py-2.5 px-3 rounded-md transition-all duration-150 hover:bg-blue-50 group"
          style={{ marginLeft: `${level * 20}px` }}
        >
          {/* Expand/Collapse Icon */}
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            {hasChildren && (
              <span
                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                onClick={() => handleExpand(node.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleExpand(node.id);
                  }
                }}
                title={expandedState ? 'Collapse' : 'Expand'}
              >
                <span className="text-sm">{expandedState ? '▼' : '▶'}</span>
              </span>
            )}
          </div>

          {/* Checkbox */}
          <input
            type="checkbox"
            checked={checked}
            ref={el => {
              if (el) el.indeterminate = !!indeterminate;
            }}
            onChange={e => {
              handleToggle(node, e.target.checked);
            }}
            className="w-4 h-4 accent-blue-600 rounded cursor-pointer flex-shrink-0 transition-colors"
            id={`perm-${node.id}`}
          />

          {/* Label */}
          <label 
            htmlFor={`perm-${node.id}`} 
            className="select-none cursor-pointer flex-1 transition-colors text-sm text-gray-700"
          >
            {node.display_name}
          </label>

          {/* Permission Code & ID - Right Aligned */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {node.name && (
              <span className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors">
                {node.name}
              </span>
            )}
            <span className="text-xs text-gray-500 font-mono group-hover:text-gray-600 transition-colors bg-gray-100 group-hover:bg-gray-200 px-2 py-0.5 rounded">
              #{node.id}
            </span>
          </div>
        </div>

        {/* Children */}
        {hasChildren && expandedState && (
          <div className="relative">
            {/* Vertical line for children grouping */}
            <div 
              className="absolute left-0 top-0 bottom-0 border-l-2 border-gray-200"
              style={{ marginLeft: `${level * 20 + 12}px` }}
            ></div>
            <div>
              {node.children!.map(child => renderNode(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full p-4 bg-white space-y-0.5 max-h-96 overflow-y-auto rounded-lg">
      {data && data.length > 0 ? (
        <div className="space-y-1">
          {data.map(node => renderNode(node))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No permissions available
        </div>
      )}
    </div>
  );
};

export default PermissionTree;
