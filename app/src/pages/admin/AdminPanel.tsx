import React, { useState, useEffect } from 'react';

// =============================================
// TIPOS
// =============================================
interface Tenant {
  id: string;
  code: string;
  name: string;
  email: string;
  document?: string;
  phone?: string;
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  plan_id: string;
  plan_name?: string;
  plan_price?: number;
  max_users?: number;
  trial_ends_at?: string;
  users_count: number;
  modules_enabled: number;
  features_enabled: number;
  created_at: string;
}

interface TenantUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: number;
  last_login_at?: string;
  created_at: string;
}

interface Plan {
  id: string;
  code: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_yearly?: number;
  max_users: number;
  max_companies: number;
  max_storage_gb: number;
  is_active: number;
  tenants_count: number;
  features_count: number;
}

interface Module {
  code: string;
  name: string;
  description?: string;
  category: string;
  is_core: number;
  is_enabled?: number;
  total_features?: number;
  enabled_features?: number;
}

interface Metrics {
  total_tenants: number;
  active_tenants: number;
  trial_tenants: number;
  suspended_tenants: number;
  cancelled_tenants: number;
  total_users: number;
  mrr: number;
  total_modules: number;
  recent_tenants: Tenant[];
}

// =============================================
// ÍCONES SVG (Estilo do ERP - vermelho)
// =============================================
const iconClass = "w-5 h-5 text-red-600";

const Icons = {
  dashboard: <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  users: <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  plans: <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  modules: <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  logout: <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  chevronDown: <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  chevronRight: <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  back: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  search: <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  plus: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  edit: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  trash: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  check: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  x: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
};

// =============================================
// API SERVICE
// =============================================
const API_BASE = 'https://api.trailsystem.com.br/v1/platform';

const getToken = () => localStorage.getItem('token');

