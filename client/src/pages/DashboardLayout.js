import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div style={{ 
      minHeight: 'calc(100vh - 120px)',
      width: '100%',
      padding: '20px',
      position: 'relative'
    }}>
      <Outlet />
      <div style={{
        position: 'fixed',
        bottom: '8px',
        right: '16px',
        fontSize: '10px',
        color: 'rgba(255,255,255,0.15)',
        fontFamily: 'monospace',
        letterSpacing: '1px',
        userSelect: 'none',
        pointerEvents: 'none',
        textAlign: 'right'
      }}>
        jitendranishad91<br/>@mr_jitendra62
      </div>
    </div>
  );
}

export default DashboardLayout;
