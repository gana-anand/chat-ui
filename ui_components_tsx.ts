// ui/DynamicChartComponent.tsx
import React, { useState } from 'react';
import { useArtifact } from '../utils/use-artifact';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Download, ChevronDown, BarChart3 } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

export default function DynamicChartComponent({ 
  data, 
  title, 
  description,
  chartType = 'bar',
  availableTypes = ['bar']
}) {
  const [Artifact, { open, setOpen }] = useArtifact();
  const [currentType, setCurrentType] = useState(chartType);
  const [showDropdown, setShowDropdown] = useState(false);

  const exportChart = (format: 'png' | 'svg' | 'pdf') => {
    // Chart export logic would go here
    console.log(`Exporting chart as ${format}`);
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (currentType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#0088FE" />
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#0088FE" strokeWidth={2} />
          </LineChart>
        );
      
      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      
      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid />
            <XAxis dataKey="x" />
            <YAxis dataKey="y" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Data" data={data} fill="#0088FE" />
          </ScatterChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#0088FE" fill="#0088FE" />
          </AreaChart>
        );
      
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <>
      <div 
        onClick={() => setOpen(!open)}
        className="cursor-pointer rounded-lg border p-3 hover:bg-gray-50 bg-gradient-to-r from-blue-50 to-purple-50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <div className="flex items-center text-blue-600 text-sm font-medium">
            <BarChart3 className="w-4 h-4 mr-1" />
            {currentType.charAt(0).toUpperCase() + currentType.slice(1)} Chart →
          </div>
        </div>
      </div>

      <Artifact title={title}>
        <div className="p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
            <div className="flex items-center space-x-2">
              {/* Chart Type Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </Artifact>
    </>
  );
}

// ===================================================================

// ui/MermaidDiagramComponent.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useArtifact } from '../utils/use-artifact';
import { Download, GitBranch, Copy } from 'lucide-react';

declare global {
  interface Window {
    mermaid: any;
  }
}

export default function MermaidDiagramComponent({ 
  diagram, 
  title, 
  description,
  diagramType = 'graph'
}) {
  const [Artifact, { open, setOpen }] = useArtifact();
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Mermaid if not already loaded
    if (!window.mermaid) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
      script.onload = () => {
        window.mermaid.initialize({ 
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit'
        });
        setIsLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && mermaidRef.current && diagram) {
      renderDiagram();
    }
  }, [isLoaded, diagram]);

  const renderDiagram = async () => {
    if (!mermaidRef.current || !window.mermaid) return;

    try {
      setError(null);
      mermaidRef.current.innerHTML = '';
      
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      const { svg } = await window.mermaid.render(id, diagram);
      mermaidRef.current.innerHTML = svg;
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      setError('Failed to render diagram. Please check the syntax.');
      mermaidRef.current.innerHTML = `<div class="text-red-500 p-4 border border-red-200 rounded">
        Error rendering diagram: ${err.message}
      </div>`;
    }
  };

  const exportDiagram = (format: 'svg' | 'png' | 'mermaid') => {
    if (format === 'mermaid') {
      // Export raw mermaid code
      const blob = new Blob([diagram], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.mmd`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'svg' && mermaidRef.current) {
      // Export SVG
      const svg = mermaidRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }
    // PNG export would require additional canvas conversion
  };

  const copyDiagramCode = () => {
    navigator.clipboard.writeText(diagram);
  };

  return (
    <>
      <div 
        onClick={() => setOpen(!open)}
        className="cursor-pointer rounded-lg border p-3 hover:bg-gray-50 bg-gradient-to-r from-purple-50 to-pink-50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <div className="flex items-center text-purple-600 text-sm font-medium">
            <GitBranch className="w-4 h-4 mr-1" />
            {diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} →
          </div>
        </div>
      </div>

      <Artifact title={title}>
        <div className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={copyDiagramCode}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </button>
              <button
                onClick={() => exportDiagram('svg')}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                SVG
              </button>
              <button
                onClick={() => exportDiagram('mermaid')}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Mermaid
              </button>
            </div>
          </div>

          {/* Diagram Display */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[300px] flex items-center justify-center">
            {!isLoaded ? (
              <div className="text-gray-500">Loading Mermaid...</div>
            ) : (
              <div ref={mermaidRef} className="w-full flex justify-center" />
            )}
          </div>

          {/* Raw Code Display (Collapsible) */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              View Raw Mermaid Code
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded-md">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                {diagram}
              </pre>
            </div>
          </details>
        </div>
      </Artifact>
    </>
  );
}

// ===================================================================

// ui/index.tsx (Main export file)
import DynamicChartComponent from './DynamicChartComponent';
import DataTableComponent from './DataTableComponent';
import MermaidDiagramComponent from './MermaidDiagramComponent';

export default {
  dynamicChart: DynamicChartComponent,
  dataTable: DataTableComponent,
  mermaidDiagram: MermaidDiagramComponent,
};
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {currentType.charAt(0).toUpperCase() + currentType.slice(1)}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 z-10 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg">
                    {availableTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setCurrentType(type);
                          setShowDropdown(false);
                        }}
                        className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                          currentType === type ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Export Button */}
              <button
                onClick={exportData}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer>
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      </Artifact>
    </>
  );
}

// ===================================================================

// ui/DataTableComponent.tsx
import React, { useState, useMemo } from 'react';
import { useArtifact } from '../utils/use-artifact';
import { Download, Search, ChevronUp, ChevronDown, Table } from 'lucide-react';

export default function DataTableComponent({ 
  data, 
  title, 
  description,
  columns = []
}) {
  const [Artifact, { open, setOpen }] = useArtifact();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tableColumns = columns.length > 0 ? columns : (data.length > 0 ? Object.keys(data[0]) : []);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let filtered = data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column) => {
    setSortConfig(prev => ({
      key: column,
      direction: prev.key === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportData = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const csvContent = "data:text/csv;charset=utf-8," 
        + tableColumns.join(",") + "\n"
        + processedData.map(row => 
            tableColumns.map(col => JSON.stringify(row[col] || '')).join(",")
          ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${title}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'json') {
      const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify(processedData, null, 2)
      );
      const link = document.createElement("a");
      link.setAttribute("href", jsonContent);
      link.setAttribute("download", `${title}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <div 
        onClick={() => setOpen(!open)}
        className="cursor-pointer rounded-lg border p-3 hover:bg-gray-50 bg-gradient-to-r from-green-50 to-blue-50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <div className="flex items-center text-green-600 text-sm font-medium">
            <Table className="w-4 h-4 mr-1" />
            {data.length} rows →
          </div>
        </div>
      </div>

      <Artifact title={title}>
        <div className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportData('csv')}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </button>
              <button
                onClick={() => exportData('json')}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                JSON
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {tableColumns.map((column) => (
                    <th
                      key={column}
                      onClick={() => handleSort(column)}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        {column}
                        {sortConfig.key === column && (
                          sortConfig.direction === 'asc' 
                            ? <ChevronUp className="w-4 h-4 ml-1" />
                            : <ChevronDown className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {tableColumns.map((column) => (
                      <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {typeof row[column] === 'number' 
                          ? row[column].toLocaleString() 
                          : String(row[column] || '-')
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, processedData.length)} of {processedData.length} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button