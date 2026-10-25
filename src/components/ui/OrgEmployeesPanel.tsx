'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  UserCheck, 
  Plus, 
  X, 
  Phone, 
  MapPin, 
  KeyRound, 
  Check, 
  Copy, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  ExternalLink,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'
import { 
  fetchOrgEmployeesAction, 
  createOrgEmployeeAction, 
  OrgEmployee 
} from '@/app/actions/event-manager'

interface OrgEmployeesPanelProps {
  organizationId?: string
  organizationName?: string
  onEmployeesLoaded?: (employees: OrgEmployee[]) => void
}

const STORAGE_KEY = 'togethernow_org_employees_v1'

export default function OrgEmployeesPanel({
  organizationId,
  organizationName = 'Organization',
  onEmployeesLoaded,
}: OrgEmployeesPanelProps) {
  const [employees, setEmployees] = useState<OrgEmployee[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('pass123')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [roleTitle, setRoleTitle] = useState('Event Manager')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Load employees
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        // 1. Check local storage first
        let localList: OrgEmployee[] = []
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (raw) localList = JSON.parse(raw)
        } catch {}

        // 2. Fetch from DB
        const dbList = await fetchOrgEmployeesAction(organizationId)
        const mergedMap = new Map<string, OrgEmployee>()
        
        // Add defaults
        if (dbList && dbList.length > 0) {
          dbList.forEach((e) => mergedMap.set(e.employeeId.toUpperCase(), e))
        }
        localList.forEach((e) => {
          if (!mergedMap.has(e.employeeId.toUpperCase())) {
            mergedMap.set(e.employeeId.toUpperCase(), e)
          }
        })

        const finalEmployees = Array.from(mergedMap.values())
        setEmployees(finalEmployees)
        if (onEmployeesLoaded) onEmployeesLoaded(finalEmployees)
      } catch (err) {
        console.error('Error loading org employees:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [organizationId])

  const handleGenerateCode = () => {
    const randomNum = Math.floor(100 + Math.random() * 900)
    const orgPrefix = organizationName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase() || 'EM'
    setEmployeeId(`${orgPrefix}-${randomNum}`)
  }

  const handleCopyCredentials = (emp: OrgEmployee) => {
    const text = `Event Manager Login:
Employee ID: ${emp.employeeId}
Password: ${emp.password || 'password123'}
Portal URL: ${window.location.origin}/event-manager/login`
    navigator.clipboard.writeText(text)
    setCopiedId(emp.employeeId)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!name.trim() || !phone.trim() || !address.trim() || !employeeId.trim() || !password.trim()) {
      setErrorMsg('Please fill in all required fields (Name, Phone, Address, Employee ID, Password).')
      return
    }

    setSubmitting(true)
    try {
      const res = await createOrgEmployeeAction({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        employeeId: employeeId.trim().toUpperCase(),
        password: password.trim(),
        email: email.trim() || undefined,
        roleTitle: roleTitle.trim() || 'Event Manager',
      })

      if (res.success && res.employee) {
        const updated = [res.employee, ...employees.filter((e) => e.employeeId !== res.employee!.employeeId)]
        setEmployees(updated)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch {}

        setSuccessMsg(`✓ Employee ${res.employee.name} (${res.employee.employeeId}) created successfully!`)
        if (onEmployeesLoaded) onEmployeesLoaded(updated)

        setTimeout(() => {
          setShowAddModal(false)
          setName('')
          setPhone('')
          setAddress('')
          setEmployeeId('')
          setPassword('pass123')
          setEmail('')
          setSuccessMsg(null)
        }, 1200)
      } else {
        // Fallback to local creation if DB has issues
        const newEmp: OrgEmployee = {
          id: `emp-${Date.now()}`,
          organizationId: organizationId || 'org-local',
          employeeId: employeeId.trim().toUpperCase(),
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          roleTitle: roleTitle.trim() || 'Event Manager',
          password: password.trim(),
          email: email.trim(),
          createdAt: new Date().toISOString(),
          isActive: true,
        }

        const updated = [newEmp, ...employees.filter((e) => e.employeeId !== newEmp.employeeId)]
        setEmployees(updated)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch {}

        setSuccessMsg(`✓ Employee ${newEmp.name} (${newEmp.employeeId}) created successfully!`)
        if (onEmployeesLoaded) onEmployeesLoaded(updated)

        setTimeout(() => {
          setShowAddModal(false)
          setName('')
          setPhone('')
          setAddress('')
          setEmployeeId('')
          setPassword('pass123')
          setEmail('')
          setSuccessMsg(null)
        }, 1200)
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save employee.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5 my-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white m-0">
                Staff &amp; Event Managers Directory
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-xs font-bold">
                {employees.length} Members
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 m-0 mt-0.5">
              Manage your event managers and employee IDs. Assign them to events to coordinate volunteers and mark attendance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/event-manager/login"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs transition-colors text-decoration-none"
          >
            <span>Open Event Manager Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => {
              handleGenerateCode()
              setShowAddModal(true)
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all border-none cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Employees Grid */}
      {employees.length === 0 ? (
        <div className="text-center py-10 px-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <Users className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 m-0">No Employees Added Yet</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Add your event managers so they can sign into the Event Manager portal with their unique Employee ID and mark attendance at drives.
          </p>
          <button
            type="button"
            onClick={() => {
              handleGenerateCode()
              setShowAddModal(true)
            }}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs border-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Employee</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {employees.map((emp) => (
            <div
              key={emp.employeeId}
              className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-xs space-y-3 relative group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white m-0">
                      {emp.name}
                    </h4>
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold m-0 mt-0.5">
                    {emp.roleTitle || 'Event Manager'}
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 font-mono font-black text-xs border border-indigo-200 dark:border-indigo-800/60 shadow-xs">
                  {emp.employeeId}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{emp.phone}</span>
                </div>
                {emp.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="truncate">{emp.address}</span>
                  </div>
                )}
                {emp.password && (
                  <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                    <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Pass: <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-[10px]">{emp.password}</code></span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  Portal Login ID: <strong>{emp.employeeId}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCredentials(emp)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                  title="Copy login details for Event Manager"
                >
                  {copiedId === emp.employeeId ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Login</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD EMPLOYEE MODAL */}
      {/* ============================================================ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">
                    Add New Employee / Event Manager
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                    Create their account credentials to log in to the Event Manager portal.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-none bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikramaditya Joshi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98201 55678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. Lead Event Manager"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Physical / Office Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 302, Green Meadows, Andheri East, Mumbai 400069"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Event Manager Portal Credentials *</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline border-none bg-transparent cursor-pointer"
                  >
                    🎲 Suggest Code
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Employee ID / Login Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                      placeholder="e.g. EM-103"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Set password"
                        className="w-full px-3 py-2 pr-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 m-0">
                  The employee will use this Employee ID and Password to sign in at <code>/event-manager/login</code>.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 font-bold">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all border-none cursor-pointer flex items-center gap-2"
                >
                  {submitting ? (
                    <span>Saving Employee...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Employee &amp; Grant Access</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
