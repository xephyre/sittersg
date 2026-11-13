import React, { useState } from 'react';
import { KeyRound, MapPin, Phone, PhoneCall, Plus, ShieldCheck } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { EstateArea } from '../../types';
import { FamilyChildrenSection } from './FamilyChildrenSection';

export const FamilyProfilePage: React.FC = () => {
  const {
    activeParent,
    setSingpassModalOpen,
    addChildToParent,
    removeChildFromParent,
    addEmergencyContact,
    updateParentAddress,
  } = useApp();

  const [ecName, setEcName] = useState('');
  const [ecRel, setEcRel] = useState('');
  const [ecPhone, setEcPhone] = useState('');

  const [postal, setPostal] = useState(activeParent.postalCode);
  const [address, setAddress] = useState(activeParent.addressDisplay);
  const [estate, setEstate] = useState<EstateArea>(activeParent.estate);
  const [savedNotice, setSavedNotice] = useState('');

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ecName.trim() || !ecPhone.trim()) return;
    addEmergencyContact({
      name: ecName.trim(),
      relationship: ecRel.trim() || 'Family contact',
      phone: ecPhone.trim(),
    });
    setEcName('');
    setEcRel('');
    setEcPhone('');
  };

  const handleAddressSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateParentAddress(postal, address, estate);
    setSavedNotice('Home address updated. Revealed to sitters only upon confirmed booking.');
    setTimeout(() => setSavedNotice(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Family Profile & PDPA Safeguards</h1>
          <p className="text-sm text-slate-600">
            Children’s records store first name + age band only. Full address stays private until a
            booking is confirmed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSingpassModalOpen(true)}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-2"
        >
          <KeyRound className="w-4 h-4" />
          <span>Re-sync with Singpass MyInfo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Verified Parent Identity</h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800">
              <ShieldCheck className="w-4 h-4" />
              Singpass Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs text-slate-500">Full Name (MyInfo)</p>
              <p className="font-semibold text-slate-900">{activeParent.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Masked NRIC (PDPA)</p>
              <p className="font-mono font-semibold text-slate-900">{activeParent.maskedNric}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Date of Birth</p>
              <p className="font-mono text-slate-800">{activeParent.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Mobile (WhatsApp Alerts)</p>
              <p className="font-mono text-slate-800">{activeParent.phone}</p>
            </div>
          </div>

          <form onSubmit={handleAddressSave} className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Home Address (Confirmed Bookings Only)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estate</label>
                <select
                  value={estate}
                  onChange={(e) => setEstate(e.target.value as EstateArea)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm bg-white"
                >
                  <option value="Punggol">Punggol</option>
                  <option value="Sengkang">Sengkang</option>
                  <option value="Tampines">Tampines</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Block / Unit & Street
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm"
              />
            </div>
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Save Home Address</span>
            </button>
            {savedNotice && <p className="text-xs text-teal-800 font-medium">{savedNotice}</p>}
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-teal-700" />
            <span>Emergency Contacts ({activeParent.emergencyContacts.length})</span>
          </h2>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {activeParent.emergencyContacts.map((ec) => (
              <div key={ec.id} className="p-3.5 flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{ec.name}</p>
                  <p className="text-xs text-slate-500">{ec.relationship}</p>
                </div>
                <span className="font-mono text-xs text-slate-700 inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {ec.phone}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddContact} className="space-y-3 pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-700">Add Emergency Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                placeholder="Name"
                value={ecName}
                onChange={(e) => setEcName(e.target.value)}
                className="min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Relationship"
                value={ecRel}
                onChange={(e) => setEcRel(e.target.value)}
                className="min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm"
              />
              <input
                type="text"
                placeholder="+65 9XXX XXXX"
                value={ecPhone}
                onChange={(e) => setEcPhone(e.target.value)}
                className="min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm font-mono"
                required
              />
            </div>
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Contact</span>
            </button>
          </form>
        </section>
      </div>

      <FamilyChildrenSection
        childrenList={activeParent.children}
        onAddChild={addChildToParent}
        onRemoveChild={removeChildFromParent}
      />
    </div>
  );
};
