// components/PageHeader.tsx
import React from "react";

interface PageHeaderProps {
    title: string;
    children?: React.ReactNode;
}

const TableHeader: React.FC<PageHeaderProps> = ({ title, children }) => {
    return (
        <div className="bg-gray-50 px-3 md:px-5 py-3 md:py-4 flex flex-row items-center justify-between gap-3 flex-wrap md:flex-nowrap border-b border-gray-200">
            <h2 className="text-sm md:text-base font-semibold text-gray-900 flex-shrink-0">
                {title}
            </h2>

            <div className="w-full sm:w-auto sm:ml-auto">
                {children}
            </div>
        </div>
    );
};

export default TableHeader;