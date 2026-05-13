export interface SimpleListCardProps<T> {
    title: string;
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    footer?: React.ReactNode;
    headerRight?: React.ReactNode;
    onItemClick?: (item: T, index: number) => void;
}

export interface StatCardProps {
    title: string | React.ReactNode;
    value: string | number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down';
    trendValue?: string;
}