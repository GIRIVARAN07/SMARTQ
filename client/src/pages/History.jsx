import { useState, useEffect } from 'react';
import { tokensAPI } from '../utils/api';
import { History as HistoryIcon, Clock, CheckCircle2, XCircle, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const History = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await tokensAPI.getHistory({ page, limit: 15 });
      setTokens(data.tokens || data || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const filteredTokens = filter === 'all' ? tokens : tokens.filter(t => t.status === filter);

  const getStatusBadge = (status) => {
    const styles = {
      waiting: { class: 'badge-waiting', icon: <Clock size={12} /> },
      serving: { class: 'badge-serving', icon: <Clock size={12} /> },
      completed: { class: 'badge-completed', icon: <CheckCircle2 size={12} /> },
      cancelled: { class: 'badge-cancelled', icon: <XCircle size={12} /> },
      no_show: { class: 'badge-cancelled', icon: <XCircle size={12} /> },
    };
    const s = styles[status] || styles.waiting;
    return (
      <span className={`badge ${s.class} flex items-center gap-1`}>
        {s.icon}
        <span className="capitalize">{status?.replace('_', ' ')}</span>
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Booking <span className="text-gradient">History</span>
        </h1>
        <p className="text-gray-500 mt-1">View all your past and current bookings</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {['all', 'waiting', 'serving', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all capitalize ${
              filter === f
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="stat-card p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTokens.length > 0 ? (
        <>
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            {filteredTokens.map((token, i) => (
              <div key={token._id} className="stat-card p-5 flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">{token.service?.icon || '🏢'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-primary-600">{token.displayNumber}</span>
                    {getStatusBadge(token.status)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{token.service?.name || 'Service'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(token.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(token.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-2 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-secondary py-2 disabled:opacity-40"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="stat-card p-12 text-center animate-fade-in">
          <HistoryIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-2">No bookings found</p>
          <p className="text-sm text-gray-400">Your booking history will appear here</p>
        </div>
      )}
    </div>
  );
};

export default History;
