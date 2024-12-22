import React from 'react';

export const StatsSkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow animate-pulse">
        <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
    </div>
);

export const ChartSkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
    </div>
);

export const TableRowSkeleton = () => (
    <tr className="animate-pulse">
        <td className="p-2"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
        <td className="p-2"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
        <td className="p-2"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
        <td className="p-2"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
    </tr>
);

export const CardSkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow animate-pulse">
        <div className="flex justify-between items-start mb-3">
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
            <div className="h-6 w-12 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
        <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-2 w-full bg-gray-200 rounded"></div>
        </div>
    </div>
);