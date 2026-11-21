import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getProfessionalProfile,
  updateProfessionalProfile,
} from '@/services/firestore/api'
import { ProfessionalProfile, AvailabilityStatus } from '@/types'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ShieldCheck, AlertCircle, CheckCircle, MapPin } from 'lucide-react'

export const EditProfilePage: React.FC = () => {
  const { user, profile } = useAuth()
  const [pro, setPro] = useState<ProfessionalProfile | null>(null)
  const [bio, setBio] = useState('')
  const [experienceYears, setExperienceYears] = useState(1)
  const [serviceArea, setServiceArea] = useState('')
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('AVAILABLE')
  const [latitude, setLatitude] = useState(28.6139)
  const [longitude, setLongitude] = useState(77.2090)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const data = await getProfessionalProfile(user.uid)
        if (data) {
          setPro(data)
          setBio(data.bio || '')
          setExperienceYears(data.experienceYears || 1)
          setServiceArea(data.serviceArea || '')
          setAvailabilityStatus(data.availabilityStatus || 'AVAILABLE')
          setLatitude(data.latitude || 28.6139)
          setLongitude(data.longitude || 77.2090)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSuccess(false)
    setSaving(true)

    try {
      await updateProfessionalProfile(user.uid, {
        bio,
        experienceYears: Number(experienceYears),
        serviceArea,
        availabilityStatus,
        latitude: Number(latitude),
        longitude: Number(longitude),
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Professional Profile & Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Keep your details updated so clients can discover and book your services.
        </p>
      </div>

      {/* Verification Status Banner */}
      <div className="p-4 rounded-xl border flex items-center justify-between bg-white">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Verification Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-slate-800">
              {pro?.verificationStatus === 'VERIFIED'
                ? 'Fully Verified Professional'
                : pro?.verificationStatus === 'REJECTED'
                ? 'Application Needs Attention'
                : 'Pending Admin Review'}
            </span>
            <Badge
              variant={
                pro?.verificationStatus === 'VERIFIED'
                  ? 'success'
                  : pro?.verificationStatus === 'REJECTED'
                  ? 'danger'
                  : 'warning'
              }
            >
              {pro?.verificationStatus}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-slate-400 max-w-xs text-right">
          Admin manual verification ensures platform trust and client safety.
        </p>
      </div>

      <Card className="p-8">
        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile successfully updated!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Availability Status
            </label>
            <select
              value={availabilityStatus}
              onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              <option value="AVAILABLE">AVAILABLE - Ready to accept requests</option>
              <option value="BUSY">BUSY - Temporarily booked</option>
              <option value="UNAVAILABLE">UNAVAILABLE - Not accepting jobs</option>
            </select>
          </div>

          <Input
            label="Years of Trade Experience"
            type="number"
            min={0}
            max={60}
            required
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
          />

          <Input
            label="Service Coverage Area / Neighborhood"
            required
            placeholder="E.g., North District, Metro Center, South Suburbs"
            value={serviceArea}
            onChange={(e) => setServiceArea(e.target.value)}
          />

          {/* Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              required
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              required
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline"
            >
              <MapPin className="w-3.5 h-3.5" />
              Set coordinates from current device location
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Professional Bio & Credentials
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Detail your specializations, tools, and background in plumbing or electrical repairs..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
