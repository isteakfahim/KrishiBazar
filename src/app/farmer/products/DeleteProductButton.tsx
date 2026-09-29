'use client';

import React, { useState } from 'react';
import { deleteFarmerProduct } from '../actions';
import { Trash2 } from 'lucide-react';

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(`আপনি কি নিশ্চিতভাবে "${productName}" ফসলটি তালিকা থেকে মুছে ফেলতে চান?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteFarmerProduct(productId);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'মুছতে ত্রুটি হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
      title="মুছে ফেলুন"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
