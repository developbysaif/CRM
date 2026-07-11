'use client';
import { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeMap = { sm: '480px', md: '640px', lg: '820px', xl: '1000px' };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: sizeMap[size] }}>
        <div className="modal-header">
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '20px 28px 28px' }}>{children}</div>
      </div>
    </div>
  );
}
