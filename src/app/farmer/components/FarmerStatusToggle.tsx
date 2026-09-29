'use client';

import React, { useState } from 'react';
import { toggleProductAvailability } from '../actions';
import { Eye, EyeOff } from 'lucide-react';

export function FarmerStatusToggle({
  productId,
  initialStatus,
}: {
  productId: string;
  initialStatus: boolean;
}) {
  const [isAvailable, setIsAvailable] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    try {
      setLoading(true);
      const res = await toggleProductAvailability(productId);
      if (res?.success) {
        setIsAvailable(res.isAvailable);
      }
    } catch (err) {
      console.error(err);
      alert('স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 ${
        isAvailable
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          : 'bg-zinc-100 text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
      }`}
      title={isAvailable ? 'পণ্যটি ক্রেতাদের দেখানো হচ্ছে' : 'পণ্যটি বর্তমানে লুকানো আছে'}
    >
      {isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      <span>{isAvailable ? 'সক্রিয়' : 'লুকানো'}</span>
    </button>
  );
}
