import React from 'react';

interface SimpleListCardProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  footer?: React.ReactNode;
}

const SimpleListCard = <T,>({ title, items, renderItem, footer }: SimpleListCardProps<T>) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="pb-4 last:pb-0 border-b last:border-b-0 border-gray-100">
              {renderItem(item, index)}
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-sm text-gray-500">No items to display</div>
          )}
        </div>
        {footer && (
          <div className="mt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleListCard;


