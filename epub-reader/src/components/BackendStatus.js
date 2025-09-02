import React, { useState, useEffect } from 'react';
import { checkBackendStatus } from '../utils/indexedDB';

const BackendStatus = () => {
  const [status, setStatus] = useState({ status: 'checking' });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const result = await checkBackendStatus();
      setStatus(result);
    };

    // Check immediately
    checkStatus();

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status.status) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'connected': return '🟢';
      case 'disconnected': return '🔴';
      default: return '🟡';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'connected': return 'Backend Online';
      case 'disconnected': return 'Backend Offline';
      default: return 'Checking...';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${getStatusColor()}`}
        title="Click for backend status details"
      >
        <span className="text-xs">{getStatusIcon()}</span>
        <span className="text-xs font-medium">{getStatusText()}</span>
      </button>

      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Backend Status
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={getStatusColor()}>{status.status}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">URL:</span>
                <span className="text-gray-900 dark:text-gray-100 font-mono break-all">
                  {status.url}
                </span>
              </div>

              {status.status === 'connected' && status.data && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Service:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {status.data.service}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Environment:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {status.data.environment}
                    </span>
                  </div>

                  {status.data.uptime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {Math.floor(status.data.uptime / 3600)}h {Math.floor((status.data.uptime % 3600) / 60)}m
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Check:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {new Date(status.data.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </>
              )}

              {status.status === 'disconnected' && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <span className="text-red-600 dark:text-red-400 text-xs">
                    {status.error}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {status.status === 'connected' ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ Search and download features available
                  </span>
                ) : (
                  <span className="text-orange-600 dark:text-orange-400">
                    ⚠ Limited to local library features only
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendStatus;
