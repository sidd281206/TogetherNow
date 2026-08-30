'use client'

import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Sparkles, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  Award, 
  Clock, 
  Heart, 
  X, 
  Plus, 
  Trash2, 
  Check, 
  ImageIcon, 
  History, 
  Eye, 
  Upload, 
  ShieldCheck,
  Save,
  CheckCircle2
} from 'lucide-react'
import { 
  OrganizationProfileData, 
  OrgGalleryItem, 
  OrgPastEvent, 
  getOrganizationProfile, 
  saveOrganizationProfile 
} from '@/lib/organizations'
import OrganizationAboutModal from '@/components/ui/OrganizationAboutModal'

interface OrganizationAboutEditorModalProps {
  isOpen: boolean
  onClose: () => void
  organizationName: string
  organizationId?: string
}

export default function OrganizationAboutEditorModal({
  isOpen,
  onClose,
  organizationName,
  organizationId,
}: OrganizationAboutEditorModalProps) {
  const [formData, setFormData] = useState<OrganizationProfileData | null>(null)
  const [activeTab, setActiveTab] = useState<'general' | 'stats' | 'gallery' | 'pastEvents' | 'contact'>('general')
  const [showLivePreview, setShowLivePreview] = useState(false)
  const [isSavedToast, setIsSavedToast] = useState(false)

  // New gallery item state
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [newPhotoTitle, setNewPhotoTitle] = useState('')
  const [newPhotoDate, setNewPhotoDate] = useState('')
  const [newPhotoCaption, setNewPhotoCaption] = useState('')

  // New past event state
  const [newEvTitle, setNewEvTitle] = useState('')
  const [newEvDate, setNewEvDate] = useState('')
  const [newEvCategory, setNewEvCategory] = useState<'Environment' | 'Education' | 'Health' | 'Community' | 'Tech' | 'Crisis Support'>('Environment')
  const [newEvDesc, setNewEvDesc] = useState('')
  const [newEvImpact, setNewEvImpact] = useState('')
  const [newEvAttendees, setNewEvAttendees] = useState<number>(50)
  const [newEvImg, setNewEvImg] = useState('')

  // Cause tag input
  const [newCauseInput, setNewCauseInput] = useState('')

  useEffect(() => {
    if (isOpen && organizationName) {
      const data = getOrganizationProfile(organizationName, organizationId)
      setFormData(JSON.parse(JSON.stringify(data)))
    }
  }, [isOpen, organizationName, organizationId])

  if (!isOpen || !formData) return null

  const handleFileUploadForGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewPhotoUrl(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileUploadForPastEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewEvImg(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPhotoUrl.trim() || !newPhotoTitle.trim()) return

    const newItem: OrgGalleryItem = {
      id: `gal-${Date.now()}`,
      url: newPhotoUrl.trim(),
      title: newPhotoTitle.trim(),
      date: newPhotoDate.trim() || 'Recent',
      caption: newPhotoCaption.trim(),
    }

    setFormData((prev) => prev ? {
      ...prev,
      gallery: [newItem, ...(prev.gallery || [])],
    } : null)

    setNewPhotoUrl('')
    setNewPhotoTitle('')
    setNewPhotoDate('')
    setNewPhotoCaption('')
  }

  const handleRemoveGalleryItem = (id: string) => {
    setFormData((prev) => prev ? {
      ...prev,
      gallery: (prev.gallery || []).filter((g) => g.id !== id),
    } : null)
  }

  const handleAddPastEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvTitle.trim() || !newEvDesc.trim()) return

    const newEvent: OrgPastEvent = {
      id: `past-${Date.now()}`,
      title: newEvTitle.trim(),
      date: newEvDate.trim() || 'Recent',
      category: newEvCategory,
      description: newEvDesc.trim(),
      attendeesCount: Number(newEvAttendees) || 0,
      impactSummary: newEvImpact.trim(),
      imageUrl: newEvImg.trim() || undefined,
    }

    setFormData((prev) => prev ? {
      ...prev,
      pastEvents: [newEvent, ...(prev.pastEvents || [])],
    } : null)

    setNewEvTitle('')
    setNewEvDate('')
    setNewEvDesc('')
    setNewEvImpact('')
    setNewEvAttendees(50)
    setNewEvImg('')
  }

  const handleRemovePastEvent = (id: string) => {
    setFormData((prev) => prev ? {
      ...prev,
      pastEvents: (prev.pastEvents || []).filter((p) => p.id !== id),
    } : null)
  }

  const handleAddCause = () => {
    if (!newCauseInput.trim()) return
    const cause = newCauseInput.trim()
    if (!formData.causes.includes(cause)) {
      setFormData((prev) => prev ? { ...prev, causes: [...prev.causes, cause] } : null)
    }
    setNewCauseInput('')
  }

  const handleRemoveCause = (cause: string) => {
    setFormData((prev) => prev ? { ...prev, causes: prev.causes.filter((c) => c !== cause) } : null)
  }

  const handleSaveAndPublish = () => {
    if (!formData) return
    saveOrganizationProfile(formData, organizationId)
    setIsSavedToast(true)
    setTimeout(() => {
      setIsSavedToast(false)
      onClose()
    }, 1200)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white m-0">
                    Maintain Organization About Us & Profile
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                    Public Facing
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 m-0 mt-0.5">
                  Volunteers view this when clicking <strong>"Know More"</strong> next to your organization name.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLivePreview(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-950 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800/60 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview as Volunteer</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/20 overflow-x-auto no-scrollbar shrink-0">
            {[
              { key: 'general', label: 'Story & Mission', icon: Building2 },
              { key: 'stats', label: 'Impact Milestones', icon: Award },
              { key: 'gallery', label: `Photo Gallery (${formData.gallery?.length || 0})`, icon: ImageIcon },
              { key: 'pastEvents', label: `Previous Events (${formData.pastEvents?.length || 0})`, icon: History },
              { key: 'contact', label: 'Contact & Venue', icon: Phone },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* ============================================================ */}
            {/* TAB 1: STORY & MISSION */}
            {/* ============================================================ */}
            {activeTab === 'general' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Organization Display Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Tagline / Motto *
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="e.g. Preserving Marine Wildlife & Coastal Ecosystems"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      NGO Registration Number
                    </label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      placeholder="e.g. NGO-MH-2018-092841"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Founded Year
                    </label>
                    <input
                      type="text"
                      value={formData.foundedYear}
                      onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                      placeholder="e.g. 2018"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    About the Organization (Story & Work Overview) *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    placeholder="Describe your organization's history, field operations, and impact..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Mission Statement *
                    </label>
                    <textarea
                      rows={3}
                      value={formData.mission}
                      onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                      placeholder="What is your organization's primary mission?"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Vision Statement *
                    </label>
                    <textarea
                      rows={3}
                      value={formData.vision}
                      onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                      placeholder="What future are you building towards?"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Focus Causes Tags */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Supported Causes & Domains
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {formData.causes.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800"
                      >
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCause(c)}
                          className="text-emerald-700 dark:text-emerald-300 hover:text-rose-600 border-none bg-transparent cursor-pointer p-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCauseInput}
                      onChange={(e) => setNewCauseInput(e.target.value)}
                      placeholder="Add focus tag (e.g. Wildlife Protection, Education, Health)..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCause()
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCause}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
                    >
                      Add Tag
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 2: IMPACT MILESTONES & NUMBERS */}
            {/* ============================================================ */}
            {activeTab === 'stats' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200">
                  <span className="font-bold">🌟 Build Volunteer Trust with Real Numbers</span>
                  <p className="m-0 mt-0.5 text-indigo-800 dark:text-indigo-300 text-[11px]">
                    Highlight your cumulative progress. These figures appear prominently on your public About Us showcase.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Total Volunteers Mobilized
                    </label>
                    <input
                      type="number"
                      value={formData.stats.volunteersCount}
                      onChange={(e) => setFormData({
                        ...formData,
                        stats: { ...formData.stats, volunteersCount: Number(e.target.value) || 0 }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Total Drives Completed
                    </label>
                    <input
                      type="number"
                      value={formData.stats.drivesCompleted}
                      onChange={(e) => setFormData({
                        ...formData,
                        stats: { ...formData.stats, drivesCompleted: Number(e.target.value) || 0 }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Total Impact / Volunteer Hours
                    </label>
                    <input
                      type="number"
                      value={formData.stats.hoursVolunteered}
                      onChange={(e) => setFormData({
                        ...formData,
                        stats: { ...formData.stats, hoursVolunteered: Number(e.target.value) || 0 }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Estimated Beneficiaries / Lives Impacted
                    </label>
                    <input
                      type="number"
                      value={formData.stats.peopleImpacted}
                      onChange={(e) => setFormData({
                        ...formData,
                        stats: { ...formData.stats, peopleImpacted: Number(e.target.value) || 0 }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 3: PHOTO GALLERY MANAGER */}
            {/* ============================================================ */}
            {activeTab === 'gallery' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Add Photo Form */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 m-0 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-600" /> Add Ground Action Photograph
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        Photo Title / Drive Name *
                      </label>
                      <input
                        type="text"
                        value={newPhotoTitle}
                        onChange={(e) => setNewPhotoTitle(e.target.value)}
                        placeholder="e.g. Versova Beach Mega Cleanup Drive"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        Date / Period
                      </label>
                      <input
                        type="text"
                        value={newPhotoDate}
                        onChange={(e) => setNewPhotoDate(e.target.value)}
                        placeholder="e.g. July 2026"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Photo URL or Upload File *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        placeholder="Paste image URL (https://...)"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
                      />
                      <label className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs border border-indigo-200 dark:border-indigo-800 cursor-pointer flex items-center gap-1 shrink-0 transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUploadForGallery}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Caption / Short Description
                    </label>
                    <input
                      type="text"
                      value={newPhotoCaption}
                      onChange={(e) => setNewPhotoCaption(e.target.value)}
                      placeholder="e.g. 200 volunteers gathered to remove 3.2 tons of plastic waste."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddGalleryItem}
                      disabled={!newPhotoUrl.trim() || !newPhotoTitle.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl border-none cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add to Gallery
                    </button>
                  </div>
                </div>

                {/* Existing Gallery List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 m-0">
                    Uploaded Gallery Photos ({formData.gallery?.length || 0})
                  </h4>

                  {(!formData.gallery || formData.gallery.length === 0) ? (
                    <div className="text-center py-8 text-xs text-gray-400">
                      No photos added to gallery yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.gallery.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3"
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            <img
                              src={item.url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="space-y-0.5 flex-1 min-w-0">
                            <h5 className="font-bold text-xs text-gray-900 dark:text-white m-0 truncate">
                              {item.title}
                            </h5>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 m-0 truncate">
                              {item.caption || item.date || 'No caption'}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryItem(item.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors border-none bg-transparent cursor-pointer shrink-0"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 4: PREVIOUS EVENTS & WORK */}
            {/* ============================================================ */}
            {activeTab === 'pastEvents' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Add Past Event Form */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 m-0 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-600" /> Log a Previous Event / Concluded Drive
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        Drive Title *
                      </label>
                      <input
                        type="text"
                        value={newEvTitle}
                        onChange={(e) => setNewEvTitle(e.target.value)}
                        placeholder="e.g. Monsoon Coastline Rescue & Cleanup"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        Category
                      </label>
                      <select
                        value={newEvCategory}
                        onChange={(e) => setNewEvCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
                      >
                        {['Environment', 'Education', 'Health', 'Community', 'Tech', 'Crisis Support'].map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        Date of Event
                      </label>
                      <input
                        type="text"
                        value={newEvDate}
                        onChange={(e) => setNewEvDate(e.target.value)}
                        placeholder="e.g. July 18, 2026"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        Number of Volunteers Attended
                      </label>
                      <input
                        type="number"
                        value={newEvAttendees}
                        onChange={(e) => setNewEvAttendees(Number(e.target.value) || 0)}
                        placeholder="e.g. 140"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Event Summary & Highlights *
                    </label>
                    <textarea
                      rows={2}
                      value={newEvDesc}
                      onChange={(e) => setNewEvDesc(e.target.value)}
                      placeholder="Summary of what the volunteers accomplished..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Measurable Impact Outcome
                    </label>
                    <input
                      type="text"
                      value={newEvImpact}
                      onChange={(e) => setNewEvImpact(e.target.value)}
                      placeholder="e.g. 2.8 tons of waste intercepted; 1,200 saplings planted"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Event Photo (Optional URL or File)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newEvImg}
                        onChange={(e) => setNewEvImg(e.target.value)}
                        placeholder="Paste image URL (https://...)"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
                      />
                      <label className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs border border-indigo-200 dark:border-indigo-800 cursor-pointer flex items-center gap-1 shrink-0 transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUploadForPastEvent}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddPastEvent}
                      disabled={!newEvTitle.trim() || !newEvDesc.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl border-none cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Previous Event
                    </button>
                  </div>
                </div>

                {/* Existing Past Events List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 m-0">
                    Logged Previous Events ({formData.pastEvents?.length || 0})
                  </h4>

                  {(!formData.pastEvents || formData.pastEvents.length === 0) ? (
                    <div className="text-center py-8 text-xs text-gray-400">
                      No previous events added yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {formData.pastEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                                {ev.category}
                              </span>
                              <span className="text-[11px] text-gray-400">{ev.date}</span>
                            </div>
                            <h5 className="font-bold text-xs text-gray-900 dark:text-white m-0 truncate">
                              {ev.title} ({ev.attendeesCount} volunteers)
                            </h5>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemovePastEvent(ev.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors border-none bg-transparent cursor-pointer shrink-0"
                            title="Remove Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 5: CONTACT & VENUE */}
            {/* ============================================================ */}
            {activeTab === 'contact' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Official Public Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. contact@oceanearthcare.org"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Coordinator Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98201 44521"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Official Website
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="e.g. https://oceanearthcare.org"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      City & State
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Mumbai, Maharashtra"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Registered Office & Headquarters Detailed Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Gate 2 Promenade, Marine Drive Coastal Stretch, Mumbai 400020"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Footer Controls */}
          <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowLivePreview(true)}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs border-none cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Profile</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveAndPublish}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md border-none cursor-pointer flex items-center gap-1.5 transition-all"
              >
                {isSavedToast ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Saved & Published!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save & Update About Us</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Live Preview Modal */}
      {showLivePreview && (
        <OrganizationAboutModal
          isOpen={showLivePreview}
          onClose={() => setShowLivePreview(false)}
          organizationName={formData.name}
          organizationId={organizationId}
        />
      )}
    </>
  )
}
