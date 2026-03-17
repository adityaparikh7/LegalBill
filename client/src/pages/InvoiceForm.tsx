import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getClients, getInvoice, createInvoice, updateInvoice,
  type Client, type LineItem
} from '../api';
import { useToast } from '../App';
interface FormLineItem {
  description: string;
  hours: string;
  rate: string;
}
export default function InvoiceForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [lineItems, setLineItems] = useState<FormLineItem[]>([
    { description: '', hours: '', rate: '' }
  ]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  useEffect(() => {
    const init = async () => {
      try {
        const clientList = await getClients();
        setClients(clientList);
        if (isEditing) {
          const invoice = await getInvoice(Number(id));
          setClientId(String(invoice.client_id));
          setDate(invoice.date);
          setDueDate(invoice.due_date || '');
          setNotes(invoice.notes || '');
          setTaxRate(String(invoice.tax_rate));
          setInvoiceNumber(invoice.invoice_number);
          if (invoice.line_items && invoice.line_items.length > 0) {
            setLineItems(invoice.line_items.map((li: LineItem) => ({
              description: li.description,
              hours: String(li.hours || ''),
              rate: String(li.rate || ''),
            })));
          }
        }
      } catch (err: any) {
        addToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);
  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', hours: '', rate: '' }]);
  };
  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };
  const updateLineItem = (index: number, field: keyof FormLineItem, value: string) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };
  const calculateAmount = (item: FormLineItem): number => {
    const hours = parseFloat(item.hours) || 0;
    const rate = parseFloat(item.rate) || 0;
    if (hours > 0) return hours * rate;
    return rate; // If no hours, treat rate as flat amount
  };
  const subtotal = lineItems.reduce((sum, item) => sum + calculateAmount(item), 0);
  const taxAmount = subtotal * (parseFloat(taxRate) || 0) / 100;
  const total = subtotal + taxAmount;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      addToast('Please select a client', 'error');
      return;
    }
    const validItems = lineItems.filter(li => li.description.trim());
    if (validItems.length === 0) {
      addToast('Please add at least one service', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        client_id: Number(clientId),
        date,
        due_date: dueDate || null,
        notes: notes || null,
        tax_rate: parseFloat(taxRate) || 0,
        line_items: validItems.map(li => ({
          description: li.description,
          hours: parseFloat(li.hours) || 0,
          rate: parseFloat(li.rate) || 0,
          amount: calculateAmount(li),
        })),
      };
      if (isEditing) {
        await updateInvoice(Number(id), payload);
        addToast('Invoice updated!', 'success');
      } else {
        await createInvoice(payload);
        addToast('Invoice created!', 'success');
      }
      navigate('/invoices');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return <div className="loading-center"><div className="spinner"></div></div>;
  }
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEditing ? 'Edit Invoice' : 'New Invoice'}</h1>
          <p className="page-subtitle">
            {invoiceNumber ? `Invoice: ${invoiceNumber}` : 'Invoice number will be auto-generated'}
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/invoices')}>
          ← Back to Invoices
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>Invoice Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Client *</label>
              <select
                className="form-select"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                required
              >
                <option value="">Select a client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {clients.length === 0 && (
                <p style={{ marginTop: 8, fontSize: 12, color: 'var(--accent-amber)' }}>
                  No clients found. <span style={{ cursor: 'pointer', color: 'var(--accent-blue)' }} onClick={() => navigate('/clients')}>Add a client first →</span>
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* Line Items */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Services Performed</h3>
            <button type="button" className="btn btn-outline btn-sm" onClick={addLineItem}>
              ➕ Add Service
            </button>
          </div>
          <div className="line-items-section">
            <div className="line-item-header">
              <span>Description</span>
              <span>Hours</span>
              <span>Rate ($)</span>
              <span>Amount ($)</span>
              <span></span>
            </div>
            {lineItems.map((item, idx) => (
              <div key={idx} className="line-item-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <input
                    className="form-input"
                    placeholder="Service description..."
                    value={item.description}
                    onChange={e => updateLineItem(idx, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={item.hours}
                    onChange={e => updateLineItem(idx, 'hours', e.target.value)}
                    min="0"
                    step="0.5"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={item.rate}
                    onChange={e => updateLineItem(idx, 'rate', e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <input
                    className="form-input"
                    value={`$${calculateAmount(item).toFixed(2)}`}
                    disabled
                    style={{ background: 'rgba(79, 142, 255, 0.05)', fontWeight: 600 }}
                  />
                </div>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => removeLineItem(idx)}
                  style={{ color: 'var(--accent-red)', alignSelf: 'center' }}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {/* Totals */}
          <div className="invoice-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Tax</span>
              <input
                type="number"
                className="form-input"
                value={taxRate}
                onChange={e => setTaxRate(e.target.value)}
                min="0"
                max="100"
                step="0.5"
                style={{ width: 70, padding: '4px 8px', textAlign: 'center' }}
              />
              <span>%</span>
              <span style={{ marginLeft: 'auto' }}>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {/* Notes */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Notes / Terms</label>
            <textarea
              className="form-textarea"
              placeholder="Payment terms, notes, or special instructions..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        {/* Submit */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/invoices')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? '⏳ Saving...' : isEditing ? '💾 Update Invoice' : '✅ Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}