import React from 'react';

interface SimpleListCardProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  footer?: React.ReactNode;
  headerRight?: React.ReactNode;
  onItemClick?: (item: T, index: number) => void;
}

const SimpleListCard = <T,>({ title, items, renderItem, footer, headerRight, onItemClick }: SimpleListCardProps<T>) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {headerRight && <div className="ml-4">{headerRight}</div>}
      </div>
      <div className="p-4 flex-1">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => onItemClick?.(item, index)}
              className={`pb-3 last:pb-0 border-b last:border-b-0 border-gray-100 transition-colors ${onItemClick ? 'hover:bg-gray-50 cursor-pointer px-2 py-2 rounded' : ''}`}
            >
              {renderItem(item, index)}
            </div>
          ))}
          {items.length === 0 && (
            <div className="flex items-center justify-center py-6 text-sm text-gray-400">
              No items to display
            </div>
          )}
        </div>
        {footer && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleListCard;


