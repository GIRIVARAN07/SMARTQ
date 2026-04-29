import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { servicesAPI, tokensAPI } from '../utils/api';
import { Radio, Clock, Users, CheckCircle2, ArrowRight, RefreshCw, Search } from 'lucide-react';

const QueueStatus = () => {
  const { socket, joinService, leaveService } = useSocket() || {};
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await servicesAPI.getAll();
        setServices(data);
        if (data.length > 0) {
          setSelectedService(data[0]);
        }
      } catch (err) {
        console.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (!selectedService) return;

    const fetchQueue = async () => {
      setQueueLoading(true);
      try {
        const { data } = await tokensAPI.getQueue(selectedService._id);
        setQueueData(data);
      } catch (err) {
        console.error('Failed to load queue');
      } finally {
        setQueueLoading(false);
      }
    };

    fetchQueue();
    joinService?.(selectedService._id);

    // Listen for real-time updates
    if (socket) {
      socket.on('queue-update', () => {
        fetchQueue();
      });
    }

    return () => {
      leaveService?.(selectedService._id);
      socket?.off('queue-update');
    };
  }, [selectedService, socket]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'serving': return 'bg-blue-500 text-white border-blue-500';
      case 'completed': return 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'waiting': return 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700';
      default: return 'bg-gray-50 text-gray-400 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse-slow"></span>
            <span className="text-sm font-medium text-green-600">LIVE</span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Live <span className="text-gradient">Queue Status</span>
        </h1>
        <p className="text-gray-500 mt-1">Real-time queue updates for all services</p>
      </div>

      {/* Service Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {services.map((svc) => (
          <button
            key={svc._id}
            onClick={() => setSelectedService(svc)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedService?._id === svc._id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900/30'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
            }`}
          >
            <span>{svc.icon || '🏢'}</span>
            {svc.name}
          </button>
        ))}
      </div>

      {selectedService && (
        <div className="animate-fade-in">
          {/* Queue Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="stat-card p-4 text-center">
              <Users size={20} className="mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{queueData?.stats?.waitingCount || 0}</p>
              <p className="text-xs text-gray-500">Waiting</p>
            </div>
            <div className="stat-card p-4 text-center">
              <Radio size={20} className="mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{queueData?.stats?.servingCount || 0}</p>
              <p className="text-xs text-gray-500">Now Serving</p>
            </div>
            <div className="stat-card p-4 text-center">
              <CheckCircle2 size={20} className="mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{queueData?.stats?.completedCount || 0}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="stat-card p-4 text-center">
              <Clock size={20} className="mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ~{(queueData?.stats?.waitingCount || 0) * (selectedService.estimatedTimePerToken || 10)}m
              </p>
              <p className="text-xs text-gray-500">Est. Wait</p>
            </div>
          </div>

          {/* Currently Serving */}
          {queueData?.serving?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Radio size={18} className="text-blue-500" />
                Now Serving
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {queueData.serving.map((token) => (
                  <div key={token._id} className="stat-card p-5 border-blue-500 border-2 bg-blue-50/50 dark:bg-blue-900/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold font-mono text-blue-600">{token.displayNumber}</p>
                        <p className="text-sm text-gray-500 mt-1">{token.user?.name || 'User'}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center animate-pulse-slow">
                        <Radio size={24} className="text-blue-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Waiting Queue */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              Waiting Queue ({queueData?.waiting?.length || 0})
            </h2>
            {queueData?.waiting?.length > 0 ? (
              <div className="space-y-2">
                {queueData.waiting.map((token, idx) => (
                  <div key={token._id} className={`stat-card p-4 flex items-center gap-4 ${getStatusStyle(token.status)} border transition-all`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">#{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-bold text-lg">{token.displayNumber}</p>
                      <p className="text-xs text-gray-500">{token.user?.name || 'User'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-accent-600">~{(idx + 1) * (selectedService.estimatedTimePerToken || 10)}m</p>
                      <p className="text-xs text-gray-500">est. wait</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="stat-card p-8 text-center">
                <CheckCircle2 size={40} className="mx-auto text-green-300 mb-3" />
                <p className="text-gray-500">No one waiting — queue is empty!</p>
              </div>
            )}
          </div>

          {/* Completed */}
          {queueData?.completed?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                Completed Today ({queueData.completed.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {queueData.completed.map((token) => (
                  <div key={token._id} className="p-3 bg-green-50 dark:bg-green-900/10 rounded-xl text-center border border-green-200 dark:border-green-800">
                    <p className="font-mono font-bold text-green-700 dark:text-green-400">{token.displayNumber}</p>
                    <p className="text-xs text-green-600/60 mt-0.5">✓ Done</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default QueueStatus;
