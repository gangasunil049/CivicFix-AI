import {
  ImageIcon,
  LoaderCircle,
  Send,
  Sparkles,
  Camera,
  X,
  RefreshCw,
} from 'lucide-react'

import { useEffect, useRef, useState } from 'react'

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
  address: '',
  latitude: null,
  longitude: null,
  photo: null,
  photo_url: null,
  captured_at: null
}
export default function ReportIssuePage() {
  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [cameraOpen, setCameraOpen] = useState(false)
const [cameraError, setCameraError] = useState('')
const [isCapturing, setIsCapturing] = useState(false)

const videoRef = useRef(null)
const streamRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedComplaint, setSubmittedComplaint] = useState(null)
  const [isLocating, setIsLocating] = useState(false)
const [locationMessage, setLocationMessage] = useState('')

  const validateForm = () => {
    const nextErrors = {}

    if (!form.description.trim()) {
      nextErrors.description = 'Please describe the civic issue in a few words.'
    }

    if (!form.address.trim()) {
      nextErrors.address = 'Please add an address or nearby landmark.'
    }

    return nextErrors
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const detectCurrentLocation = () => {
if (!navigator.geolocation) {
setLocationMessage('Location detection is not supported by this browser.')
return
}

setIsLocating(true)
setLocationMessage('Getting your most accurate location...')

navigator.geolocation.getCurrentPosition(
async (position) => {
const { latitude, longitude, accuracy } = position.coords


  // Reject GPS readings that are too inaccurate.
  if (accuracy > 150) {
    setLocationMessage(
      `Location accuracy is approximately ${Math.round(accuracy)} metres. Move to an open area and try again.`
    )
    setIsLocating(false)
    return
  }

  // Save the GPS coordinates.
  setForm((current) => ({
    ...current,
    latitude,
    longitude
  }))

  setLocationMessage(
    `GPS detected. Accuracy: approximately ${Math.round(accuracy)} metres. Finding address...`
  )

  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Address lookup failed')
    }

    const data = await response.json()

    if (!data.display_name) {
      throw new Error('No address found')
    }

    setForm((current) => ({
      ...current,
      latitude,
      longitude,
      address: data.display_name
    }))

    setLocationMessage(
      `Address detected. GPS accuracy: approximately ${Math.round(accuracy)} metres.`
    )
  } catch {
    setLocationMessage(
      'GPS detected, but the address lookup failed. Please try again or enter the address manually.'
    )
  } finally {
    setIsLocating(false)
  }
},
(error) => {
  let message = 'Unable to detect your location. Please try again.'

  if (error.code === 1) {
    message = 'Please allow location permission in your browser.'
  } else if (error.code === 2) {
    message = 'Location unavailable. Check your device location settings.'
  } else if (error.code === 3) {
    message = 'Location request timed out. Please try again.'
  }

  setLocationMessage(message)
  setIsLocating(false)
},
{
  enableHighAccuracy: true,
  timeout: 30000,
  maximumAge: 0
}


)
}


// Stop the camera and release the device.
const stopCamera = () => {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => {
      track.stop()
    })

    streamRef.current = null
  }

  if (videoRef.current) {
    videoRef.current.srcObject = null
  }

  setCameraOpen(false)
}

// Open the live camera.
const startCamera = async () => {
  setCameraError('')

  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraError(
      'Camera access is unavailable. Please use HTTPS or localhost and a supported browser.'
    )
    return
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
      },
      audio: false,
    })

    streamRef.current = stream
    setCameraOpen(true)
  } catch (error) {
    let message = 'Unable to open the camera. Please try again.'

    if (
      error.name === 'NotAllowedError' ||
      error.name === 'PermissionDeniedError'
    ) {
      message =
        'Camera permission was denied. Please allow camera access in your browser settings.'
    } else if (error.name === 'NotFoundError') {
      message = 'No camera was found on this device.'
    } else if (error.name === 'NotReadableError') {
      message =
        'The camera may already be in use by another application.'
    }

    setCameraError(message)
  }
}

// Connect the camera stream to the live video preview.
useEffect(() => {
  if (!cameraOpen || !videoRef.current || !streamRef.current) {
    return
  }

  const video = videoRef.current
  video.srcObject = streamRef.current

  video.play().catch(() => {
    setCameraError(
      'Unable to start the camera preview. Please check camera permissions.'
    )
  })
}, [cameraOpen])

