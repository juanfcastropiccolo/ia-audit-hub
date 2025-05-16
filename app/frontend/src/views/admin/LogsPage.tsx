
import React from 'react';
import { useTranslation } from 'react-i18next';

const LogsPage: React.FC = () => {
  const { t } = useTranslation();

  // Mock logs data
  const logs = [
    { id: 1, timestamp: '2025-05-15 14:30:22', client: 'Empresa A', event: 'File upload', details: 'financial_report_2025.xlsx' },
    { id: 2, timestamp: '2025-05-15 14:29:45', client: 'Empresa A', event: 'Assistant response', details: 'Responded to query about financial discrepancies' },
    { id: 3, timestamp: '2025-05-15 14:28:10', client: 'Empresa A', event: 'User query', details: 'Asked about potential financial discrepancies' },
    { id: 4, timestamp: '2025-05-15 13:45:22', client: 'Empresa B', event: 'Session started', details: 'New audit session initiated' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-primary dark:text-white">{t('logs')}</h1>
      
      {/* Search/filter inputs */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder={t('search')}
          className="w-full md:w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <input 
          type="date" 
          className="w-full md:w-1/4 p-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      
      {/* Logs table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Fecha/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Evento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Detalles
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {log.timestamp}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {log.client}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {log.event}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogsPage;
