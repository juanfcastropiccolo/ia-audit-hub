import { NavLink } from 'react-router-dom';

function AdminSidebar() {
  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-deepIndigo text-gray-100 flex flex-col">
      <div className="px-4 py-5 font-bold text-xl border-b border-indigo-800">
        Auditoría<span className="text-purpleTint">IA</span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        <NavLink 
          to="/admin/clients" 
          className={({ isActive }) => 
            `flex items-center p-2 rounded-lg hover:bg-indigo-700 ${isActive ? "bg-indigo-700" : ""}`
          }
        >
          <svg 
            className="w-5 h-5 mr-3" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          Dashboard
        </NavLink>
        <NavLink 
          to="/admin/clients" 
          className={({ isActive }) => 
            `flex items-center p-2 rounded-lg hover:bg-indigo-700 ${isActive ? "bg-indigo-700" : ""}`
          }
        >
          <svg 
            className="w-5 h-5 mr-3" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Clientes
        </NavLink>
        <NavLink 
          to="/admin/logs" 
          className={({ isActive }) => 
            `flex items-center p-2 rounded-lg hover:bg-indigo-700 ${isActive ? "bg-indigo-700" : ""}`
          }
        >
          <svg 
            className="w-5 h-5 mr-3" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Logs
        </NavLink>
      </nav>
      <div className="px-4 py-3 border-t border-indigo-800 text-sm">
        <span className="text-gray-300">© 2025 IA Audit Firm</span>
      </div>
    </div>
  );
}

export default AdminSidebar; 