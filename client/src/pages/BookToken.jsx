import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { servicesAPI, tokensAPI } from '../utils/api';
import {
  Search, Filter, Clock, Users, Ticket, CheckCircle2, AlertCircle,
  MapPin, ArrowRight
} from 'lucide-react';

const BookToken = () => {
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookedToken, setBookedToken] = useState(null);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');

  const categories = [
    { value: 'all', label: 'All', icon: '📋' },
    { value: 'hospital', label: 'Hospital', icon: '🏥' },
    { value: 'bank', label: 'Bank', icon: '🏦' },
    { value: 'college', label: 'College', icon: '🎓' },
    { value: 'service_center', label: 'Service Center', icon: '🔧' },
    { value: 'government', label: 'Government', icon: '🏛️' },
    { value: 'other', label: 'Other', icon: '🏢' },
  ];

  useEffect(() => {
    fetchServices();
  }, [category]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      const { data } = await servicesAPI.getAll(params);
      setServices(data);
      if (preselectedService) {
        const found = data.find(s => s._id === preselectedService);
        if (found) setSelectedService(found);
      }
    } catch (err) {
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServices();
  };

  const handleBook = async () => {
    if (!selectedService) return;
    setBooking(true);
    setError('');

    try {
      const { data } = await tokensAPI.book({ serviceId: selectedService._id, notes });
      setBookedToken(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book token');
    } finally {
      setBooking(false);
    }
  };

  // Success screen
  if (bookedToken) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center animate-slide-up">
        <div className="glass-card p-10">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Token Booked!</h1>
          <p className="text-gray-500 mb-8">Your queue token has been successfully booked</p>

          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white mb-8">
            <p className="text-sm opacity-80 mb-1">Your Token Number</p>
            <p className="text-5xl font-bold font-mono mb-4">{bookedToken.displayNumber}</p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div>
                <p className="opacity-80">Service</p>
                <p className="font-semibold">{bookedToken.service?.name}</p>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div>
                <p className="opacity-80">Est. Wait</p>
                <p className="font-semibold">{bookedToken.estimatedWaitTime} min</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setBookedToken(null); setSelectedService(null); setNotes(''); }} className="btn-secondary flex-1">
              Book Another
            </button>
            <a href="/queue" className="btn-primary flex-1 justify-center no-underline">
              Track Queue <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Book a <span className="text-gradient">Token</span>
        </h1>
        <p className="text-gray-500 mt-1">Select a service and book your queue token</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm animate-fade-in">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search services..."
          />
        </form>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              category === cat.value
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900/30'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Services List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="stat-card p-6 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((svc, i) => (
                <button
                  key={svc._id}
                  onClick={() => setSelectedService(svc)}
                  className={`stat-card p-5 text-left transition-all animate-slide-up ${
                    selectedService?._id === svc._id
                      ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                      : 'hover:border-gray-300'
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{svc.icon || '🏢'}</span>
                    {svc.queueInfo?.waitingCount > 0 && (
                      <span className="badge badge-waiting flex items-center gap-1">
                        <Users size={12} />
                        {svc.queueInfo.waitingCount}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{svc.name}</h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{svc.description || 'No description'}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      ~{svc.estimatedTimePerToken || 10}m/token
                    </span>
                    {svc.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {svc.location}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="stat-card p-12 text-center">
              <Search size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No services found</p>
            </div>
          )}
        </div>

        {/* Booking Panel */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="glass-card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Booking Summary</h2>

            {selectedService ? (
              <>
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedService.icon || '🏢'}</span>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedService.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{selectedService.category?.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                    <p className="text-xs text-gray-500">In Queue</p>
                    <p className="text-xl font-bold text-primary-600">{selectedService.queueInfo?.waitingCount || 0}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                    <p className="text-xs text-gray-500">Est. Wait</p>
                    <p className="text-xl font-bold text-accent-600">{selectedService.queueInfo?.estimatedWait || 0}m</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Any special requirements..."
                  ></textarea>
                </div>

                <button
                  onClick={handleBook}
                  disabled={booking}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-60"
                >
                  {booking ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Ticket size={18} />
                      Book Token
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <Ticket size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-400">Select a service to book a token</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookToken;
