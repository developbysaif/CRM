'use client';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Toaster from '../ui/Toaster';
import ChatWidget from '../chat/ChatWidget';

export default function AppLayout({ children, title, subtitle }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title={title} subtitle={subtitle} />
        <main className="page-content">{children}</main>
      </div>
      <ChatWidget />
      <Toaster />
    </div>
  );
}
