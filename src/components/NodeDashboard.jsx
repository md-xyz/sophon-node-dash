import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, SortAsc, SortDesc, Grid, List, ChevronDown } from 'lucide-react';
import { StatsSkeleton, ChartSkeleton, TableRowSkeleton, CardSkeleton } from '@/components/ui/skeletons';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const NodeDashboard = () => {
    const { isDark } = useTheme();
    const [nodes, setNodes] = useState([]);
    const [filteredNodes, setFilteredNodes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'uptime', direction: 'desc' });
    const [viewMode, setViewMode] = useState('list');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Request up to 10000 nodes by adding pagination parameters
                const response = await fetch('https://monitor.sophon.xyz/nodes?page=1&per_page=10000');
                const data = await response.json();
                setNodes(data.nodes);
                setFilteredNodes(data.nodes);
            } catch (error) {
                console.error('Error fetching nodes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Reset to first page when search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    // Calculate pagination
    const paginatedNodes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredNodes.slice(startIndex, endIndex);
    }, [filteredNodes, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredNodes.length / itemsPerPage);

    // Memoize calculations
    const stats = useMemo(() => ({
        totalNodes: nodes.length,
        activeNodes: nodes.filter(n => n.status).length,
        avgUptime: nodes.length ? (nodes.reduce((acc, n) => acc + n.uptime, 0) / nodes.length).toFixed(2) : 0,
        avgFee: nodes.length ? (nodes.reduce((acc, n) => acc + n.fee, 0) / nodes.length).toFixed(2) : 0
    }), [nodes]);

    const feeChartData = useMemo(() => {
        const distribution = nodes.reduce((acc, node) => {
            const feeKey = node.fee.toString();
            acc[feeKey] = (acc[feeKey] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(distribution)
            .map(([fee, count]) => ({
                fee: `${fee}%`,
                count
            }));
    }, [nodes]);

    // Sort options
    const sortOptions = [
        { key: 'uptime', label: 'Uptime' },
        { key: 'fee', label: 'Fee' },
        { key: 'status', label: 'Status' },
    ];

    // Handle search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const filtered = nodes.filter(node =>
                node.operator.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredNodes(filtered);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, nodes]);

    // Handle sorting
    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });

        const sorted = [...filteredNodes].sort((a, b) => {
            if (direction === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            }
            return a[key] < b[key] ? 1 : -1;
        });

        setFilteredNodes(sorted);
        setShowSortMenu(false);
        setCurrentPage(1); // Reset to first page when sorting
    };

    // Sort indicator component
    const SortIndicator = ({ sortKey }) => {
        if (sortConfig.key !== sortKey) return null;
        return sortConfig.direction === 'asc' ?
            <SortAsc className="h-4 w-4 inline ml-1 dark:text-gray-300" /> :
            <SortDesc className="h-4 w-4 inline ml-1 dark:text-gray-300" />;
    };

    // Pagination controls component
    const PaginationControls = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredNodes.length);

        return (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t dark:border-gray-700 pt-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {startIndex + 1} to {endIndex} of {filteredNodes.length} results
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                        Previous
                    </button>
                    <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                            const page = i + 1;
                            if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 border dark:border-gray-700 rounded-lg ${currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (
                                page === currentPage - 2 ||
                                page === currentPage + 2
                            ) {
                                return <span key={page} className="px-1 dark:text-gray-300">...</span>;
                            }
                            return null;
                        })}
                    </div>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    // Node Card Component
    const NodeCard = ({ node }) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${node.status
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                    }`}>
                    {node.status ? 'Active' : 'Inactive'}
                </div>
                <div className="text-gray-500 dark:text-gray-400">{node.fee}% fee</div>
            </div>

            <div className="font-mono text-sm mb-3 truncate dark:text-gray-200" title={node.operator}>
                {node.operator}
            </div>

            <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
                <div className="flex items-center gap-2">
                    <div className="flex-grow bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-blue-600 rounded-full h-2"
                            style={{ width: `${node.uptime}%` }}
                        ></div>
                    </div>
                    <span className="text-sm dark:text-gray-300">{node.uptime.toFixed(2)}%</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold dark:text-white">Sophon Node Dashboard</h1>
                <ThemeToggle />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {isLoading ? (
                    <>
                        <StatsSkeleton />
                        <StatsSkeleton />
                        <StatsSkeleton />
                        <StatsSkeleton />
                    </>
                ) : (
                    <>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h3 className="text-gray-500 dark:text-gray-400">Total Nodes</h3>
                            <p className="text-2xl font-bold dark:text-white">{stats.totalNodes}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h3 className="text-gray-500 dark:text-gray-400">Active Nodes</h3>
                            <p className="text-2xl font-bold dark:text-white">{stats.activeNodes}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h3 className="text-gray-500 dark:text-gray-400">Average Uptime</h3>
                            <p className="text-2xl font-bold dark:text-white">{stats.avgUptime}%</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h3 className="text-gray-500 dark:text-gray-400">Average Fee</h3>
                            <p className="text-2xl font-bold dark:text-white">{stats.avgFee}%</p>
                        </div>
                    </>
                )}
            </div>

            {/* Fee Distribution Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
                {isLoading ? (
                    <ChartSkeleton />
                ) : (
                    <>
                        <h2 className="text-xl font-bold dark:text-white mb-4">Fee Distribution</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={feeChartData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke={isDark ? '#374151' : '#E5E7EB'}
                                    />
                                    <XAxis
                                        dataKey="fee"
                                        stroke={isDark ? '#9CA3AF' : '#4B5563'}
                                    />
                                    <YAxis
                                        stroke={isDark ? '#9CA3AF' : '#4B5563'}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                                            borderColor: isDark ? '#374151' : '#E5E7EB',
                                            color: isDark ? '#FFFFFF' : '#000000'
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="count"
                                        fill={isDark ? '#60A5FA' : '#3B82F6'}
                                        name="Number of Nodes"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </div>

            {/* Node List/Grid */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold dark:text-white">Node List</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list'
                                    ? 'bg-gray-100 dark:bg-gray-700'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                title="List View"
                            >
                                <List className="h-5 w-5 dark:text-gray-300" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid'
                                    ? 'bg-gray-100 dark:bg-gray-700'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                title="Grid View"
                            >
                                <Grid className="h-5 w-5 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                        {/* Items per page selector */}
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="px-3 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                        >
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                            <option value={200}>200 per page</option>
                        </select>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortMenu(!showSortMenu)}
                                className="px-4 py-2 border dark:border-gray-700 rounded-lg flex items-center justify-between gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 min-w-[140px] dark:text-gray-300"
                            >
                                <span>Sort by: {sortOptions.find(opt => opt.key === sortConfig.key)?.label}</span>
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {showSortMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-10">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.key}
                                            onClick={() => handleSort(option.key)}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 flex items-center justify-between"
                                        >
                                            <span>{option.label}</span>
                                            <SortIndicator sortKey={option.key} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Search Input */}
                        <div className="relative flex-grow md:max-w-md">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by operator address..."
                                className="pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg w-full bg-white dark:bg-gray-800 dark:text-gray-300 dark:placeholder-gray-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    viewMode === 'list' ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="p-2 text-left dark:text-gray-300">Operator</th>
                                    <th className="p-2 text-left dark:text-gray-300">Status</th>
                                    <th className="p-2 text-left dark:text-gray-300">Uptime</th>
                                    <th className="p-2 text-left dark:text-gray-300">Fee</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, i) => (
                                    <TableRowSkeleton key={i} />
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <CardSkeleton key={i} />
                            ))}
                        </div>
                    )
                ) : viewMode === 'list' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="p-2 text-left">
                                        <button
                                            onClick={() => handleSort('operator')}
                                            className="flex items-center gap-1 dark:text-gray-300"
                                        >
                                            Operator
                                            <SortIndicator sortKey="operator" />
                                        </button>
                                    </th>
                                    <th className="p-2 text-left">
                                        <button
                                            onClick={() => handleSort('status')}
                                            className="flex items-center gap-1 dark:text-gray-300"
                                        >
                                            Status
                                            <SortIndicator sortKey="status" />
                                        </button>
                                    </th>
                                    <th className="p-2 text-left">
                                        <button
                                            onClick={() => handleSort('uptime')}
                                            className="flex items-center gap-1 dark:text-gray-300"
                                        >
                                            Uptime
                                            <SortIndicator sortKey="uptime" />
                                        </button>
                                    </th>
                                    <th className="p-2 text-left">
                                        <button
                                            onClick={() => handleSort('fee')}
                                            className="flex items-center gap-1 dark:text-gray-300"
                                        >
                                            Fee
                                            <SortIndicator sortKey="fee" />
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedNodes.map((node, index) => (
                                    <tr key={node.operator} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'dark:bg-gray-900'}>
                                        <td className="p-2 dark:text-gray-300">
                                            <span className="font-mono text-sm">{node.operator}</span>
                                        </td>
                                        <td className="p-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${node.status
                                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                                                }`}>
                                                {node.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-2 dark:text-gray-300">
                                            <div className="flex items-center">
                                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-blue-600 rounded-full h-2"
                                                        style={{ width: `${node.uptime}%` }}
                                                    ></div>
                                                </div>
                                                <span>{node.uptime.toFixed(2)}%</span>
                                            </div>
                                        </td>
                                        <td className="p-2 dark:text-gray-300">{node.fee}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {paginatedNodes.map((node) => (
                            <NodeCard key={node.operator} node={node} />
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {!isLoading && filteredNodes.length > 0 && <PaginationControls />}
            </div>
        </div>
    );
};

export default NodeDashboard;