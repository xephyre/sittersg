import React, { useState } from 'react';
import { Lock, MessageSquare, Send } from 'lucide-react';
import { Booking, ChatMessage } from '../../types';

interface Props {
  booking: Booking;
  isChatUnlocked: boolean;
  messages: ChatMessage[];
  onSend: (bookingId: string, text: string) => void;
}

export const BookingChatCard: React.FC<Props> = ({
  booking,
  isChatUnlocked,
  messages,
  onSend,
}) => {
  const [chatInput, setChatInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isChatUnlocked || !chatInput.trim()) return;
    onSend(booking.id, chatInput);
    setChatInput('');
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-700" />
          <h3 className="text-base font-bold text-slate-900">In-App Sitter Chat</h3>
        </div>
        <span className="text-xs text-slate-500">
          {isChatUnlocked ? 'Booking channel active' : 'Unlocks once confirmed'}
        </span>
      </div>

      {!isChatUnlocked ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3 text-sm text-slate-600">
          <Lock className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            For safety and privacy, direct messaging unlocks only after the sitter confirms your
            booking.
          </span>
        </div>
      ) : (
        <>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                Say hello to {booking.sitterName} and confirm arrival instructions.
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl p-3 max-w-[85%] text-sm ${
                    m.senderRole === 'parent'
                      ? 'ml-auto bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <p
                    className={`text-[11px] mt-1 font-mono ${
                      m.senderRole === 'parent' ? 'text-teal-100' : 'text-slate-500'
                    }`}
                  >
                    {m.senderName.split(' ')[0]} · {m.sentAt}
                  </p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Message ${booking.sitterName}...`}
              className="flex-1 min-h-[44px] rounded-xl border border-slate-300 px-3.5 text-sm"
            />
            <button
              type="submit"
              className="min-h-[44px] px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold inline-flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </>
      )}
    </section>
  );
};
