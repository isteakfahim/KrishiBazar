'use client';

import React, { useState } from 'react';
import { saveFarmProfile } from '../actions';
import { Tractor, CheckCircle2, AlertCircle } from 'lucide-react';

interface DistrictOption {
  id: string;
  nameBn: string;
  nameEn: string;
}

export function FarmSetupCard({
  districts,
  defaultName,
  defaultPhone,
}: {
  districts: DistrictOption[];
  defaultName: string;
  defaultPhone: string;
}) {
  const [fullName, setFullName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [districtId, setDistrictId] = useState(districts[0]?.id || '');
  const [farmName, setFarmName] = useState('');
  const [landSize, setLandSize] = useState('10');
  const [landUnit, setLandUnit] = useState('Bigha');
  const [mainCrops, setMainCrops] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phone', phone);
    formData.append('districtId', districtId);
    formData.append('farmName', farmName);
    formData.append('landSize', landSize);
    formData.append('landUnit', landUnit);
    formData.append('mainCrops', mainCrops);

    try {
      await saveFarmProfile(formData);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'সংরক্ষণে ত্রুটি হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        <div>
          <h4 className="font-bold text-sm">খামার প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!</h4>
          <p className="text-xs">এখন আপনি সরাসরি আপনার খামারের ফসল তালিকাভুক্ত করতে পারেন।</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[var(--tint)]/60 border border-[var(--green)]/30 space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--green)] text-white flex items-center justify-center shrink-0">
          <Tractor className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold font-heading text-[var(--ink)]">
            খামার ও কৃষক প্রোফাইল সেটআপ করুন
          </h2>
          <p className="text-xs text-[var(--muted)]">
            ক্রেতাদের আস্থা বৃদ্ধি করতে এবং সঠিক পরিবহন ভাড়া নিশ্চিত করতে আপনার খামারের প্রাথমিক তথ্য প্রদান করুন।
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <label className="font-semibold text-[var(--ink)]">কৃষকের নাম *</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-[var(--ink)]">মোবাইল নম্বর *</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-[var(--ink)]">খামারের জেলা *</label>
          <select
            value={districtId}
            onChange={(e) => setDistrictId(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] outline-none"
          >
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameBn} ({d.nameEn})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-[var(--ink)]">খামারের নাম *</label>
          <input
            type="text"
            required
            placeholder="উদা: রহিম এগ্রো ফার্ম"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-[var(--ink)]">জমির পরিমাণ ও একক</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              value={landSize}
              onChange={(e) => setLandSize(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] outline-none"
            />
            <select
              value={landUnit}
              onChange={(e) => setLandUnit(e.target.value)}
              className="p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] outline-none"
            >
              <option value="Bigha">বিঘা</option>
              <option value="Decimal">শতাংশ</option>
              <option value="Acre">একর</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-[var(--ink)]">প্রধান উৎপাদিত ফসল</label>
          <input
            type="text"
            placeholder="উদা: আলু, ধান, টমেটো"
            value={mainCrops}
            onChange={(e) => setMainCrops(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] outline-none"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[var(--green)] text-white font-bold hover:bg-[var(--green-hover)] transition-all disabled:opacity-50"
          >
            {loading ? 'সংরক্ষণ হচ্ছে...' : 'খামার প্রোফাইল নিশ্চিত করুন'}
          </button>
        </div>
      </form>
    </div>
  );
}
