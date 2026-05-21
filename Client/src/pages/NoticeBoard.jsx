import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Calendar, User, X, CircleAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlert } from '../context/AlertContext';

const NoticeBoard = () => {
  const { showConfirm } = useAlert();
  const [notices, setNotices] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General'
  });

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      } else {
        setError('Failed to load notices.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Failed to load notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccessMsg('Notice published successfully!');
        setFormData({ title: '', content: '', category: 'General' });
        setIsAddModalOpen(false);
        fetchNotices();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError('Failed to publish notice. Try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the server.');
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!(await showConfirm('Are you sure you want to delete this announcement?'))) return;
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setSuccessMsg('Notice deleted successfully.');
        fetchNotices();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError('Failed to delete notice.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error.');
    }
  };

  const getCategoryStyles = (category) => {
    switch (category) {
      case 'Urgent':
        return {
          bg: 'bg-rose-50 text-rose-600 border-rose-100',
          badge: 'bg-rose-500 text-white',
          accent: 'border-l-rose-500'
        };
      case 'Holiday':
        return {
          bg: 'bg-violet-50 text-violet-600 border-violet-100',
          badge: 'bg-violet-500 text-white',
          accent: 'border-l-violet-500'
        };
      case 'Event':
        return {
          bg: 'bg-blue-50 text-blue-600 border-blue-100',
          badge: 'bg-blue-500 text-white',
          accent: 'border-l-blue-500'
        };
      default:
        return {
          bg: 'bg-teal-50 text-teal-600 border-teal-100',
          badge: 'bg-teal-500 text-white',
          accent: 'border-l-teal-500'
        };
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 max-w-7xl mx-auto pb-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/70 backdrop-blur-md p-8 rounded-[40px] border border-white/40 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Megaphone className="text-primary animate-bounce" size={32} />
            Notice Board Manager
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Create, publish, and manage real-time announcements for all organization employees
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Publish Notice
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-xs font-semibold flex items-center gap-3 shadow-sm">
          <CircleAlert size={16} />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-xs font-semibold flex items-center gap-3 shadow-sm animate-pulse">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Notices List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => {
            const styles = getCategoryStyles(notice.category);
            return (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-[32px] p-6 border-l-4 ${styles.accent} border-t border-r border-b border-gray-100/80 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group relative overflow-hidden`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles.bg}`}>
                      {notice.category}
                    </span>
                    <button
                      onClick={() => handleDeleteNotice(notice.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-800 tracking-tight leading-snug mb-3">
                    {notice.title}
                  </h3>

                  <p className="text-slate-500 text-xs font-medium leading-relaxed whitespace-pre-wrap mb-6">
                    {notice.content}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar size={12} />
                    {(() => {
                      try {
                        const date = new Date(notice.createdAt);
                        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                      } catch (err) {
                        return notice.createdAt;
                      }
                    })()}
                  </div>
                  
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
                    <div className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-[9px] shadow-sm">
                      {notice.createdBy ? notice.createdBy.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                      {notice.createdBy || 'Admin'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-16 text-center border border-white/40 shadow-sm flex flex-col items-center gap-5">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center">
            <Megaphone size={36} />
          </div>
          <div className="max-w-sm">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">No active announcements</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2">
              Your notice board is currently clean. Click the publish button above to share updates with the organization in real-time.
            </p>
          </div>
        </div>
      )}

      {/* Add Notice Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-50 z-10"
            >
              <div className="px-8 py-6 bg-slate-50/50 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-primary animate-pulse" size={20} />
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">Publish New Announcement</h2>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateNotice} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Announcement Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['General', 'Event', 'Holiday', 'Urgent'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all border ${
                          formData.category === cat
                            ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                            : 'bg-white border-gray-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter short, striking announcement title..."
                    className="w-full bg-slate-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-sm text-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Announcement Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your announcement details here..."
                    className="w-full bg-slate-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm text-slate-800 resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors"
                  >
                    Publish Announcement
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoticeBoard;
