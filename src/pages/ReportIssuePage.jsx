import {
  Camera,
  ImageIcon,
  LoaderCircle,
  MapPin,
  Send,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { createComplaint } from '../api/complaints'
import AbstractPageBackground from '../components/AbstractPageBackground'
import AIAnalysisCard from '../components/AIAnalysisCard'

const issueOptions = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'blocked_drain', label: 'Blocked Drain' },
  { value: 'garbage', label: 'Garbage' },
  { value: 'broken_streetlight', label: 'Broken Streetlight' },
  { value: 'water_leakage', label: 'Water Leakage' },
  { value: 'other', label: 'Other' }
]

const initialFormState = {
  issue_type: 'pothole',
  description: '',
  address: 'Mangaluru, Karnataka',
  latitude: 12.9141,
  longitude: 74.8560,
  photo: null,
  photo_url: null
}

export default function ReportIssuePage() {
  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedComplaint, setSubmittedComplaint] = useState(null)
  
const videoRef = useRef(null)
const streamRef = useRef(null)

const [cameraActive, setCameraActive] = useState(false)
const [cameraError, setCameraError] = useState('')
const [photoLocation, setPhotoLocation] = useState(null)
const [photoCapturedAt, setPhotoCapturedAt] = useState(null)

useEffect(() => {
  return () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }
}, [])


  const activeIssueLabel = useMemo(
    () => issueOptions.find((option) => option.value === form.issue_type)?.label || 'Issue',
    [form.issue_type]
  )

  const validateForm = () => {
    const nextErrors = {}

    if (!form.photo) {
    nextErrors.photo = 'Please capture a photo using the camera.'
  }

  if (!photoLocation) {
    nextErrors.photo = 'A photo with GPS location is required.'
  }

    return nextErrors
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleLocationChange = ({ latitude, longitude }) => {
    setForm((current) => ({ ...current, latitude, longitude }))
    setErrors((current) => ({ ...current, latitude: '', longitude: '' }))
  }
  
  
const startCamera = async () => {
  setCameraError('')

  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraError('Camera access requires HTTPS or localhost.')
    return
  }

  try {
    streamRef.current?.getTracks().forEach((track) => track.stop())

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    })

    streamRef.current = stream
    setCameraActive(true)
  } catch {
    setCameraError('Could not access the camera. Please allow camera permission.')
  }
}

useEffect(() => {
  if (cameraActive && videoRef.current && streamRef.current) {
    videoRef.current.srcObject = streamRef.current

    videoRef.current.play().catch(() => {
      setCameraError('Could not start the camera preview.')
    })
  }
}, [cameraActive])