// Capture a photo directly from the live camera.
const capturePhoto = async () => {
  const video = videoRef.current

  if (!video || !video.videoWidth || !video.videoHeight) {
    setCameraError('The camera is not ready yet. Please wait a moment.')
    return
  }

  setIsCapturing(true)
  setCameraError('')

  try {
    const canvas = document.createElement('canvas')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Unable to capture the photo.')
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result)
          } else {
            reject(new Error('Could not create the captured photo.'))
          }
        },
        'image/jpeg',
        0.9
      )
    })

    const photo = new File(
      [blob],
      `civic-fix-${Date.now()}.jpg`,
      { type: 'image/jpeg' }
    )

    const photoUrl = URL.createObjectURL(photo)

    setForm((current) => {
      if (current.photo_url) {
        URL.revokeObjectURL(current.photo_url)
      }

      return {
        ...current,
        photo,
        photo_url: photoUrl,
        captured_at: new Date().toISOString(),
      }
    })

    stopCamera()
    detectCurrentLocation()
  } catch (error) {
    setCameraError(error.message || 'Failed to capture the photo.')
  } finally {
    setIsCapturing(false)
  }
}

// Release the camera when the component is removed.
useEffect(() => {
  return () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
    }
  }
}, [])

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
        <div className="grid gap-5">
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

      <div>
  <label className="mb-2 block text-sm font-medium text-slate-700">
    Evidence Photo
  </label>

  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
    <button
      type="button"
      onClick={startCamera}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#ffbf07] hover:bg-[#fff8df]"
    >
      {form.photo ? (
        <RefreshCw className="h-4 w-4" />
      ) : (
        <Camera className="h-4 w-4" />
      )}

      {form.photo ? 'Retake Photo' : 'Open Camera'}
    </button>

    {form.photo_url && (
      <div className="flex items-center gap-3">
        <img
          src={form.photo_url}
          alt="Captured civic issue evidence"
          className="h-24 w-24 rounded-2xl border border-slate-200 object-cover"
        />

        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Photo captured successfully
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {form.captured_at
              ? new Date(form.captured_at).toLocaleString()
              : ''}
          </p>
        </div>
      </div>
    )}
  </div>

  {errors.photo && (
    <p className="mt-1 text-sm text-red-600">
      {errors.photo}
    </p>
  )}

  {cameraError && (
    <p className="mt-2 text-sm text-red-600">
      {cameraError}
    </p>
  )}

  <p className="mt-2 text-xs text-slate-500">
    Capture a photo of the civic issue using your device camera.
  </p>
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
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <p className="text-sm font-semibold text-slate-800">
        📍 Current GPS Location
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {locationMessage || 'Capture a photo to detect your location automatically.'}
      </p>
    </div>

    <button
      type="button"
      onClick={detectCurrentLocation}
      disabled={isLocating}
      className="rounded-full bg-[#ffbf07] px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
    >
      {isLocating ? 'Detecting...' : 'Detect Location'}
    </button>
  </div>

  {form.latitude !== null && form.longitude !== null && (
    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div className="rounded-xl bg-white p-3">
        <p className="text-xs text-slate-500">Latitude</p>
        <p className="mt-1 text-sm font-medium text-slate-800">
          {form.latitude}
        </p>
      </div>

      <div className="rounded-xl bg-white p-3">
        <p className="text-xs text-slate-500">Longitude</p>
        <p className="mt-1 text-sm font-medium text-slate-800">
          {form.longitude}
        </p>
      </div>
    </div>
  )}
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

      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Capture Evidence
                </h2>
                <p className="text-sm text-slate-500">
                  Point the camera at the civic issue.
                </p>
              </div>

              <button
                type="button"
                onClick={stopCamera}
                className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
                aria-label="Close camera"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-h-[65vh] min-h-64 w-full object-contain"
              />
            </div>

            {cameraError && (
              <p className="px-4 pt-3 text-sm text-red-600">
                {cameraError}
              </p>
            )}

            <div className="flex justify-center gap-3 p-5">
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                disabled={isCapturing}
                className="inline-flex items-center gap-2 rounded-full bg-[#ffbf07] px-6 py-3 text-sm font-semibold text-slate-900 disabled:opacity-60"
              >
                {isCapturing ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </AbstractPageBackground>
  )
}