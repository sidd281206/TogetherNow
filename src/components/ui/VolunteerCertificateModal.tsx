'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Printer,
  Award,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  Download
} from 'lucide-react'
import QRCode from 'qrcode'
import { Applicant, Opportunity } from './OpportunitiesFeed'

interface VolunteerCertificateModalProps {
  isOpen: boolean
  onClose: () => void
  volunteerName: string
  volunteerEmail?: string
  applicant: Applicant
  opportunity?: Opportunity
}

export default function VolunteerCertificateModal({
  isOpen,
  onClose,
  volunteerName,
  volunteerEmail,
  applicant,
  opportunity,
}: VolunteerCertificateModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  const certId = `TN-CERT-${applicant.id.slice(0, 8).toUpperCase()}-${(applicant.eventId || 'EVT').slice(0, 4).toUpperCase()}`
  const eventTitle = opportunity?.title || applicant.eventTitle || 'Community Volunteer Initiative'
  const orgName = opportunity?.organization || 'Verified Community Organization'
  const eventCategory = opportunity?.category || 'Community Welfare'
  const location = opportunity?.location || 'Mumbai, India'
  const rawDate = opportunity?.date || applicant.attendanceMarkedAt
  const formattedEventDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Completed Drive'
  const markedAtDate = applicant.attendanceMarkedAt
    ? new Date(applicant.attendanceMarkedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : formattedEventDate

  useEffect(() => {
    if (!isOpen) return
    const verifyUrl = `https://togethernow.org/verify?cert=${encodeURIComponent(certId)}&volunteer=${encodeURIComponent(volunteerName || applicant.name)}&event=${encodeURIComponent(eventTitle)}`
    QRCode.toDataURL(verifyUrl, {
      margin: 1,
      scale: 4,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Failed to generate cert QR code:', err))
  }, [isOpen, certId, volunteerName, applicant.name, eventTitle])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const displayName = volunteerName || applicant.name || 'Dedicated Volunteer'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          animation: 'slideUpCert 0.2s ease',
        }}
      >
        {/* Top Control Bar (Hidden on Print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 22px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>Official Participation Certificate</span>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#065f46', color: '#a7f3d0', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
              Attendance Verified
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              id="cert-print-btn"
              type="button"
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.35)',
                transition: 'opacity 0.15s',
              }}
            >
              <Printer style={{ width: '14px', height: '14px' }} />
              <span>Download / Print Certificate (PDF)</span>
            </button>

            <button
              id="cert-modal-close"
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              title="Close modal"
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        {/* Certificate Container */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#f8fafc' }}>
          <div
            id="volunteer-certificate-printable"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '10px solid #064e3b',
              outline: '3px solid #d97706',
              outlineOffset: '-6px',
              padding: '40px 48px',
              position: 'relative',
              boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
              color: '#0f172a',
              fontFamily: '"Georgia", "Times New Roman", serif',
              textAlign: 'center',
              overflow: 'hidden',
              minHeight: '580px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Watermark Logo in Background */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.035,
                pointerEvents: 'none',
                fontSize: '320px',
                lineHeight: 1,
                userSelect: 'none',
                fontFamily: 'sans-serif',
              }}
            >
              💛
            </div>

            {/* Corner Decorative Ornaments */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', width: '24px', height: '24px', borderTop: '3px solid #d97706', borderLeft: '3px solid #d97706' }} />
            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '24px', height: '24px', borderTop: '3px solid #d97706', borderRight: '3px solid #d97706' }} />
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '24px', height: '24px', borderBottom: '3px solid #d97706', borderLeft: '3px solid #d97706' }} />
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '24px', height: '24px', borderBottom: '3px solid #d97706', borderRight: '3px solid #d97706' }} />

            {/* Certificate Header */}
            <div>
              {/* TogetherNow Brand Header */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <Heart style={{ width: '20px', height: '20px', fill: '#ffffff' }} />
                </span>
                <span
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                    color: '#064e3b',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  TOGETHER<span style={{ color: '#d97706' }}>NOW</span>
                </span>
              </div>

              <p
                style={{
                  margin: '0 auto 18px',
                  fontSize: '0.74rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: '#64748b',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                National Community Volunteering &amp; Grassroots Action Network
              </p>

              {/* Certificate Main Title */}
              <h1
                style={{
                  margin: '0 0 6px',
                  fontSize: '2.1rem',
                  fontWeight: 900,
                  color: '#064e3b',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Certificate of Participation
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '0 auto 16px' }}>
                <div style={{ width: '48px', height: '1.5px', backgroundColor: '#d97706' }} />
                <span style={{ fontSize: '0.82rem', letterSpacing: '0.12em', color: '#b45309', textTransform: 'uppercase', fontWeight: 800, fontFamily: 'system-ui, sans-serif' }}>
                  ★ Exemplary Community Service ★
                </span>
                <div style={{ width: '48px', height: '1.5px', backgroundColor: '#d97706' }} />
              </div>

              <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#475569', fontStyle: 'italic' }}>
                This is proudly presented with sincere appreciation to
              </p>

              {/* Recipient Volunteer's Name */}
              <div style={{ margin: '0 auto 12px', display: 'inline-block' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '2.2rem',
                    fontWeight: 900,
                    color: '#0f172a',
                    letterSpacing: '0.02em',
                    fontFamily: '"Georgia", "Palatino", serif',
                    textDecoration: 'none',
                    paddingBottom: '4px',
                    borderBottom: '2.5px solid #d97706',
                  }}
                >
                  {displayName}
                </h2>
              </div>

              {/* Citation Body */}
              <p
                style={{
                  margin: '0 auto 16px',
                  maxWidth: '680px',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  color: '#334155',
                }}
              >
                in grateful recognition of their active, dedicated participation and verified on-ground contributions to
              </p>

              {/* Event Name & Host Organization */}
              <div
                style={{
                  margin: '0 auto 20px',
                  padding: '12px 24px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '12px',
                  border: '1.5px solid #a7f3d0',
                  display: 'inline-block',
                  maxWidth: '720px',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 4px',
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    color: '#064e3b',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  {eventTitle}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontFamily: 'system-ui, sans-serif',
                  }}
                >
                  <Building2 style={{ width: '14px', height: '14px' }} />
                  <span>Organized by: <strong>{orgName}</strong></span>
                </p>
              </div>

              {/* Key Event Details Pills */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                  marginBottom: '26px',
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '0.78rem',
                  color: '#475569',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '8px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                  <Calendar style={{ width: '13px', height: '13px', color: '#059669' }} />
                  <span>Date: <strong>{formattedEventDate}</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '8px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                  <MapPin style={{ width: '13px', height: '13px', color: '#059669' }} />
                  <span>Location: <strong>{location}</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '8px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' }}>
                  <CheckCircle2 style={{ width: '13px', height: '13px', color: '#059669' }} />
                  <span>Status: <strong>Attendance Marked Present</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}>
                  <Clock style={{ width: '13px', height: '13px', color: '#d97706' }} />
                  <span>Service Credited: <strong>4 Volunteer Hours</strong></span>
                </div>
              </div>
            </div>

            {/* Certificate Signatures & Official Gold Seal */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 1.2fr',
                gap: '20px',
                alignItems: 'flex-end',
                borderTop: '1.5px solid #e2e8f0',
                paddingTop: '20px',
                marginTop: '10px',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {/* Left: Organization Signatory */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: '"Brush Script MT", "Caveat", "Segoe Script", cursive',
                    fontSize: '1.5rem',
                    color: '#064e3b',
                    minHeight: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {applicant.attendanceMarkedBy || orgName.split(' ')[0]}
                </div>
                <div style={{ width: '180px', height: '1.5px', backgroundColor: '#94a3b8', margin: '4px auto 6px' }} />
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                  {applicant.attendanceMarkedBy || 'Authorized Event Coordinator'}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                  {orgName}
                </p>
              </div>

              {/* Center: Official Embossed Seal */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #fde68a 0%, #d97706 70%, #92400e 100%)',
                    border: '3px solid #ffffff',
                    boxShadow: '0 4px 16px rgba(217, 119, 6, 0.4), inset 0 2px 4px rgba(255,255,255,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    position: 'relative',
                  }}
                >
                  <Award style={{ width: '28px', height: '28px', color: '#ffffff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
                  <span style={{ fontSize: '0.52rem', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                    Verified
                  </span>
                </div>
                <span style={{ marginTop: '6px', fontSize: '0.68rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Official Digital Seal
                </span>
              </div>

              {/* Right: TogetherNow Signatory & QR Verification */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: '"Brush Script MT", "Caveat", "Segoe Script", cursive',
                    fontSize: '1.5rem',
                    color: '#064e3b',
                    minHeight: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  TogetherNow Program Board
                </div>
                <div style={{ width: '180px', height: '1.5px', backgroundColor: '#94a3b8', margin: '4px auto 6px' }} />
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                  Director of Community Action
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                  TogetherNow Foundation
                </p>
              </div>
            </div>

            {/* Bottom Authenticity Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '12px',
                marginTop: '16px',
                fontSize: '0.68rem',
                color: '#64748b',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>Certificate ID: </span>
                <code style={{ fontFamily: 'monospace', fontWeight: 700, color: '#065f46' }}>{certId}</code>
                <span style={{ margin: '0 6px' }}>•</span>
                <span>Issued on: {markedAtDate}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {qrCodeUrl && (
                  <img
                    src={qrCodeUrl}
                    alt="Certificate QR Verification"
                    style={{ width: '36px', height: '36px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  />
                )}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 800, color: '#065f46', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldCheck style={{ width: '12px', height: '12px' }} />
                    Verified Electronic Record
                  </span>
                  <span>verify at togethernow.org/verify</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUpCert {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          body * {
            visibility: hidden !important;
          }
          #volunteer-certificate-printable, #volunteer-certificate-printable * {
            visibility: visible !important;
          }
          #volunteer-certificate-printable {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 40px !important;
            box-shadow: none !important;
            border: 10px solid #064e3b !important;
            outline: 3px solid #d97706 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