const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
      throw new Error('Não autenticado');
    }
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    const data = await res.json();
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Sessão expirada');
    }
    if (!res.ok) throw new Error(data.error || data.message || 'Erro na requisição');
    return data;
  },

  getMetrics: () => api.request('/metrics'),
  getTenants: () => api.request('/tenants'),
  getTenant: (id: string) => api.request(`/tenants/${id}`),
  createTenant: (data: any) => api.request('/tenants', { method: 'POST', body: JSON.stringify(data) }),
  updateTenant: (id: string, data: any) => api.request(`/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTenant: (id: string) => api.request(`/tenants/${id}`, { method: 'DELETE' }),
  reactivateTenant: (id: string) => api.request(`/tenants/${id}/reactivate`, { method: 'POST' }),
  getTenantUsers: (id: string) => api.request(`/tenants/${id}/users`),
  createTenantUser: (id: string, data: any) => api.request(`/tenants/${id}/users`, { method: 'POST', body: JSON.stringify(data) }),
  updateTenantUser: (id: string, uId: string, data: any) => api.request(`/tenants/${id}/users/${uId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTenantUser: (id: string, uId: string) => api.request(`/tenants/${id}/users/${uId}`, { method: 'DELETE' }),
  getTenantModules: (id: string) => api.request(`/tenants/${id}/modules`),
  updateTenantModule: (id: string, code: string, data: any) => api.request(`/tenants/${id}/modules/${code}`, { method: 'PUT', body: JSON.stringify(data) }),
  getPlans: () => api.request('/plans'),
  getModules: () => api.request('/modules'),
};

// =============================================
// COMPONENTES UTILITÁRIOS
// =============================================
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    trial: 'bg-blue-100 text-blue-700',
    suspended: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = {
    active: 'Ativo',
    trial: 'Trial',
    suspended: 'Suspenso',
    cancelled: 'Cancelado',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {labels[status] || status}
    </span>
  );
};

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = 'primary', className = '' }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'ghost'; 
  className?: string;
}) => {
  const variants = {
    primary: 'bg-red-500 text-white hover:bg-red-600',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    ghost: 'text-gray-600 hover:bg-gray-100',
  };
  return (
    <button 
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const formatMoney = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');

// =============================================
// SIDEBAR (Design igual ao ERP)
// =============================================
interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onLogout: () => void;
}

const Sidebar = ({ currentPage, setCurrentPage, onLogout }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
    { id: 'tenants', label: 'Clientes', icon: Icons.users },
    { id: 'plans', label: 'Planos', icon: Icons.plans },
    { id: 'modules', label: 'Módulos', icon: Icons.modules },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">TS</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">TrailSystem</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {Icons.logout}
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};

// =============================================
// PÁGINA: DASHBOARD
// =============================================
const DashboardPage = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.getMetrics();
      setMetrics(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>;
  if (!metrics) return null;

  const stats = [
    { label: 'Total Clientes', value: metrics.total_tenants, color: 'bg-blue-500' },
    { label: 'Clientes Ativos', value: metrics.active_tenants, color: 'bg-green-500' },
    { label: 'Em Trial', value: metrics.trial_tenants, color: 'bg-yellow-500' },
    { label: 'MRR', value: formatMoney(metrics.mrr), color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral da plataforma TrailSystem</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4">
            <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
              <span className="text-white text-xl">📊</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Últimos Clientes */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimos Clientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Plano</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recent_tenants?.slice(0, 5).map((tenant) => (
                <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{tenant.name}</p>
                    <p className="text-sm text-gray-500">{tenant.email}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{tenant.plan_id?.replace('plan_', '')}</td>
                  <td className="py-3 px-4"><StatusBadge status={tenant.status} /></td>
                  <td className="py-3 px-4 text-gray-500">{formatDate(tenant.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// =============================================
// PÁGINA: CLIENTES (TENANTS)
// =============================================
interface TenantsPageProps {
  onSelectTenant: (id: string) => void;
}

const TenantsPage = ({ onSelectTenant }: TenantsPageProps) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const res = await api.getTenants();
      setTenants(res.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500">Gerencie os clientes da plataforma</p>
        </div>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">{Icons.search}</span>
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Tabela */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cliente</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Plano</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Usuários</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Valor</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tenant) => (
              <tr key={tenant.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <p className="font-medium text-gray-900">{tenant.name}</p>
                  <p className="text-sm text-gray-500">{tenant.email}</p>
                </td>
                <td className="py-3 px-4 text-gray-700">{tenant.plan_name || tenant.plan_id?.replace('plan_', '')}</td>
                <td className="py-3 px-4"><StatusBadge status={tenant.status} /></td>
                <td className="py-3 px-4 text-gray-700">{tenant.users_count}/{tenant.max_users || '∞'}</td>
                <td className="py-3 px-4 text-gray-700">{formatMoney(tenant.plan_price || 0)}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onSelectTenant(tenant.id)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Ver detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// =============================================
// PÁGINA: DETALHES DO CLIENTE
// =============================================
interface TenantDetailPageProps {
  tenantId: string;
  onBack: () => void;
}

const TenantDetailPage = ({ tenantId, onBack }: TenantDetailPageProps) => {
  const [tenant, setTenant] = useState<any>(null);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    loadTenantData();
  }, [tenantId]);

  const loadTenantData = async () => {
    try {
      setLoading(true);
      const [tenantRes, usersRes, modulesRes] = await Promise.all([
        api.getTenant(tenantId),
        api.getTenantUsers(tenantId),
        api.getTenantModules(tenantId),
      ]);
      setTenant(tenantRes.data);
      setUsers(usersRes.data || []);
      setModules(modulesRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (code: string, enabled: boolean) => {
    try {
      await api.updateTenantModule(tenantId, code, { is_enabled: enabled ? 1 : 0 });
      setModules(modules.map(m => m.code === code ? { ...m, is_enabled: enabled ? 1 : 0 } : m));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!tenant) return <div className="text-red-600">Cliente não encontrado</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">{Icons.back}</button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
          <p className="text-gray-500">{tenant.email}</p>
        </div>
        <StatusBadge status={tenant.status} />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {['info', 'users', 'modules'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'info' ? 'Informações' : tab === 'users' ? 'Usuários' : 'Módulos'}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <Card>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Código</p>
              <p className="font-medium">{tenant.code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">CNPJ/CPF</p>
              <p className="font-medium">{tenant.document || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Plano</p>
              <p className="font-medium">{tenant.plan_name || tenant.plan_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valor</p>
              <p className="font-medium">{formatMoney(tenant.plan_price || 0)}/mês</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Trial até</p>
              <p className="font-medium">{tenant.trial_ends_at ? formatDate(tenant.trial_ends_at) : '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cadastrado em</p>
              <p className="font-medium">{formatDate(tenant.created_at)}</p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'users' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Usuários ({users.length}/{tenant.max_users || '∞'})</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm text-gray-500">Nome</th>
                <th className="text-left py-2 text-sm text-gray-500">Email</th>
                <th className="text-left py-2 text-sm text-gray-500">Perfil</th>
                <th className="text-left py-2 text-sm text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{user.name}</td>
                  <td className="py-2 text-gray-600">{user.email}</td>
                  <td className="py-2 text-gray-600">{user.role}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'modules' && (
        <div className="grid grid-cols-2 gap-4">
          {modules.map((mod) => (
            <Card key={mod.code} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{mod.name}</p>
                <p className="text-sm text-gray-500">{mod.total_features} features</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!mod.is_enabled}
                  onChange={(e) => toggleModule(mod.code, e.target.checked)}
                  disabled={!!mod.is_core}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer ${mod.is_core ? 'bg-gray-300' : 'bg-gray-200'} peer-checked:bg-red-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full`}></div>
              </label>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// =============================================
// PÁGINA: PLANOS
// =============================================

// =============================================
// PLANS PAGE
// =============================================
const PlansPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPlans()
      .then(res => setPlans(res.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;
  if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planos</h1>
          <p className="text-gray-500">Gerencie os planos da plataforma</p>
        </div>
        <Button>{Icons.plus} Novo Plano</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.code === 'professional' ? 'border-red-200 ring-2 ring-red-500/20' : ''}`}>
            {plan.code === 'professional' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full">Popular</span>
              </div>
            )}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </div>
            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-gray-900">R$ {plan.price_monthly}</span>
              <span className="text-gray-500">/mês</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">{Icons.check}</span>
                {plan.max_users} usuários
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">{Icons.check}</span>
                {plan.max_companies} empresas
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">{Icons.check}</span>
                {plan.max_storage_gb} GB storage
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">{Icons.check}</span>
                {plan.features_count} features
              </li>
            </ul>
            <div className="text-center">
              <p className="text-sm text-gray-500">{plan.tenants_count} clientes ativos</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// =============================================
// MODULES PAGE
// =============================================
const ModulesPage = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getModules()
      .then(res => setModules(res.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;
  if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>;

  // Agrupar por categoria
  const grouped = modules.reduce((acc: any, mod) => {
    const cat = mod.category || 'Outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(mod);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Módulos</h1>
        <p className="text-gray-500">{modules.length} módulos disponíveis</p>
      </div>

      {Object.entries(grouped).map(([category, mods]: [string, any]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{category}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {mods.map((mod: Module) => (
              <Card key={mod.code}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{mod.name}</h4>
                    <p className="text-sm text-gray-500">{mod.code}</p>
                  </div>
                  {mod.is_core ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">Core</span>
                  ) : null}
                </div>
                {mod.description && (
                  <p className="text-sm text-gray-500 mt-2">{mod.description}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// =============================================
// MAIN COMPONENT
// =============================================
export default function AdminPanel() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  // Verificar autenticação
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleSelectTenant = (id: string) => {
    setSelectedTenantId(id);
    setCurrentPage('tenant-detail');
  };

  const handleBackToTenants = () => {
    setSelectedTenantId(null);
    setCurrentPage('tenants');
  };

  const renderPage = () => {
    if (currentPage === 'tenant-detail' && selectedTenantId) {
      return <TenantDetailPage tenantId={selectedTenantId} onBack={handleBackToTenants} />;
    }
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'tenants': return <TenantsPage onSelectTenant={handleSelectTenant} />;
      case 'plans': return <PlansPage />;
      case 'modules': return <ModulesPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">{renderPage()}</main>
    </div>
  );
}
