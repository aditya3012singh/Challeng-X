import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, MessageCircle, Linkedin, Instagram, Share2, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, link, title = "INVITE CHALLENGERS", message = "Join me in a challenge on ChallegX!" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: <MessageCircle size={18} />,
      color: "hover:text-[#25D366] hover:bg-[#25D366]/10",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(message + " " + link)}`,
    },
    {
      name: "LinkedIn",
      icon: <Linkedin size={18} />,
      color: "hover:text-[#0077B5] hover:bg-[#0077B5]/10",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
    },
    {
      name: "Instagram",
      icon: <Instagram size={18} />,
      color: "hover:text-[#E4405F] hover:bg-[#E4405F]/10",
      action: () => {
        handleCopy();
        toast("Instagram doesn't support direct links. Link copied for you to paste!", { icon: '📸' });
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-[var(--color-bg-card)] border border-[var(--glass-border)] shadow-2xl overflow-hidden p-8 backdrop-blur-xl"
          style={{ borderRadius: "2px" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-sm">
                <Share2 size={18} />
              </div>
              <h3 className="text-sm font-black tracking-[0.3em] text-[var(--color-text-main)] uppercase">{title}</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Link Section */}
          <div className="mb-8">
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-3">Target Protocol URL</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-black/40 border border-white/5 p-3 font-mono text-[11px] text-[var(--color-text-muted)] truncate rounded-sm">
                {link}
              </div>
              <button 
                onClick={handleCopy}
                className={`px-4 flex items-center justify-center border transition-all ${copied ? 'border-green-500 text-green-500' : 'border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-black'}`}
                style={{ borderRadius: "2px" }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Social Grid */}
          <div className="grid grid-cols-3 gap-4">
            {shareLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (social.action) {
                    e.preventDefault();
                    social.action();
                  }
                }}
                className={`flex flex-col items-center gap-3 p-4 border border-white/5 bg-white/[0.02] transition-all group ${social.color}`}
                style={{ borderRadius: "2px" }}
              >
                <div className="transition-transform group-hover:scale-110">
                  {social.icon}
                </div>
                <span className="text-[9px] font-bold tracking-widest uppercase opacity-60 group-hover:opacity-100">{social.name}</span>
              </a>
            ))}
          </div>

          {/* Footer Decoration */}
          <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-30">
            <div className="flex items-center gap-2">
              <Globe size={10} />
              <span className="text-[8px] font-mono uppercase tracking-widest">Global Sync Active</span>
            </div>
            <span className="text-[8px] font-mono">v1.2.4-stable</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareModal;