const capturePhoto = () => {
  const video = videoRef.current

  if (!video || !video.videoWidth || !video.videoHeight) {
    setCameraError('Please wait for the camera preview to load.')
    return
  }

const discardPhoto = () => {
  if (form.photo_url) {
    URL.revokeObjectURL(form.photo_url)
  }

  setForm((current) => ({
    ...current,
    photo: null,
    photo_url: null
  }))

  setPhotoLocation(null)
  setPhotoCapturedAt(null)
}

  setCameraError('')

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const context = canvas.getContext('2d')
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob((blob) => {
        if (!blob) {
          setCameraError('Photo capture failed. Please try again.')
          return
        }

        const capturedAt = new Date().toISOString()
        const photo = new File([blob], `civicfix-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        })
        const photoUrl = URL.createObjectURL(photo)

        setForm((current) => ({
          ...current,
          photo,
          photo_url: photoUrl,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }))

        setPhotoLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })

        setPhotoCapturedAt(capturedAt)
        setCameraActive(false)

        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }, 'image/jpeg', 0.9)
    },
    () => {
      setCameraError('GPS permission is required to capture a geotagged photo.')
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  )
}


  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validateForm()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const createdComplaint = await createComplaint(form)
      setSubmittedComplaint(createdComplaint)
      setForm(initialFormState)
      setErrors({})
    } catch (error) {
      setErrors({ submit: error.message || 'There was a problem submitting the complaint.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submittedComplaint) {
    return (
      <AbstractPageBackground>
        <div className="mx-auto max-w-4xl space-y-6 pb-10">
        <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-800">
            <div className="rounded-full bg-emerald-100 p-2">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Report submitted</h1>
              <p className="text-sm text-emerald-700">Your issue is under review and has been assessed by AI.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Submitted complaint</div>
            <img
              src={submittedComplaint.photo_url || 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80'}
              alt={submittedComplaint.issue_type}
              className="h-52 w-full rounded-2xl object-cover"
            />

            <div className="mt-4 space-y-3">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Issue type</div>
                <div className="mt-1 text-lg font-bold text-slate-900">{submittedComplaint.ai.category}</div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Location</div>
                <div className="mt-1 text-sm text-slate-700">{submittedComplaint.address}</div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Description</div>
                <div className="mt-1 text-sm text-slate-700">{submittedComplaint.description}</div>
              </div>
            </div>
          </div>

          <AIAnalysisCard complaint={submittedComplaint} />
        </div>
        </div>
      </AbstractPageBackground>
    )
  }

  return (
    <AbstractPageBackground>
      <div className="mx-auto max-w-4xl pb-10">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b88100]">Report issue</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Share a civic problem</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="issue_type" className="mb-2 block text-sm font-medium text-slate-700">
              Issue type
            </label>
            <select
              id="issue_type"
              name="issue_type"
              value={form.issue_type}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-[#ffbf07] focus:outline-none focus:ring-2 focus:ring-[#ffbf07]/30"
            >
              {issueOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-[#fff8df] p-4 text-sm text-[#8a6100] ring-1 ring-[#ffbf07]/40">
            <div className="font-semibold">AI category</div>
            <div className="mt-1 text-base font-bold">{activeIssueLabel}</div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="5"
            value={form.description}
            onChange={handleInputChange}
            placeholder="Describe what is wrong, how bad it is, and any information that helps the team act quickly."
            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#ffbf07] focus:outline-none focus:ring-2 focus:ring-[#ffbf07]/30"
          />
          {errors.description ? <p className="mt-1 text-sm text-red-600">{errors.description}</p> : null}
        </div>

<div className="space-y-3">
  <label className="mb-2 block text-sm font-medium text-slate-700">
    Capture issue photo
  </label>

  <p className="text-sm text-slate-500">
    Take a fresh photo of the civic issue. Gallery uploads are not available.
  </p>

  {!cameraActive && !form.photo_url && (
    <button
      type="button"
      onClick={startCamera}
      className="inline-flex items-center gap-2 rounded-full bg-[#ffbf07] px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-[#ffd04a]"
    >
      <Camera className="h-5 w-5" />
      Open camera
    </button>
  )}

  {cameraActive && (
    <div className="space-y-3">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-lg rounded-2xl bg-black"
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={capturePhoto}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Camera className="h-4 w-4" />
          Capture photo and GPS
        </button>

        <button
          type="button"
          onClick={() => {
            streamRef.current?.getTracks().forEach((track) => track.stop())
            streamRef.current = null
            setCameraActive(false)
          }}
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
        >
          Cancel
        </button>
      </div>
    </div>
  )}

  {form.photo_url && (
    <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <img
        src={form.photo_url}
        alt="Newly captured civic issue"
        className="h-56 w-full max-w-lg rounded-2xl object-cover"
      />

      <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
        <MapPin className="h-4 w-4" />
        GPS location captured
      </p>

      <p className="text-xs text-slate-600">
        Latitude: {photoLocation?.latitude.toFixed(6)} ·
        Longitude: {photoLocation?.longitude.toFixed(6)}
      </p>

      <p className="text-xs text-slate-600">
        GPS accuracy: {photoLocation?.accuracy
          ? `approximately ${Math.round(photoLocation.accuracy)} metres`
          : 'unavailable'}
      </p>

      <p className="text-xs text-slate-600">
        Captured: {photoCapturedAt
          ? new Date(photoCapturedAt).toLocaleString()
          : 'unavailable'}
      </p>

      <button
        type="button"
        onClick={discardPhoto}
        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        <RefreshCw className="h-4 w-4" />
        Retake photo
      </button>
    </div>
  )}

  {cameraError && (
    <p role="alert" className="text-sm text-red-600">
      {cameraError}
    </p>
  )}

  {errors.photo && (
    <p className="text-sm text-red-600">{errors.photo}</p>
  )}
</div>

        </div>

        <div>
          <label htmlFor="address" className="mb-2 block text-sm font-medium text-slate-700">
            Location
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={form.address}
            onChange={handleInputChange}
            placeholder="Enter your address or nearby landmark"
            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#ffbf07] focus:outline-none focus:ring-2 focus:ring-[#ffbf07]/30"
          />
          {errors.address ? <p className="mt-1 text-sm text-red-600">{errors.address}</p> : null}
        </div>
        {errors.submit ? <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{errors.submit}</div> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-[#ffbf07] px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-[#ffd04a] disabled:cursor-not-allowed disabled:bg-[#f3d77b]"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit report
            </>
          )}
        </button>
      </form>
      </div>
    </AbstractPageBackground>
  )
}
