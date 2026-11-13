import React, { useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { AgeBand, Child } from '../../types';

const AGE_BANDS: AgeBand[] = [
  'Newborn (0–6m)',
  'Infant (6–12m)',
  'Toddler (1–3y)',
  'Preschool (4–6y)',
  'Primary (7–12y)',
];

interface Props {
  childrenList: Child[];
  onAddChild: (child: Omit<Child, 'id'>) => void;
  onRemoveChild: (childId: string) => void;
}

export const FamilyChildrenSection: React.FC<Props> = ({
  childrenList,
  onAddChild,
  onRemoveChild,
}) => {
  const [childName, setChildName] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand>('Toddler (1–3y)');
  const [allergies, setAllergies] = useState('None known');
  const [dietaryNotes, setDietaryNotes] = useState('No special restrictions');
  const [culturalNotes, setCulturalNotes] = useState('');
  const [specialNeedsFlag, setSpecialNeedsFlag] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) return;
    onAddChild({
      firstName: childName.trim(),
      ageBand,
      allergies: allergies.trim() || 'None known',
      dietaryNotes: dietaryNotes.trim() || 'Standard family diet',
      culturalNotes: culturalNotes.trim() || 'English home routine',
      specialNeedsFlag,
    });
    setChildName('');
    setCulturalNotes('');
    setSpecialNeedsFlag(false);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          Children Profiles ({childrenList.length})
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          PDPA Data Minimization: Only first name, age band, allergies, and cultural/dietary
          preferences are collected.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {childrenList.map((child) => (
          <div
            key={child.id}
            className="rounded-xl border border-slate-200 p-4 flex items-start justify-between gap-3"
          >
            <div className="space-y-1 text-sm">
              <p className="font-bold text-slate-900">
                {child.firstName} ·{' '}
                <span className="font-medium text-teal-800">{child.ageBand}</span>
              </p>
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Allergies:</span> {child.allergies}
              </p>
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Dietary:</span> {child.dietaryNotes}
              </p>
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Cultural / Routine:</span>{' '}
                {child.culturalNotes}
              </p>
              {child.specialNeedsFlag && (
                <p className="text-xs font-semibold text-amber-800 pt-0.5">
                  Special needs support requested
                  {child.specialNeedsDetails ? `: ${child.specialNeedsDetails}` : ''}
                </p>
              )}
            </div>
            {childrenList.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveChild(child.id)}
                aria-label={`Remove ${child.firstName}`}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-4 space-y-3">
        <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <UserPlus className="w-4 h-4 text-teal-700" />
          <span>Add Child (Minimal Record)</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="First name only"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            className="min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm"
            required
          />
          <select
            value={ageBand}
            onChange={(e) => setAgeBand(e.target.value as AgeBand)}
            className="min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm bg-white"
          >
            {AGE_BANDS.map((band) => (
              <option key={band} value={band}>
                {band}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Allergies (e.g. None, Peanut)"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm"
          />
          <input
            type="text"
            placeholder="Dietary (e.g. Halal, Vegetarian)"
            value={dietaryNotes}
            onChange={(e) => setDietaryNotes(e.target.value)}
            className="min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <input
            type="text"
            placeholder="Cultural or bedtime routine notes (optional)"
            value={culturalNotes}
            onChange={(e) => setCulturalNotes(e.target.value)}
            className="flex-1 min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm"
          />
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 min-h-[44px]">
            <input
              type="checkbox"
              checked={specialNeedsFlag}
              onChange={(e) => setSpecialNeedsFlag(e.target.checked)}
              className="w-4 h-4 accent-teal-700"
            />
            <span>Special needs support</span>
          </label>
          <button
            type="submit"
            className="min-h-[44px] px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold"
          >
            Add Child
          </button>
        </div>
      </form>
    </section>
  );
};
