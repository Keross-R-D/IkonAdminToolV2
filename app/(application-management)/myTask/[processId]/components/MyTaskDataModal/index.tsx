'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Copy, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Download,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff
} from 'lucide-react';

interface JsonNodeProps {
  data: any;
  path: string;
  searchTerm: string;
  expandedNodes: Set<string>;
  onToggleNode: (path: string) => void;
  level: number;
  fontSize: number;
}

const JsonNode: React.FC<JsonNodeProps> = ({ 
  data, 
  path, 
  searchTerm, 
  expandedNodes, 
  onToggleNode, 
  level,
  fontSize 
}) => {
  const isExpanded = expandedNodes.has(path);
  const indent = level * 20;

  const getValueType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  const getTypeColor = (type: string): string => {
    const colors = {
      string: 'text-emerald-600 dark:text-emerald-400',
      number: 'text-blue-600 dark:text-blue-400',
      boolean: 'text-purple-600 dark:text-purple-400',
      null: 'text-muted-foreground',
      object: 'text-orange-600 dark:text-orange-400',
      array: 'text-red-600 dark:text-red-400',
    };
    return colors[type as keyof typeof colors] || 'text-foreground';
  };

  const highlightSearchTerm = (text: string, term: string): React.ReactNode => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-900 font-semibold text-foreground">{part}</span>
      ) : part
    );
  };

  const copyToClipboard = async (value: any) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (Array.isArray(data)) {
    return (
      <div style={{ marginLeft: `${indent}px` }}>
        <div className="flex items-center gap-2 py-1 group hover:bg-accent rounded px-2">
          <button
            onClick={() => onToggleNode(path)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            {isExpanded ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
          </button>
          <span className="font-medium text-foreground" style={{ fontSize: `${fontSize}px` }}>
            Array({data.length})
          </span>
          <button
            onClick={() => copyToClipboard(data)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all"
            title="Copy array"
          >
            <Copy size={12} className="text-muted-foreground hover:text-foreground" />
          </button>
        </div>
        {isExpanded && (
          <div className="border-l-2 border-border ml-2">
            {data.map((item, index) => (
              <JsonNode
                key={index}
                data={item}
                path={`${path}[${index}]`}
                searchTerm={searchTerm}
                expandedNodes={expandedNodes}
                onToggleNode={onToggleNode}
                level={level + 1}
                fontSize={fontSize}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (data && typeof data === 'object') {
    const entries = Object.entries(data);
    return (
      <div style={{ marginLeft: `${indent}px` }}>
        <div className="flex items-center gap-2 py-1 group hover:bg-accent rounded px-2">
          <button
            onClick={() => onToggleNode(path)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            {isExpanded ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
          </button>
          <span className="font-medium text-foreground" style={{ fontSize: `${fontSize}px` }}>
            Object({entries.length})
          </span>
          <button
            onClick={() => copyToClipboard(data)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all"
            title="Copy object"
          >
            <Copy size={12} className="text-muted-foreground hover:text-foreground" />
          </button>
        </div>
        {isExpanded && (
          <div className="border-l-2 border-border ml-2">
            {entries.map(([key, value]) => (
              <div key={key} className="py-1">
                <div className="flex items-center gap-2 group hover:bg-accent rounded px-2">
                  <span className="font-medium text-foreground" style={{ fontSize: `${fontSize}px` }}>
                    {highlightSearchTerm(key, searchTerm)}:
                  </span>
                  {(typeof value === 'object' && value !== null) ? (
                    <JsonNode
                      data={value}
                      path={`${path}.${key}`}
                      searchTerm={searchTerm}
                      expandedNodes={expandedNodes}
                      onToggleNode={onToggleNode}
                      level={0}
                      fontSize={fontSize}
                    />
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <span className={`${getTypeColor(getValueType(value))}`} style={{ fontSize: `${fontSize}px` }}>
                        {typeof value === 'string' ? `"${highlightSearchTerm(value, searchTerm)}"` : String(value)}
                      </span>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        {getValueType(value)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(value)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all"
                        title="Copy value"
                      >
                        <Copy size={12} className="text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginLeft: `${indent}px` }} className="flex items-center gap-2 py-1 group hover:bg-accent rounded px-2">
      <span className={`${getTypeColor(getValueType(data))}`} style={{ fontSize: `${fontSize}px` }}>
        {typeof data === 'string' ? `"${highlightSearchTerm(data, searchTerm)}"` : String(data)}
      </span>
      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
        {getValueType(data)}
      </span>
      <button
        onClick={() => copyToClipboard(data)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all"
        title="Copy value"
      >
        <Copy size={12} className="text-muted-foreground hover:text-foreground" />
      </button>
    </div>
  );
};

interface JsonVisualizerModalProps {
  isOpen: boolean;
  setModal: (open: boolean) => void;
  instanceEntryData: any;
  title?: string;
}

export default function JsonVisualizerModal({ 
  isOpen, 
  setModal, 
  instanceEntryData, 
  title = "Instance Data" 
}: JsonVisualizerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [viewMode, setViewMode] = useState<'tree' | 'raw'>('tree');
  const [fontSize, setFontSize] = useState(14);

  const jsonString = useMemo(() => 
    JSON.stringify(instanceEntryData, null, 2), 
    [instanceEntryData]
  );

  const toggleNode = useCallback((path: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const getAllPaths = (obj: any, currentPath = 'root'): string[] => {
      const paths = [currentPath];
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          paths.push(...getAllPaths(item, `${currentPath}[${index}]`));
        });
      } else if (obj && typeof obj === 'object') {
        Object.entries(obj).forEach(([key, value]) => {
          paths.push(...getAllPaths(value, `${currentPath}.${key}`));
        });
      }
      return paths;
    };
    setExpandedNodes(new Set(getAllPaths(instanceEntryData)));
  }, [instanceEntryData]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set(['root']));
  }, []);

  const copyAllToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const adjustFontSize = (delta: number) => {
    setFontSize(prev => Math.max(10, Math.min(24, prev + delta)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setModal}>
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] w-full h-full flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'tree' ? 'raw' : 'tree')}
              >
                {viewMode === 'tree' ? <Eye size={16} /> : <EyeOff size={16} />}
                {viewMode === 'tree' ? 'Raw' : 'Tree'}
              </Button>
              <Button variant="outline" size="sm" onClick={copyAllToClipboard}>
                <Copy size={16} />
                Copy All
              </Button>
              <Button variant="outline" size="sm" onClick={downloadJson}>
                <Download size={16} />
                Download
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {viewMode === 'tree' && (
          <div className="flex items-center gap-2 py-2 border-b border-border flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search in JSON..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => adjustFontSize(-1)}>
                <ZoomOut size={16} />
              </Button>
              <span className="text-sm px-2 text-muted-foreground">{fontSize}px</span>
              <Button variant="outline" size="sm" onClick={() => adjustFontSize(1)}>
                <ZoomIn size={16} />
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-muted/30 rounded-lg p-4">
          {viewMode === 'tree' ? (
            <div className="font-mono text-sm">
              <JsonNode
                data={instanceEntryData}
                path="root"
                searchTerm={searchTerm}
                expandedNodes={expandedNodes}
                onToggleNode={toggleNode}
                level={0}
                fontSize={fontSize}
              />
            </div>
          ) : (
            <pre 
              className="font-mono text-sm whitespace-pre-wrap break-words text-foreground"
              style={{ fontSize: `${fontSize}px` }}
            >
              {jsonString}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}