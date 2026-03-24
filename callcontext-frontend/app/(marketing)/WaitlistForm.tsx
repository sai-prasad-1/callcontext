'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurant / Food Service' },
  { value: 'retail', label: 'Retail Store' },
  { value: 'salon', label: 'Salon / Spa' },
  { value: 'service', label: 'Service Business' },
  { value: 'healthcare', label: 'Healthcare / Clinic' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'other', label: 'Other' }
];

export function WaitlistForm() {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    businessName: '',
    businessType: '',
    referralSource: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [position, setPosition] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.fullName,
          phone: formData.phone,
          business_name: formData.businessName,
          business_type: formData.businessType,
          referral_source: formData.referralSource
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      setStatus('success');
      setPosition(data.position);
      
      // Reset form
      setFormData({
        email: '',
        fullName: '',
        phone: '',
        businessName: '',
        businessType: '',
        referralSource: ''
      });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-teal-400/30 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4 font-display">
          You're on the list!
        </h3>
        <p className="text-lg text-teal-100 mb-6">
          {position && (
            <>You're <span className="font-bold text-white">#{position}</span> on our waitlist. </>
          )}
          We'll notify you when your spot opens up.
        </p>
        <div className="bg-teal-500/20 border border-teal-400/30 rounded-xl p-4">
          <p className="text-sm text-teal-100">
            🎁 <span className="font-semibold text-white">Exclusive offer:</span> Early access members get 50% off for 6 months!
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-teal-400/30">
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Input
          type="text"
          label="Full Name"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
          required
          className="bg-white/90"
        />
        <Input
          type="email"
          label="Email"
          placeholder="john@business.com"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
          className="bg-white/90"
        />
        <Input
          type="tel"
          label="Phone Number"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="bg-white/90"
        />
        <Input
          type="text"
          label="Business Name"
          placeholder="Acme Coffee Shop"
          value={formData.businessName}
          onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
          className="bg-white/90"
        />
        <Select
          label="Business Type"
          options={BUSINESS_TYPES}
          value={formData.businessType}
          onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
          placeholder="Select your business type"
          className="bg-white/90"
        />
        <Input
          type="text"
          label="How did you hear about us?"
          placeholder="Google, friend, social media..."
          value={formData.referralSource}
          onChange={(e) => setFormData(prev => ({ ...prev, referralSource: e.target.value }))}
          className="bg-white/90"
        />
      </div>

      {status === 'error' && (
        <div className="mb-6 bg-red-500/20 border border-red-400/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-100">{errorMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={status === 'loading'}
        disabled={status === 'loading'}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-xl shadow-blue-500/30"
      >
        {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
      </Button>

      <p className="text-xs text-slate-300 mt-4 text-center">
        By joining, you agree to receive updates about CallContext. Unsubscribe anytime.
      </p>
    </form>
  );
}
