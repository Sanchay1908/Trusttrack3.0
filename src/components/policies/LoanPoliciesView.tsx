import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Sliders, 
  History, 
  Plus, 
  Edit3, 
  Check, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Lock,
  ChevronRight,
  Clock
} from 'lucide-react';
import { LoanPolicy } from '../../types';

export const LoanPoliciesView: React.FC = () => {
  const { user, role } = useAuth();
  const { 
    policies, 
    policyVersions, 
    updatePolicyThreshold, 
    addLoanPolicy, 
    togglePolicyActive 
  } = useApp();

  const [editingPolicy, setEditingPolicy] = useState<LoanPolicy | null>(null);
  const [newValue, setNewValue] = useState<string>('');
  const [rationale, setRationale] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [selectedPolicyForHistory, setSelectedPolicyForHistory] = useState<LoanPolicy | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Policy Form
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState<'income' | 'credit' | 'dti' | 'documentation' | 'employment'>('income');
  const [newOp, setNewOp] = useState<'>' | '>=' | '<' | '<=' | '==' | 'contains'>('>=');
  const [newThreshold, setNewThreshold] = useState('');
  const [newUnit, setNewUnit] = useState('');

  const handleStartEdit = (policy: LoanPolicy) => {
    setEditingPolicy(policy);
    setNewValue(String(policy.threshold_value));
    setRationale('');
    setEditError(null);
  };

  const handleSavePolicyEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;

    if (!rationale.trim()) {
      setEditError('Mandatory change explanation required. Policy versions must be justified for regulatory compliance.');
      return;
    }

    setIsSubmitting(true);
    setEditError(null);

    try {
      const res = await updatePolicyThreshold(editingPolicy.id, newValue, rationale.trim());
      if (res.success) {
        alert(`Policy "${editingPolicy.policy_name}" updated to version ${(editingPolicy.version_number || 1) + 1}.`);
        setEditingPolicy(null);
      } else {
        setEditError(res.error || 'Failed to update policy threshold.');
      }
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newName.trim() || !newThreshold.trim()) return;

    await addLoanPolicy({
      policy_key: newKey.trim(),
      policy_name: newName.trim(),
      description: newDesc.trim(),
      policy_category: newCat,
      operator: newOp,
      threshold_value: newThreshold.trim(),
      threshold_unit: newUnit.trim(),
      is_active: true
    });

    setShowAddModal(false);
    setNewKey('');
    setNewName('');
    setNewDesc('');
    setNewThreshold('');
    setNewUnit('');
  };

  const historyForSelected = policyVersions.filter(v => v.policy_id === selectedPolicyForHistory?.id);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#FF5B26]" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Loan Policy Management</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5B26]/15 text-[#FF7A00] border border-[#FF5B26]/30 uppercase">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure institutional credit risk thresholds with immutable versioning, audit logging, and historical reproducibility.
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl btn-primary-orange text-xs font-semibold flex items-center gap-2 shadow-lg shadow-orange-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Policy</span>
          </button>
        )}
      </div>

      {role !== 'admin' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
          <Lock className="w-5 h-5 shrink-0" />
          <span>
            You are logged in as a <b>Human Reviewer</b>. You have read-only access to view current policies and past version history. Switch to <b>Admin</b> to modify thresholds.
          </span>
        </div>
      )}

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policies.map(policy => (
          <div 
            key={policy.id} 
            className="glass-panel-elevated rounded-2xl p-5 border border-white/[0.08] flex flex-col justify-between space-y-4 hover:border-white/[0.15] transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-lg bg-white/[0.04] text-[10px] text-slate-400 font-mono">
                  Key: {policy.policy_key}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#FF7A00] font-mono font-bold bg-[#FF5B26]/10 px-2 py-0.5 rounded-full">
                    v{policy.version_number || 1}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    policy.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {policy.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-white">{policy.policy_name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{policy.description}</p>
            </div>

            {/* Threshold Box */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Configured Threshold</span>
                <span className="text-lg font-bold text-white block mt-0.5">
                  {policy.operator} {policy.threshold_value} {policy.threshold_unit}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                Category: {policy.policy_category}
              </span>
            </div>

            {/* Action Footer */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <button
                onClick={() => setSelectedPolicyForHistory(policy)}
                className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors text-[11px]"
              >
                <History className="w-3.5 h-3.5 text-[#FF7A00]" />
                <span>Version History</span>
              </button>

              {role === 'admin' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePolicyActive(policy.id)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 text-[11px]"
                  >
                    {policy.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleStartEdit(policy)}
                    className="px-3 py-1 rounded-lg btn-primary-orange text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Threshold</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Policy Threshold Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-panel-elevated rounded-3xl p-6 border border-white/[0.1] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Edit3 className="w-4 h-4 text-[#FF7A00]" />
                <span>Update Policy: {editingPolicy.policy_name}</span>
              </div>
              <button onClick={() => setEditingPolicy(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Updating a policy increments its version number (to <b>v{(editingPolicy.version_number || 1) + 1}</b>). Historical policy verifications will remain pegged to previous version records to preserve full reproducibility.
            </p>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {editError}
              </div>
            )}

            <form onSubmit={handleSavePolicyEdit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Current Value
                </label>
                <div className="px-3 py-2 text-xs rounded-xl bg-white/[0.02] border border-white/[0.05] text-slate-400 font-mono">
                  {editingPolicy.threshold_value} {editingPolicy.threshold_unit}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  New Threshold Value <span className="text-[#FF7A00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl glass-input text-slate-100 font-mono"
                  placeholder="e.g. 45000 or 30 or 680"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Mandatory Change Explanation <span className="text-[#FF7A00]">* (Required)</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl glass-input text-slate-100 resize-none font-sans"
                  placeholder="State the institutional justification (e.g. Revised prudential buffer for retail underwriting)..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !rationale.trim()}
                  className="px-5 py-2 rounded-xl btn-primary-orange text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-orange-500/25"
                >
                  {isSubmitting ? 'Creating Version...' : 'Save & Enact Version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version History Drawer/Modal */}
      {selectedPolicyForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl max-h-[85vh] glass-panel-elevated rounded-3xl p-6 border border-white/[0.1] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#FF7A00]" />
                <h3 className="text-sm font-bold text-white">
                  Version History: {selectedPolicyForHistory.policy_name}
                </h3>
              </div>
              <button onClick={() => setSelectedPolicyForHistory(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
              {historyForSelected.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No previous versions on record.</p>
              ) : (
                historyForSelected.map((ver, idx) => (
                  <div key={ver.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#FF7A00] font-mono">Version {ver.version_number}</span>
                      <span className="text-[10px] text-slate-400">{new Date(ver.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-slate-400">Previous: {ver.previous_value}</span>
                      <span>&rarr;</span>
                      <span className="font-semibold text-white">Enacted: {ver.new_value}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      <b className="text-slate-400">Rationale:</b> {ver.change_rationale}
                    </p>
                    <p className="text-[10px] text-slate-400 pt-1 border-t border-white/[0.04]">
                      Enacted by: {ver.updated_by_name}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Policy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg glass-panel-elevated rounded-3xl p-6 border border-white/[0.1] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Add New Financial Eligibility Policy</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPolicy} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Policy Key</label>
                <input
                  type="text"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. min_liquid_assets"
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Policy Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Minimum Liquid Asset Reserve"
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explanation of criteria..."
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-slate-100 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Operator</label>
                  <select
                    value={newOp}
                    onChange={(e: any) => setNewOp(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input text-slate-200 bg-[#121218]"
                  >
                    <option value=">=">&gt;= (Greater or Equal)</option>
                    <option value="<=">&lt;= (Less or Equal)</option>
                    <option value="==">== (Equals)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Threshold</label>
                  <input
                    type="text"
                    required
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl btn-primary-orange text-xs font-semibold"
                >
                  Create Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
