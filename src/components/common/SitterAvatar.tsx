import React, { useState } from 'react';
import { Sitter } from '../../types';

interface SitterAvatarProps {
  sitter: Pick<Sitter, 'displayName' | 'avatarUrl' | 'initials' | 'accentTone'>;
  size?: 'sm' | 'md' | 'lg';
}

const TONE_CLASSES: Record<Sitter['accentTone'], string> = {
  teal: 'bg-teal-50 text-teal-800 border-teal-200',
  amber: 'bg-amber-50 text-amber-900 border-amber-200',
  indigo: 'bg-indigo-50 text-indigo-900 border-indigo-200',
  rose: 'bg-rose-50 text-rose-900 border-rose-200',
};

const SIZE_CLASSES = {
  sm: 'w-10 h-10 text-xs',
  md: 'w-14 h-14 text-sm',
  lg: 'w-20 h-20 text-lg',
};

export const SitterAvatar: React.FC<SitterAvatarProps> = ({ sitter, size = 'md' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (sitter.avatarUrl && !imgFailed) {
    return (
      <img
        src={sitter.avatarUrl}
        alt={`${sitter.displayName}, verified SitterSG caregiver`}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`${SIZE_CLASSES[size]} rounded-2xl object-cover shrink-0 border border-slate-200 bg-slate-100`}
      />
    );
  }

  return (
    <div
      aria-label={`${sitter.displayName} avatar`}
      className={`${SIZE_CLASSES[size]} ${TONE_CLASSES[sitter.accentTone]} rounded-2xl border shrink-0 flex items-center justify-center font-semibold tracking-tight`}
    >
      {sitter.initials}
    </div>
  );
};
