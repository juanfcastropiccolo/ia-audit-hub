
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Client } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { SkeletonTable } from '@/components/common/SkeletonLoader';
import { Search } from 'lucide-react';

interface ClientsTableProps {
  clients: Client[];
  loading: boolean;
}

export function ClientsTable({ clients, loading }: ClientsTableProps) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>(clients);
  
  // Update filtered clients when search query or clients list changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = clients.filter(
      client => 
        client.name.toLowerCase().includes(query) ||
        client.company.toLowerCase().includes(query)
    );
    
    setFilteredClients(filtered);
  }, [searchQuery, clients]);
  
  // Format relative time based on current language
  const formatRelativeTime = (timestamp: string) => {
    const locale = i18n.language === 'es' ? es : undefined;
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true,
      locale 
    });
  };
  
  if (loading) {
    return <SkeletonTable rows={4} columns={5} />;
  }
  
  // Empty state
  if (clients.length === 0) {
    return (
      <div className="card-container p-8 text-center">
        <p className="text-muted-foreground">
          {t('admin.noClients')}
        </p>
      </div>
    );
  }
  
  return (
    <div className="card-container">
      {/* Search bar */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder={t('admin.searchClients')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 p-2 w-full border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-primary/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('admin.clientName')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('admin.company')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('admin.lastActive')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('admin.status')}
              </th>
              <th className="px-6 py-3 relative">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-transparent divide-y divide-border">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-primary/5">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">{client.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {client.company}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {formatRelativeTime(client.lastActive)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    client.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {t(`admin.${client.status}`)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button className="text-accent hover:text-accent/80">
                    {t('admin.view')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* No results from search */}
        {searchQuery && filteredClients.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">
              {t('admin.noClients')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientsTable;
