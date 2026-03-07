'use client';

import { useState, useRef } from 'react';
import { CheckCircle, ArrowRight, FolderOpen, Camera, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import SpaceBackground from '@/components/SpaceBackground';

const WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/25618535/uwiidgu/';

type FormData = {
  companyName: string;
  fullName: string;
  role: string;
  email: string;
  phone: string;
  website: string;
  officeLocation: string;
  serviceAreas: string;
  maxDriveDistance: string;
  availDays: string;
  service: string;
  startingPrice: string;
  differentiation: string;
  driveLink: string;
  mediaAcknowledge: boolean;
  notes: string;
};

const EMPTY: FormData = {
  companyName: '',
  fullName: '',
  role: '',
  email: '',
  phone: '',
  website: '',
  officeLocation: '',
  serviceAreas: '',
  maxDriveDistance: '',
  availDays: '',
  service: '',
  startingPrice: '',
  differentiation: '',
  driveLink: '',
  mediaAcknowledge: false,
  notes: '',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  padding: '13px 16px',
  color: 'white',
  fontSize: '0.9375rem',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'DM Sans, sans-serif',
};

function InputField({
  label, name, value, onChange, required, type = 'text', placeholder,
}: {
  label: string; name: keyof FormData; value: string; onChange: (k: keyof FormData, v: string) => void;
  required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: '#FE6462', marginLeft: '3px' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(254,100,98,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(254,100,98,0.08)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

function SectionHeader({ number, title, sub }: { number: string; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <span style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(254,100,98,0.2) 0%, rgba(254,100,98,0.08) 100%)',
          border: '1px solid rgba(254,100,98,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.68rem', fontWeight: 800, color: '#FE6462', flexShrink: 0,
          letterSpacing: '0.04em',
        }}>
          {number}
        </span>
        <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1.15rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>
          {title}
        </h2>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.84rem', lineHeight: '1.65', paddingLeft: '42px', margin: 0 }}>
        {sub}
      </p>
    </div>
  );
}

export default function OnboardingPage() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  function set(k: keyof FormData, v: string | boolean) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.service.trim()) {
      setError('Please enter the service you want to drive jobs for.');
      return;
    }
    if (!form.startingPrice.trim()) {
      setError('Please enter your starting price for that service.');
      return;
    }
    if (!form.mediaAcknowledge) {
      setError('Please acknowledge the media preparation note before submitting.');
      return;
    }

    setSubmitting(true);

    const payload = {
      source: 'RevCore Client Onboarding',
      company_name: form.companyName,
      full_name: form.fullName,
      role: form.role,
      email: form.email,
      phone: form.phone,
      website: form.website || '(not provided)',
      office_location: form.officeLocation || '(not provided)',
      service_areas: form.serviceAreas,
      max_drive_distance: form.maxDriveDistance || '(not provided)',
      availability: form.availDays.trim() || '(not specified)',
      service_to_drive: form.service,
      starting_price: form.startingPrice,
      differentiation: form.differentiation || '(not provided)',
      google_drive_link: form.driveLink || '(not provided)',
      media_prepared: form.driveLink ? 'Yes, Drive link provided' : 'No, RevCore will source content',
      notes: form.notes || '(none)',
      submitted_at: new Date().toISOString(),
    };

    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or email us at hello@revcorehq.com.');
    } finally {
      setSubmitting(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '2.5rem',
    marginBottom: '16px',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', fontFamily: 'DM Sans, sans-serif' }}>
      <SpaceBackground fixed />

      {/* All content above the stars */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{
          background: 'rgba(7,11,15,0.92)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '16px 0',
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <img
                  src="https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9af9fb003fa7bb8bb92ee.png"
                  alt="RevCore"
                  style={{ height: '22px', width: 'auto', filter: 'brightness(0) invert(1)' }}
                />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'white', letterSpacing: '-0.01em' }}>RevCore</span>
              </Link>
              <span style={{
                background: 'rgba(148,217,107,0.12)', color: '#94D96B',
                fontSize: '0.62rem', fontWeight: 700,
                padding: '2px 9px', borderRadius: '100px',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                border: '1px solid rgba(148,217,107,0.2)',
              }}>
                Client Onboarding
              </span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>New client, confidential</span>
          </div>
        </div>

        {/* ── Hero ── */}
        <div style={{
          padding: '80px 0 68px', textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Layered glow */}
          <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(254,100,98,0.035) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '200px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(107,142,254,0.02) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div className="container" style={{ maxWidth: '660px', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '5px 14px', borderRadius: '100px',
              background: 'rgba(254,100,98,0.08)', border: '1px solid rgba(254,100,98,0.18)',
              marginBottom: '1.75rem',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FE6462', display: 'block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              <span style={{ color: '#FE6462', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                ONBOARDING FORM
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800,
              lineHeight: 1.08, letterSpacing: '-0.04em', marginBottom: '1.1rem',
            }}>
              <span style={{
                background: 'linear-gradient(90deg, #ffffff 0%, #eddeff 18%, #cfd9ff 38%, #ffffff 55%, #ffd8d7 75%, #eddeff 90%, #ffffff 100%)',
                backgroundSize: '300% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'titleGlow 10s linear infinite',
                display: 'inline',
              }}>
                Welcome to RevCore.
              </span>
              {' '}
              <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.28)' }}>
                Let&apos;s get started.
              </span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.42)', lineHeight: '1.8', fontSize: '1rem', marginBottom: '2.25rem' }}>
              Fill this out before your onboarding call. It takes about 5 minutes and lets us build your system before we even get on the phone.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { label: '~5 min to complete' },
                { label: 'Goes straight to your rep' },
                { label: 'Speeds up your launch' },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '100px', padding: '7px 15px',
                  color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontWeight: 500,
                }}>
                  <CheckCircle size={12} color="#94D96B" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <div style={{ padding: '56px 0 100px' }}>
          <div className="container" style={{ maxWidth: '700px' }}>
            <form ref={formRef} onSubmit={handleSubmit} noValidate>

              {/* Section 01 */}
              <div style={cardStyle}>
                <SectionHeader
                  number="01"
                  title="Company & Contact"
                  sub="Basic info so we can set up your account and reach you before the call."
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <InputField label="Company Name" name="companyName" value={form.companyName} onChange={set} required placeholder="ABC Roofing Co." />
                  <InputField label="Your Full Name" name="fullName" value={form.fullName} onChange={set} required placeholder="John Smith" />
                  <InputField label="Role / Title" name="role" value={form.role} onChange={set} required placeholder="Owner, Sales Manager" />
                  <InputField label="Best Email" name="email" value={form.email} onChange={set} required type="email" placeholder="john@company.com" />
                  <InputField label="Cell Phone" name="phone" value={form.phone} onChange={set} required type="tel" placeholder="(555) 000-0000" />
                  <InputField label="Company Website" name="website" value={form.website} onChange={set} required placeholder="www.company.com" />
                </div>
                <div style={{ marginTop: '14px' }}>
                  <InputField label="Primary Office Location" name="officeLocation" value={form.officeLocation} onChange={set} required placeholder="123 Main St, Dallas, TX 75201" />
                </div>
              </div>

              {/* Section 02 */}
              <div style={cardStyle}>
                <SectionHeader
                  number="02"
                  title="Service Areas & Availability"
                  sub="Tell us where you work and when you're available to run appointments."
                />

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Target Service Areas (cities, zip codes, regions)<span style={{ color: '#FE6462', marginLeft: '3px' }}>*</span>
                  </label>
                  <textarea
                    value={form.serviceAreas}
                    onChange={(e) => set('serviceAreas', e.target.value)}
                    required
                    rows={3}
                    placeholder="e.g. Dallas, Plano, Frisco, Allen TX, zip codes 75201, 75024, 75034, DFW metro area"
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.65' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(254,100,98,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(254,100,98,0.08)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <InputField
                    label="Maximum Distance You're Willing to Drive for an Appointment"
                    name="maxDriveDistance"
                    value={form.maxDriveDistance}
                    onChange={set}
                    required
                    placeholder="e.g. 30 miles, 45 minutes, within county, etc."
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Days Available for Appointments<span style={{ color: '#FE6462', marginLeft: '3px' }}>*</span>
                  </label>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.28)', margin: '0 0 10px', lineHeight: 1.5 }}>Include any day-specific hours if they differ (e.g. Mon to Fri 8am to 5pm, Sat 9am to 1pm)</p>
                  <textarea
                    value={form.availDays}
                    onChange={(e) => set('availDays', e.target.value)}
                    required
                    rows={3}
                    placeholder="e.g. Monday to Friday 8am to 6pm, Saturday 9am to 2pm, closed Sunday"
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.65' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(254,100,98,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(254,100,98,0.08)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>

              </div>

              {/* Section 03 */}
              <div style={cardStyle}>
                <SectionHeader
                  number="03"
                  title="The Service You Want to Drive Jobs For"
                  sub="Tell us the specific service and your starting price. We build your campaigns, software, and presentations around this."
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <InputField
                      label="Service to Drive More Jobs For"
                      name="service"
                      value={form.service}
                      onChange={set}
                      required
                      placeholder="e.g. Roofing, HVAC, Solar, Siding, Gutters"
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <InputField
                      label="Starting Price for This Service"
                      name="startingPrice"
                      value={form.startingPrice}
                      onChange={set}
                      required
                      placeholder="e.g. $8,500, starts at $12k, avg job $25,000"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    What makes your company the best option in your market? <span style={{ color: 'rgba(255,255,255,0.28)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <textarea
                    value={form.differentiation}
                    onChange={(e) => set('differentiation', e.target.value)}
                    rows={3}
                    placeholder="Years in business, warranties, awards, guarantees, specializations, anything that sets you apart."
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.65' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(254,100,98,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(254,100,98,0.08)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Section 04 */}
              <div style={cardStyle}>
                <SectionHeader
                  number="04"
                  title="Media Preparation"
                  sub="Strong ads require real photos and video from your jobs. The more we have, the better your campaigns will perform."
                />

                <div style={{ background: 'rgba(107,142,254,0.06)', border: '1px solid rgba(107,142,254,0.14)', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <Camera size={15} color="#6B8EFE" />
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#6B8EFE', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      What to collect before your call
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      'Before & after photos of completed jobs',
                      'Team photos (on the job, at the truck, etc.)',
                      'Any existing video walkthroughs or reels',
                      'Drone or aerial footage if available',
                      'Customer testimonial photos or videos',
                      'Your logo in high resolution (PNG preferred)',
                    ].map((item) => (
                      <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <CheckCircle size={13} color="#6B8EFE" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.48)', lineHeight: '1.5' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(107,142,254,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <FolderOpen size={14} color="#6B8EFE" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', lineHeight: '1.6', margin: 0 }}>
                        <strong style={{ color: 'rgba(255,255,255,0.68)' }}>How to share:</strong> Create a Google Drive folder, upload everything into it, set sharing to &ldquo;Anyone with the link can view,&rdquo; and paste the link below.
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Google Drive Folder Link <span style={{ color: 'rgba(255,255,255,0.28)', textTransform: 'none', letterSpacing: 0 }}>(optional, share before your call if possible)</span>
                  </label>
                  <input
                    type="url"
                    value={form.driveLink}
                    onChange={(e) => set('driveLink', e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(107,142,254,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(107,142,254,0.08)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => set('mediaAcknowledge', !form.mediaAcknowledge)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    background: form.mediaAcknowledge ? 'rgba(148,217,107,0.07)' : 'rgba(255,255,255,0.03)',
                    border: form.mediaAcknowledge ? '1px solid rgba(148,217,107,0.25)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', padding: '14px 16px',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0, marginTop: '1px',
                    background: form.mediaAcknowledge ? '#94D96B' : 'rgba(255,255,255,0.08)',
                    border: form.mediaAcknowledge ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    {form.mediaAcknowledge && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
                    I understand that if media is not prepared and shared before our onboarding call,{' '}
                    <strong style={{ color: 'rgba(255,255,255,0.72)' }}>RevCore will source and create content for my ads</strong>{' '}
                    as part of the onboarding process.
                  </span>
                </button>
              </div>

              {/* Section 05 */}
              <div style={cardStyle}>
                <SectionHeader
                  number="05"
                  title="Anything Else?"
                  sub="Anything you want your rep to know before the call, existing ad accounts, past agencies, specific goals, concerns, etc."
                />
                <textarea
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  rows={4}
                  placeholder="Optional, share anything relevant"
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.65' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(254,100,98,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(254,100,98,0.08)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(254,100,98,0.08)', border: '1px solid rgba(254,100,98,0.25)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
                  <AlertCircle size={16} color="#FE6462" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '0.875rem', color: '#FE6462', lineHeight: '1.5' }}>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  background: submitting
                    ? 'rgba(254,100,98,0.45)'
                    : 'linear-gradient(135deg, #FE6462 0%, #e84f4d 100%)',
                  color: 'white', border: 'none', borderRadius: '14px', padding: '17px',
                  fontSize: '1rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'opacity 0.2s, transform 0.2s, box-shadow 0.2s',
                  fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.01em',
                  boxShadow: submitting ? 'none' : '0 0 30px rgba(254,100,98,0.25)',
                }}
                onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(254,100,98,0.35)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(254,100,98,0.25)'; }}
              >
                {submitting ? (
                  <>
                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'block', animation: 'spin 0.7s linear infinite' }} />
                    Submitting
                  </>
                ) : (
                  <>Submit Onboarding <ArrowRight size={16} /></>
                )}
              </button>

              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.22)', fontSize: '0.78rem', marginTop: '14px', lineHeight: '1.6' }}>
                This goes directly to your RevCore rep. You&apos;ll hear from us within 24 hours.
              </p>
            </form>
          </div>
        </div>

        {/* ── Success Modal ── */}
        {submitted && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '920px', background: '#0d1117', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1.6fr', boxShadow: '0 40px 120px rgba(0,0,0,0.7)' }}>
              <div style={{ background: 'linear-gradient(160deg, #0f1a0f 0%, #0a0f0a 100%)', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(148,217,107,0.15)', border: '1px solid rgba(148,217,107,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <CheckCircle size={22} color="#94D96B" />
                </div>
                <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: 'white', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '0.875rem' }}>
                  You&apos;re locked in.
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.42)', lineHeight: '1.75', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
                  We received your onboarding form. Your rep will review it before your call and come prepared with a custom plan for your business.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
                  {['Form received, going to your rep now', 'Call prep starts immediately', 'Expect contact within 24 hours'].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={13} color="#94D96B" />
                      <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.48)' }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(148,217,107,0.07)', border: '1px solid rgba(148,217,107,0.15)', borderRadius: '12px', padding: '12px 16px' }}>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', lineHeight: '1.6', margin: 0 }}>
                    <strong style={{ color: 'rgba(255,255,255,0.62)' }}>Didn&apos;t share your Google Drive link?</strong><br />
                    Email it to{' '}
                    <a href="mailto:hello@revcorehq.com" style={{ color: '#94D96B', textDecoration: 'none' }}>hello@revcorehq.com</a>{' '}
                    before your call.
                  </p>
                </div>
              </div>
              <div style={{ background: 'white', minHeight: '560px' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                    Book Your Onboarding Call
                  </p>
                </div>
                <iframe
                  src="https://api.leadconnectorhq.com/widget/booking/NV47jMb2Se8WlgRuKuA5"
                  style={{ width: '100%', border: 'none', minHeight: '510px', display: 'block' }}
                  id="onboarding-calendar"
                />
              </div>
            </div>
          </div>
        )}

      </div>{/* end z-index wrapper */}

      <style>{`
        @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.85); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes titleGlow {
          0%   { background-position: 0% center; }
          100% { background-position: 300% center; }
        }
        .container { padding: 0 clamp(1.25rem, 4vw, 2rem); margin: 0 auto; }
        @media (max-width: 700px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 1.6fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
