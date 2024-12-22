import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, SortAsc, SortDesc, Grid, List, ChevronDown } from 'lucide-react';

const NodeDashboard = () => {
    const [nodes, setNodes] = useState([]);
    const [filteredNodes, setFilteredNodes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'uptime', direction: 'desc' });
    const [viewMode, setViewMode] = useState('list');
    const [showSortMenu, setShowSortMenu] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://monitor.sophon.xyz/nodes');
                const data = await response.json();
                setNodes(data.nodes);
                setFilteredNodes(data.nodes);
            } catch (error) {
                console.error('Error fetching nodes:', error);
            }
        };

        fetchData();
    }, []);

    // Sort options
    const sortOptions = [
        { key: 'uptime', label: 'Uptime' },
        { key: 'fee', label: 'Fee' },
        { key: 'status', label: 'Status' },
    ];

    // Calculate statistics
    const stats = {
        totalNodes: nodes.length,
        activeNodes: nodes.filter(n => n.status).length,
        avgUptime: nodes.length ? (nodes.reduce((acc, n) => acc + n.uptime, 0) / nodes.length).toFixed(2) : 0,
        avgFee: nodes.length ? (nodes.reduce((acc, n) => acc + n.fee, 0) / nodes.length).toFixed(2) : 0
    };

    // Prepare fee distribution data
    const feeDistribution = nodes.reduce((acc, node) => {
        const feeKey = node.fee.toString();
        acc[feeKey] = (acc[feeKey] || 0) + 1;
        return acc;
    }, {});

    const feeChartData = Object.entries(feeDistribution).map(([fee, count]) => ({
        fee: `${fee}%`,
        count
    }));

    // Handle search
    const handleSearch = (term) => {
        setSearchTerm(term);
        const filtered = nodes.filter(node =>
            node.operator.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredNodes(filtered);
    };

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
    };

    // Sort indicator component
    const SortIndicator = ({ sortKey }) => {
        if (sortConfig.key !== sortKey) return null;
        return sortConfig.direction === 'asc' ?
            <SortAsc className="h-4 w-4 inline ml-1" /> :
            <SortDesc className="h-4 w-4 inline ml-1" />;
    };

    // Node Card Component for Grid View
    const NodeCard = ({ node }) => (
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${node.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {node.status ? 'Active' : 'Inactive'}
                </div>
                <div className="text-gray-500 text-sm">{node.fee}% fee</div>
            </div>

            <div className="font-mono text-sm mb-3 truncate" title={node.operator}>
                {node.operator}
            </div>

            <div className="space-y-2">
                <div className="text-sm text-gray-600">Uptime</div>
                <div className="flex items-center gap-2">
                    <div className="flex-grow bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 rounded-full h-2"
                            style={{ width: `${node.uptime}%` }}
                        ></div>
                    </div>
                    <span className="text-sm">{node.uptime.toFixed(2)}%</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Node Dashboard</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500">Total Nodes</h3>
                    <p className="text-2xl font-bold">{stats.totalNodes}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500">Active Nodes</h3>
                    <p className="text-2xl font-bold">{stats.activeNodes}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500">Average Uptime</h3>
                    <p className="text-2xl font-bold">{stats.avgUptime}%</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500">Average Fee</h3>
                    <p className="text-2xl font-bold">{stats.avgFee}%</p>
                </div>
            </div>

            {/* Fee Distribution Chart */}
            <div className="bg-white p-4 rounded-lg shadow mb-8">
                <h2 className="text-xl font-bold mb-4">Fee Distribution</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={feeChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fee" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#3B82F6" name="Number of Nodes" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Node List/Grid */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold">Node List</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                                title="List View"
                            >
                                <List className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                                title="Grid View"
                            >
                                <Grid className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortMenu(!showSortMenu)}
                                className="px-4 py-2 border rounded-lg flex items-center justify-between gap-2 bg-white hover:bg-gray-50 min-w-[140px]"
                            >
                                <span>Sort by: {sortOptions.find(opt => opt.key === sortConfig.key)?.label}</span>
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {showSortMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.key}
                                            onClick={() => handleSort(option.key)}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
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
                                className="pl-10 pr-4 py-2 border rounded-lg w-full"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2 text-left">
                                        <button
                                            onClick={() => handleSort('operator')}
                                            className="flex items-center gap-1"
                                        >
                                            Operator
                                            {sortConfig.key === 'operator' && (
                                                sortConfig.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="p-2 text-left">
                                        <button
                                            onClick={() => handleSort('status')}
                                            className="flex items-center gap-1"
                                        >
                                            Status
                                            {sortConfig.key === 'status' && (
                                                sortConfig.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="p-2 text-left">
                                        <button
                                            onClick={() => handleSort('uptime')}
                                            className="flex items-center gap-1"
                                        >
                                            Uptime
                                            {sortConfig.key === 'uptime' && (
                                                sortConfig.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="p-2 text-left">
                                        <button
                                            onClick={() => handleSort('fee')}
                                            className="flex items-center gap-1"
                                        >
                                            Fee
                                            {sortConfig.key === 'fee' && (
                                                sortConfig.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                                            )}
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredNodes.map((node, index) => (
                                    <tr key={node.operator} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                        <td className="p-2">
                                            <span className="font-mono text-sm">{node.operator}</span>
                                        </td>
                                        <td className="p-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${node.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {node.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            <div className="flex items-center">
                                                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-blue-600 rounded-full h-2"
                                                        style={{ width: `${node.uptime}%` }}
                                                    ></div>
                                                </div>
                                                <span>{node.uptime.toFixed(2)}%</span>
                                            </div>
                                        </td>
                                        <td className="p-2">{node.fee}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredNodes.map((node) => (
                            <NodeCard key={node.operator} node={node} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NodeDashboard;