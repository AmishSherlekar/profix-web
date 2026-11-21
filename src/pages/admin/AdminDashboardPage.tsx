import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
  getAllUsers,
  getAllProfessionals,
  getAllCategories,
  createCategory,
  toggleCategoryStatus,
  verifyProfessional,
} from '@/services/firestore/api'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  Tag,
  Plus,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Polling requirement: Admin dashboard every 30 seconds
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: getAllUsers,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  })

  const { data: pros = [], isLoading: prosLoading } = useQuery({
    queryKey: ['adminPros'],
    queryFn: getAllProfessionals,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  })

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: getAllCategories,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  })

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [catName, setCatName] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [catSubmitting, setCatSubmitting] = useState(false)

  // Verification reason prompt
  const [verifyError, setVerifyError] = useState<string | null>(null)

  const handleVerify = async (proId: string, status: 'VERIFIED' | 'REJECTED') => {
    if (!user) return
    const reason = prompt(
      `Enter admin reason/notes for ${status === 'VERIFIED' ? 'approving' : 'rejecting'}:`,
      status === 'VERIFIED' ? 'Application criteria verified.' : 'Insufficient experience details.'
    )
    if (!reason) return

    setVerifyError(null)
    try {
      await verifyProfessional(user.uid, proId, status, reason)
      queryClient.invalidateQueries({ queryKey: ['adminPros'] })
    } catch (err: any) {
      setVerifyError(err.message || 'Verification update failed')
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setCatSubmitting(true)
    try {
      await createCategory(catName, catDesc)
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] })
      setIsCatModalOpen(false)
      setCatName('')
      setCatDesc('')
    } catch (err: any) {
      alert(err.message || 'Failed to create category')
    } finally {
      setCatSubmitting(false)
    }
  }

  const handleToggleCategory = async (catId: string, current: boolean) => {
    await toggleCategoryStatus(catId, !current)
    queryClient.invalidateQueries({ queryKey: ['adminCategories'] })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-left">
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">Admin Platform Dashboard</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Manual professional verification, service catalog governance, and user role inspection.
        </p>
      </div>

      {verifyError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{verifyError}</span>
        </div>
      )}

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Users
          </span>
          <div className="text-3xl font-extrabold text-slate-900">{users.length}</div>
          <p className="text-xs text-slate-400">Registered customers, pros & staff</p>
        </Card>

        <Card className="p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Verifications
          </span>
          <div className="text-3xl font-extrabold text-amber-600">
            {pros.filter((p) => p.verificationStatus === 'PENDING').length}
          </div>
          <p className="text-xs text-slate-400">Applications awaiting manual approval</p>
        </Card>

        <Card className="p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Categories
          </span>
          <div className="text-3xl font-extrabold text-blue-600">
            {categories.filter((c) => c.isActive).length}
          </div>
          <p className="text-xs text-slate-400">Governed trade specializations</p>
        </Card>
      </div>

      {/* Professional Verification Queue */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Professional Verification Queue</h2>
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-3.5">Professional</th>
                  <th className="px-6 py-3.5">Experience</th>
                  <th className="px-6 py-3.5">Service Area</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pros.map((pro) => (
                  <tr key={pro.userId} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {pro.user?.fullName || pro.userId.slice(0, 8)}
                      <div className="text-xs font-normal text-slate-400">{pro.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{pro.experienceYears || 0} years</td>
                    <td className="px-6 py-4 text-slate-600">{pro.serviceArea || 'Not specified'}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          pro.verificationStatus === 'VERIFIED'
                            ? 'success'
                            : pro.verificationStatus === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {pro.verificationStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {pro.verificationStatus !== 'VERIFIED' && (
                        <Button
                          size="sm"
                          onClick={() => handleVerify(pro.userId, 'VERIFIED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs px-2.5 py-1"
                        >
                          Approve
                        </Button>
                      )}
                      {pro.verificationStatus !== 'REJECTED' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleVerify(pro.userId, 'REJECTED')}
                          className="text-xs px-2.5 py-1"
                        >
                          Reject
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Service Category Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Service Categories</h2>
          <Button size="sm" onClick={() => setIsCatModalOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="p-5 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                  <Badge variant={cat.isActive ? 'success' : 'neutral'}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">{cat.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleCategory(cat.id, cat.isActive)}
                  className="text-xs"
                >
                  {cat.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Category Modal */}
      <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title="Create Category">
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Category Name"
            required
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="E.g., HVAC & Cooling"
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category Description
            </label>
            <textarea
              required
              rows={3}
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              placeholder="Describe the trade requirements..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsCatModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={catSubmitting}>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
