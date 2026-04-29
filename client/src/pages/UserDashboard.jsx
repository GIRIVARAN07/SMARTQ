import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { tokensAPI, servicesAPI } from '../utils/api';
import {
  Ticket, Clock, CheckCircle2, XCircle, ArrowRight, RefreshCw,
  TrendingUp, Calendar, AlertCircle
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { notifications } = useSocket() || {};
  const [activeTokens, setActiveTokens] = useState([]);
  const [recentTokens, setRecentTokens] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [activeRes, historyRes, servicesRes] = await Promise.all([
        tokensAPI.getMyTokens({ status: 'waiting', date: today }).catch(() => ({ data: [] })),
        tokensAPI.getHistory({ limit: 5 }).catch(() => ({ data: { tokens: [] } })),
        servicesAPI.getAll().catch(() => ({ data: [] }))
      ]);

      setActiveTokens(activeRes.data || []);
      setRecentTokens(historyRes.data?.tokens || historyRes.data || []);
      setServices(servicesRes.data || []);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      waiting: 'badge-waiting',
      serving: 'badge-serving',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled',
      no_show: 'badge-cancelled'
    };
    return colors[status] || 'badge-waiting';
  };

  const getStatusIcon = (status) => {
    if (status === 'waiting') return <Clock size={14} />;
    if (status === 'serving') return <TrendingUp size={14} />;
    if (status === 'completed') return <CheckCircle2 size={14} />;
    return <XCircle size={14} />;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's your queue activity overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="stat-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Ticket size={22} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeTokens.length}</p>
            <p className="text-xs text-gray-500">Active Tokens</p>
          </div>
        </div>

        <div className="stat-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <Clock size={22} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeTokens.length > 0 ? `${activeTokens[0]?.estimatedWaitTime || 0}m` : '--'}
            </p>
            <p className="text-xs text-gray-500">Est. Wait Time</p>
          </div>
        </div>

        <div className="stat-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 size={22} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {recentTokens.filter(t => t.status === 'completed').length}
            </p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
        </div>

        <div className="stat-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
            <Calendar size={22} className="text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{services.length}</p>
            <p className="text-xs text-gray-500">Available Services</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Tokens */}
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Tokens</h2>
            <button onClick={fetchData} className="text-sm text-primary-600 flex items-center gap-1 hover:text-primary-700">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {activeTokens.length > 0 ? (
            <div className="space-y-3">
              {activeTokens.map((token) => (
                <div key={token._id} className="stat-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{token.service?.icon || '🏢'}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-lg text-primary-600">{token.displayNumber}</span>
                          <span className={`badge ${getStatusColor(token.status)}`}>
                            {getStatusIcon(token.status)}
                            <span className="ml-1 capitalize">{token.status}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{token.service?.name || 'Service'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Est. Wait</p>
                      <p className="text-lg font-bold text-accent-600">{token.estimatedWaitTime || 0} min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="stat-card p-8 text-center">
              <Ticket size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 mb-4">No active tokens right now</p>
              <Link to="/book" className="btn-primary text-sm no-underline">
                Book a Token <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* Quick Book Section */}
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Book</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {services.slice(0, 4).map((svc) => (
                <Link
                  key={svc._id}
                  to={`/book?service=${svc._id}`}
                  className="stat-card p-4 flex items-center gap-3 hover:border-primary-300 dark:hover:border-primary-700 no-underline group"
                >
                  <span className="text-2xl">{svc.icon || '🏢'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{svc.name}</p>
                    <p className="text-xs text-gray-500">{svc.queueInfo?.waitingCount || 0} waiting • ~{svc.queueInfo?.estimatedWait || 0}m</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {/* Recent Activity */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
              <Link to="/history" className="text-sm text-primary-600 hover:text-primary-700 no-underline">View all</Link>
            </div>

            <div className="space-y-2">
              {recentTokens.slice(0, 5).map((token) => (
                <div key={token._id} className="stat-card p-3 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    token.status === 'completed' ? 'bg-green-500' :
                    token.status === 'cancelled' ? 'bg-red-500' :
                    token.status === 'waiting' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {token.displayNumber} - {token.service?.name || 'Service'}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(token.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`badge text-xs ${getStatusColor(token.status)}`}>{token.status}</span>
                </div>
              ))}

              {recentTokens.length === 0 && (
                <div className="stat-card p-6 text-center">
                  <p className="text-sm text-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Notifications</h2>
            <div className="space-y-2">
              {notifications?.slice(0, 3).map((n) => (
                <div key={n.id} className="stat-card p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                </div>
              ))}
              {(!notifications || notifications.length === 0) && (
                <div className="stat-card p-6 text-center">
                  <p className="text-sm text-gray-400">No new notifications</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
