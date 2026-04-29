import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { adminAPI, servicesAPI } from '../utils/api';
import {
  Users, Ticket, Clock, CheckCircle2, TrendingUp, PlayCircle,
  XCircle, SkipForward, Plus, Edit, Trash2, BarChart3,
  AlertCircle, RefreshCw, ChevronDown, X, Save, Radio
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AdminDashboard = () => {
  const { socket } = useSocket() || {};
  const [analytics, setAnalytics] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [queueTokens, setQueueTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Service form state
  const [serviceForm, setServiceForm] = useState({
    name: '', description: '', category: 'other', icon: '🏢',
    estimatedTimePerToken: 10, maxTokensPerDay: 100,
    operatingHours: { start: '09:00', end: '17:00' }, location: ''
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [analyticsRes, servicesRes] = await Promise.all([
        adminAPI.getAnalytics().catch(() => ({ data: null })),
        servicesAPI.getAll().catch(() => ({ data: [] }))
      ]);
      setAnalytics(analyticsRes.data);
      setServices(servicesRes.data || []);
      if (servicesRes.data?.length > 0 && !selectedService) {
        setSelectedService(servicesRes.data[0]);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (!selectedService) return;
    const fetchQueue = async () => {
      try {
        const { data } = await adminAPI.getQueue(selectedService._id);
        setQueueTokens(data || []);
      } catch (err) { console.error(err); }
    };
    fetchQueue();

    if (socket) {
      socket.emit('join-service', selectedService._id);
      socket.on('queue-update', fetchQueue);
      return () => {
        socket.emit('leave-service', selectedService._id);
        socket.off('queue-update');
      };
    }
  }, [selectedService, socket]);

  const handleCallNext = async () => {
    if (!selectedService) return;
    setActionLoading('call');
    try {
      await adminAPI.callNext(selectedService._id);
      const { data } = await adminAPI.getQueue(selectedService._id);
      setQueueTokens(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No more tokens in queue');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading('');
    }
  };

  const handleComplete = async (tokenId) => {
    setActionLoading(tokenId);
    try {
      await adminAPI.complete(tokenId);
      const { data } = await adminAPI.getQueue(selectedService._id);
      setQueueTokens(data || []);
    } catch (err) { setError('Action failed'); }
    finally { setActionLoading(''); }
  };

  const handleNoShow = async (tokenId) => {
    setActionLoading(`ns-${tokenId}`);
    try {
      await adminAPI.noShow(tokenId);
      const { data } = await adminAPI.getQueue(selectedService._id);
      setQueueTokens(data || []);
    } catch (err) { setError('Action failed'); }
    finally { setActionLoading(''); }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await servicesAPI.create(serviceForm);
      setShowCreateModal(false);
      setServiceForm({ name: '', description: '', category: 'other', icon: '🏢', estimatedTimePerToken: 10, maxTokensPerDay: 100, operatingHours: { start: '09:00', end: '17:00' }, location: '' });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create service');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await servicesAPI.delete(id);
      fetchAll();
      if (selectedService?._id === id) setSelectedService(null);
    } catch (err) { setError('Failed to delete'); }
  };

  const waitingTokens = queueTokens.filter(t => t.status === 'waiting');
  const servingTokens = queueTokens.filter(t => t.status === 'serving');
  const completedTokens = queueTokens.filter(t => t.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-slide-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Admin <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-gray-500 mt-1">Manage queues and monitor system performance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="btn-secondary text-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm">
            <Plus size={16} /> New Service
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm animate-fade-in">
          <AlertCircle size={16} />{error}
          <button onClick={() => setError('')} className="ml-auto">✕</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-8 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'queue', label: 'Queue Manager', icon: Ticket },
          { id: 'services', label: 'Services', icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} />{tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="animate-fade-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Today's Tokens", value: analytics.today?.total || 0, icon: Ticket, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
              { label: 'Completed', value: analytics.today?.completed || 0, icon: CheckCircle2, color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
              { label: 'Waiting', value: analytics.today?.waiting || 0, icon: Clock, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
              { label: 'Avg Wait', value: `${analytics.today?.avgWaitTime || 0}m`, icon: TrendingUp, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
              { label: 'Total Users', value: analytics.overall?.totalUsers || 0, icon: Users, color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' },
            ].map((stat) => (
              <div key={stat.label} className="stat-card p-4">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          {analytics.weeklyData && (
            <div className="stat-card p-6 mb-8">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Weekly Token Activity</h3>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.weeklyData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#4f46e5" fill="url(#colorTotal)" strokeWidth={2} name="Total" />
                    <Area type="monotone" dataKey="completed" stroke="#06b6d4" fill="url(#colorCompleted)" strokeWidth={2} name="Completed" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Queue Manager Tab */}
      {activeTab === 'queue' && (
        <div className="animate-fade-in">
          {/* Service Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {services.map((svc) => (
              <button
                key={svc._id}
                onClick={() => setSelectedService(svc)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedService?._id === svc._id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <span>{svc.icon || '🏢'}</span>{svc.name}
                <span className="ml-1 px-1.5 py-0.5 rounded-md text-xs bg-white/20">
                  {svc.queueInfo?.waitingCount || 0}
                </span>
              </button>
            ))}
          </div>

          {selectedService ? (
            <>
              {/* Call Next Button */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleCallNext}
                  disabled={actionLoading === 'call'}
                  className="btn-primary text-base px-8 py-3 disabled:opacity-60"
                >
                  {actionLoading === 'call' ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <><SkipForward size={20} /> Call Next Token</>
                  )}
                </button>
              </div>

              {/* Currently Serving */}
              {servingTokens.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Radio size={16} className="text-blue-500 animate-pulse-slow" /> Now Serving
                  </h3>
                  {servingTokens.map((token) => (
                    <div key={token._id} className="stat-card p-5 border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <p className="text-3xl font-bold font-mono text-blue-600">{token.displayNumber}</p>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{token.user?.name || 'User'}</p>
                          <p className="text-xs text-gray-500">{token.user?.email} {token.user?.phone && `• ${token.user.phone}`}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleComplete(token._id)}
                          disabled={actionLoading === token._id}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-60"
                        >
                          <CheckCircle2 size={14} /> Complete
                        </button>
                        <button
                          onClick={() => handleNoShow(token._id)}
                          disabled={actionLoading === `ns-${token._id}`}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-1 disabled:opacity-60"
                        >
                          <XCircle size={14} /> No Show
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Waiting Queue */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-amber-500" /> Waiting Queue ({waitingTokens.length})
                </h3>
                {waitingTokens.length > 0 ? (
                  <div className="space-y-2">
                    {waitingTokens.map((token, idx) => (
                      <div key={token._id} className="stat-card p-4 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-sm font-bold text-amber-700">
                          {idx + 1}
                        </div>
                        <span className="font-mono font-bold text-primary-600">{token.displayNumber}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{token.user?.name || 'User'}</p>
                          <p className="text-xs text-gray-500">{token.user?.email}</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(token.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="stat-card p-8 text-center">
                    <CheckCircle2 size={32} className="mx-auto text-green-300 mb-2" />
                    <p className="text-gray-400 text-sm">Queue is empty</p>
                  </div>
                )}
              </div>

              {/* Completed today */}
              {completedTokens.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" /> Completed ({completedTokens.length})
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {completedTokens.map((token) => (
                      <div key={token._id} className="p-2 bg-green-50 dark:bg-green-900/10 rounded-xl text-center border border-green-200 dark:border-green-800">
                        <p className="font-mono text-sm font-bold text-green-700 dark:text-green-400">{token.displayNumber}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="stat-card p-12 text-center">
              <p className="text-gray-400">Select a service to manage its queue</p>
            </div>
          )}
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="animate-fade-in">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((svc) => (
              <div key={svc._id} className="stat-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{svc.icon || '🏢'}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleDeleteService(svc._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{svc.name}</h3>
                <p className="text-xs text-gray-500 capitalize mb-3">{svc.category?.replace('_', ' ')}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500">Time/Token</p>
                    <p className="font-bold text-gray-900 dark:text-white">{svc.estimatedTimePerToken}m</p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500">Max/Day</p>
                    <p className="font-bold text-gray-900 dark:text-white">{svc.maxTokensPerDay}</p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500">Waiting</p>
                    <p className="font-bold text-amber-600">{svc.queueInfo?.waitingCount || 0}</p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500">Today</p>
                    <p className="font-bold text-primary-600">{svc.queueInfo?.totalToday || 0}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Service Card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="stat-card p-8 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={24} className="text-primary-600" />
              </div>
              <p className="font-medium text-gray-500 group-hover:text-primary-600">Add New Service</p>
            </button>
          </div>
        </div>
      )}

      {/* Create Service Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Service</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Name *</label>
                <input type="text" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} className="input-field" placeholder="General Checkup" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="input-field resize-none" rows={2} placeholder="Service description..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })} className="input-field">
                    <option value="hospital">🏥 Hospital</option>
                    <option value="bank">🏦 Bank</option>
                    <option value="college">🎓 College</option>
                    <option value="service_center">🔧 Service Center</option>
                    <option value="government">🏛️ Government</option>
                    <option value="other">🏢 Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
                  <input type="text" value={serviceForm.icon} onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })} className="input-field text-center text-2xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min/Token</label>
                  <input type="number" value={serviceForm.estimatedTimePerToken} onChange={(e) => setServiceForm({ ...serviceForm, estimatedTimePerToken: parseInt(e.target.value) })} className="input-field" min={1} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Tokens/Day</label>
                  <input type="number" value={serviceForm.maxTokensPerDay} onChange={(e) => setServiceForm({ ...serviceForm, maxTokensPerDay: parseInt(e.target.value) })} className="input-field" min={1} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input type="text" value={serviceForm.location} onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })} className="input-field" placeholder="Building A, Floor 2" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1 justify-center">
                  <Save size={16} /> Create Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
