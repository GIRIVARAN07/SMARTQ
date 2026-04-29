import { Link } from 'react-router-dom';
import {
  Zap, Clock, Bell, Shield, BarChart3, Users, ArrowRight, Check,
  Building2, GraduationCap, Landmark, Stethoscope, ChevronRight, Star
} from 'lucide-react';

const Landing = () => {
  const features = [
    { icon: Zap, title: 'Instant Token Booking', desc: 'Book your queue token online in seconds. No more physical waiting.', color: 'from-yellow-400 to-orange-500' },
    { icon: Clock, title: 'Real-Time Tracking', desc: 'Track your position in the queue with live updates and estimated wait times.', color: 'from-blue-400 to-indigo-500' },
    { icon: Bell, title: 'Smart Notifications', desc: 'Get notified when your turn is approaching. Never miss your slot.', color: 'from-green-400 to-emerald-500' },
    { icon: Shield, title: 'Secure & Reliable', desc: 'Enterprise-grade security with JWT authentication and encrypted data.', color: 'from-purple-400 to-pink-500' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Comprehensive analytics with daily reports and performance metrics.', color: 'from-cyan-400 to-blue-500' },
    { icon: Users, title: 'Multi-Service Support', desc: 'Manage multiple service queues simultaneously from one dashboard.', color: 'from-rose-400 to-red-500' },
  ];

  const useCases = [
    { icon: Stethoscope, title: 'Hospitals', desc: 'Patient queue management for OPD, lab tests, and pharmacy.', color: 'bg-red-50 dark:bg-red-900/20 text-red-600' },
    { icon: Landmark, title: 'Banks', desc: 'Token-based service for teller counters and loan departments.', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
    { icon: GraduationCap, title: 'Colleges', desc: 'Admission counters, library services, and exam offices.', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
    { icon: Building2, title: 'Service Centers', desc: 'Government offices, telecom stores, and customer service.', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
  ];

  const stats = [
    { value: '10K+', label: 'Tokens Managed' },
    { value: '500+', label: 'Organizations' },
    { value: '95%', label: 'Wait Time Reduced' },
    { value: '4.9★', label: 'User Rating' },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent-200/30 dark:bg-accent-900/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 mb-6">
                <Star size={14} className="text-primary-600 fill-primary-600" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">#1 Queue Management Platform</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Say Goodbye to
                <span className="text-gradient block mt-1">Long Queues</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
                SmartQ revolutionizes how organizations manage queues. Book tokens online,
                track waiting time in real-time, and get notified when it's your turn.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup" className="btn-primary text-base px-8 py-3 no-underline">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-3 no-underline">
                  Sign In
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-gradient">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:block animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                {/* Main card */}
                <div className="glass-card p-8 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Q</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">SmartQ Dashboard</h3>
                      <p className="text-xs text-gray-500">Live Queue Status</p>
                    </div>
                  </div>

                  {/* Mock queue items */}
                  <div className="space-y-3">
                    {[
                      { num: 'H-001', name: 'General Checkup', status: 'Completed', color: 'badge-completed' },
                      { num: 'H-002', name: 'General Checkup', status: 'Serving', color: 'badge-serving' },
                      { num: 'H-003', name: 'General Checkup', status: 'Waiting', color: 'badge-waiting' },
                      { num: 'H-004', name: 'General Checkup', status: 'Waiting', color: 'badge-waiting' },
                    ].map((item) => (
                      <div key={item.num} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-bold text-primary-600">{item.num}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                        </div>
                        <span className={`badge ${item.color}`}>{item.status}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between px-2">
                    <div>
                      <p className="text-xs text-gray-500">Estimated Wait</p>
                      <p className="text-lg font-bold text-primary-600">~12 min</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Your Position</p>
                      <p className="text-lg font-bold text-accent-500">#3</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total in Queue</p>
                      <p className="text-lg font-bold text-gray-700 dark:text-gray-200">4</p>
                    </div>
                  </div>
                </div>

                {/* Floating notification */}
                <div className="absolute -top-4 -right-4 glass-card py-3 px-4 flex items-center gap-3 animate-float z-20 shadow-xl">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Bell size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">Your turn is next!</p>
                    <p className="text-xs text-gray-500">Get ready</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary-600 tracking-wider uppercase">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-gray-900 dark:text-white">
              Everything You Need to
              <span className="text-gradient"> Manage Queues</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Powerful features designed to eliminate waiting and streamline service delivery.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group stat-card hover:border-primary-200 dark:hover:border-primary-800 p-6"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-accent-600 tracking-wider uppercase">Use Cases</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-gray-900 dark:text-white">
              Built for <span className="text-gradient">Every Industry</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4">From hospitals to banks, SmartQ adapts to your workflow.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc) => (
              <div key={uc.title} className="stat-card text-center p-8 group">
                <div className={`w-16 h-16 rounded-2xl ${uc.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <uc.icon size={28} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{uc.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 p-12 sm:p-16 text-center">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent-500/20 rounded-full blur-2xl"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Eliminate Long Queues?
              </h2>
              <p className="text-lg text-primary-100 mb-8 max-w-lg mx-auto">
                Join thousands of organizations that trust SmartQ for seamless queue management.
              </p>
              <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 no-underline">
                Start Free Today <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold">Q</span>
              </div>
              <span className="font-bold text-gradient">SmartQ</span>
            </div>
            <p className="text-sm text-gray-500">© 2024 SmartQ. All rights reserved. Built with ❤️</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-primary-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
