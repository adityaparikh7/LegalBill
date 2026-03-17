export default function Settings() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your billing preferences</p>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="settings-section">
          <h3 className="section-title">📧 Email Configuration</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
            Configure your SMTP settings to send invoices and reminders via email.
            Set the following environment variables in your <code style={{ background: 'var(--bg-glass)', padding: '2px 6px', borderRadius: 4 }}>.env</code> file:
          </p>
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: 20,
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 2,
            color: 'var(--text-secondary)',
          }}>
            <div><span style={{ color: 'var(--accent-blue)' }}>SMTP_HOST</span>=smtp.gmail.com</div>
            <div><span style={{ color: 'var(--accent-blue)' }}>SMTP_PORT</span>=587</div>
            <div><span style={{ color: 'var(--accent-blue)' }}>SMTP_USER</span>=your-email@gmail.com</div>
            <div><span style={{ color: 'var(--accent-blue)' }}>SMTP_PASS</span>=your-app-password</div>
            <div><span style={{ color: 'var(--accent-blue)' }}>SMTP_FROM</span>=billing@yourfirm.com</div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 12 }}>
            💡 If no SMTP is configured, emails are sent to <a href="https://ethereal.email" target="_blank" rel="noopener" style={{ color: 'var(--accent-blue)' }}>Ethereal</a> test accounts for preview.
          </p>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="settings-section">
          <h3 className="section-title">📄 Invoice Settings</h3>
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: 'var(--bg-glass)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
            }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Invoice Number Format</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Auto-generated as INV-YYYYMM-XXXX</div>
              </div>
              <span className="badge sent">AUTO</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: 'var(--bg-glass)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
            }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Redundant Copies</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Every PDF & Excel export is saved in the copies/ directory</div>
              </div>
              <span className="badge paid">ENABLED</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: 'var(--bg-glass)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
            }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Date Auto-Population</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>New invoices default to today's date (editable)</div>
              </div>
              <span className="badge paid">ENABLED</span>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="settings-section">
          <h3 className="section-title">ℹ️ About</h3>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8 }}>
            <p><strong>LegalBill</strong> v1.0.0</p>
            <p>A professional invoicing and billing tool designed for legal practices.</p>
            <p style={{ marginTop: 12 }}>
              Features: Invoice generation (PDF & Excel) • Payment tracking • Email sending & reminders • Redundant copies • Auto invoice numbering
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
