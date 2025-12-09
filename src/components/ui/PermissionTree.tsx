import React, { useState, useCallback, useEffect } from 'react';

export interface PermissionNode {
  id: number;
  display_name: string;
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
  }, [selectedPermissionIds]);

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
    if (node.children) {
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

  // Handle checkbox toggle (parent or child)
  const handleToggle = (node: PermissionNode, checked: boolean, parent?: PermissionNode) => {
    const allIds = collectIds(node);
    setSelected((prev) => {
      let next: number[];
      if (checked) {
        // Add all IDs (deduped)
        next = Array.from(new Set([...prev, ...allIds]));
        // If parent exists, check if all siblings are checked, then check parent
        if (parent) {
          const siblings = parent.children || [];
          const allSiblingsChecked = siblings.every((s) =>
            s.id === node.id ? true : prev.includes(s.id)
          );
          if (allSiblingsChecked && !prev.includes(parent.id)) {
            next.push(parent.id);
          }
        }
      } else {
        // Remove all IDs
        next = prev.filter((id) => !allIds.includes(id));
        // If parent exists, uncheck parent if any child is unchecked
        if (parent && prev.includes(parent.id)) {
          next = next.filter((id) => id !== parent.id);
        }
      }
      return next;
    });
  };

  // ...existing code...

  // Expand/collapse toggle
  const handleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Recursive render
  const renderNode = (node: PermissionNode, level = 0, parent?: PermissionNode) => {
    const hasChildren = node.children && node.children.length > 0;
    const expandedState = expanded[node.id] ?? true;
    const checked = isChecked(node.id);
    const allChildrenChecked = hasChildren ? node.children!.every((c) => isChecked(c.id)) : false;
    const indeterminate = hasChildren && isAnyChildChecked(node) && !allChildrenChecked;

    return (
      <div key={node.id} className="ml-0" style={{ marginLeft: level * 24 }}>
        <div className="flex items-center gap-2 py-1">
          {hasChildren && (
            <button
              type="button"
              className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => handleExpand(node.id)}
              aria-label={expandedState ? 'Collapse' : 'Expand'}
            >
              <span>{expandedState ? '▼' : '▶'}</span>
            </button>
          )}
          <input
            type="checkbox"
            checked={checked}
            ref={el => {
              if (el) el.indeterminate = !!indeterminate;
            }}
            onChange={e => {
              handleToggle(node, e.target.checked, parent);
            }}
            className="accent-blue-600 w-4 h-4 rounded border-gray-300"
            id={`perm-${node.id}`}
          />
          <label htmlFor={`perm-${node.id}`} className="select-none text-sm text-gray-800">
            {node.display_name} <span className="text-xs text-gray-400">({node.id})</span>
          </label>
        </div>
        {hasChildren && expandedState && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {node.children!.map(child => renderNode(child, level + 1, node))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {data.map(node => renderNode(node))}
    </div>
  );
};

export default PermissionTree;
