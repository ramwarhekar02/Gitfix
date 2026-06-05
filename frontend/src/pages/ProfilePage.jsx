import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { User, Phone, Image, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user, loginWithGoogle } = useAuth(); // We can trigger a session check or update context
  const navigate = useNavigate();

  // Local state initialized with current user context
  const [username, setUsername] = useState(user?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Preset premium developer avatar options for instant select
  const avatarPresets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&h=150&q=80',
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);

    try {
      const response = await axiosInstance.put('/auth/profile', {
        username,
        phoneNumber,
        avatarUrl,
      });

      if (response.data?.success) {
        setMessage('Profile updated successfully!');
        // Update user context instantly by reloading or updating context directly
        // We can reload session checks or trigger redirect. Since we want context update:
        window.location.reload(); // Hard refresh to sync state or navigate back
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Failed to update profile details.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-darkBg text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Header />

      <main className="flex-grow flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6">
        <div className="w-full max-w-xl space-y-6">
          {/* Back Navigation header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back to workspace
            </button>
            <h2 className="text-lg font-bold font-mono tracking-wide text-slate-700 dark:text-slate-300">
              EDIT PROFILE
            </h2>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkPanel/30 p-5 shadow-2xl backdrop-blur-md sm:p-8">
            {message && (
              <div className="mb-5 flex items-center gap-2 rounded-lg border border-accentGreen/40 bg-accentGreen/5 p-3 text-xs text-accentGreen font-mono">
                <CheckCircle2 className="h-4 w-4" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-lg border border-accentRed/40 bg-accentRed/5 p-3 text-xs text-accentRed font-mono">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* Profile Image Selectors */}
              <div className="flex flex-col items-center justify-center gap-4 border-b border-slate-100 dark:border-darkBorder/40 pb-6">
                <div className="h-20 w-20 rounded-full border border-slate-300 dark:border-darkBorder bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center shadow-md">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="h-8 w-8 text-slate-400" />
                  )}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-mono font-medium text-slate-400 uppercase">Select Avatar Preset</span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {avatarPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(preset)}
                        className={`h-9 w-9 rounded-full overflow-hidden border-2 transition ${
                          avatarUrl === preset ? 'border-accentBlue scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt={`Preset ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input details */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                    Username
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="developer_name"
                      className="block w-full rounded-lg border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-950/80 py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-accentBlue/60 focus:outline-none focus:ring-1 focus:ring-accentBlue/30 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="block w-full rounded-lg border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-950/80 py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-accentBlue/60 focus:outline-none focus:ring-1 focus:ring-accentBlue/30 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                    Custom Photo URL
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Image className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="block w-full rounded-lg border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-950/80 py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-accentBlue/60 focus:outline-none focus:ring-1 focus:ring-accentBlue/30 transition-all font-sans"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accentBlue px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-accentBlue/50 transition disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  'Save Profile Details'
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
