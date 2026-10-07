"use client";

import { useState } from "react";
import { Plus, Trash2, Pill } from "lucide-react";

export function PrescriptionBuilder() {
  const [meds, setMeds] = useState([{ id: Date.now() }]);

  const addMed = () => setMeds([...meds, { id: Date.now() }]);
  const removeMed = (id: number) => setMeds(meds.filter(m => m.id !== id));

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden mt-8">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
          <Pill size={18} className="text-emerald-600" /> Prescriptions
        </h4>
        <button type="button" onClick={addMed} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
          <Plus size={16} /> Add Medication
        </button>
      </div>

      <div className="p-6 space-y-6">
        {meds.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-4">No medications added. Click "Add Medication" above.</p>
        )}
        
        {meds.map((med, index) => (
          <div key={med.id} className="relative bg-white border border-slate-100 rounded-xl p-4 shadow-sm pb-5">
            <div className="absolute -top-3 -right-3">
              <button type="button" onClick={() => removeMed(med.id)} className="bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 p-1.5 rounded-full shadow-sm transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Medication Name</label>
                <input type="text" name={`medication_${index}`} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm" placeholder="e.g. Amoxicillin 500mg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Dosage</label>
                <input type="text" name={`dosage_${index}`} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm" placeholder="e.g. 2 tablets" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Frequency</label>
                <input type="text" name={`frequency_${index}`} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm" placeholder="e.g. 3 times daily (TDS)" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Duration (Days)</label>
                <input type="number" name={`duration_${index}`} required min={1} max={365} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm" placeholder="7" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Instructions</label>
                <input type="text" name={`instructions_${index}`} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm" placeholder="e.g. After meals" />
              </div>
            </div>
            <input type="hidden" name="prescription_indexes" value={index} />
          </div>
        ))}
      </div>
    </div>
  );
}
