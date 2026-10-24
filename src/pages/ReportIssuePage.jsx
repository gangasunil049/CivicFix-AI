import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Camera,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Send,
  Sparkles,
} from 'lucide-react'
import { createComplaint } from '../api/complaints'
import AbstractPageBackground from '../components/AbstractPageBackground'
import AIAnalysisCard from '../components/AIAnalysisCard'

const issueOptions = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'blocked_drain', label: 'Blocked Drain' },
  { value: 'garbage', label: 'Garbage' },
  { value: 'broken_streetlight', label: 'Broken Streetlight' },
  { value: 'water_leakage', label: 'Water Leakage' },
  { value: 'other', label: 'Other' },
]

const initialFormState = {
  issue_type: 'pothole',
  description: '',
  address: '',
  latitude: null,
  longitude: null,
  photo: null,
  photo_url: null,
  captured_at: null,
}

export default function ReportIssuePage() {
  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [photoLocation, setPhotoLocation] = useState(null)
  const [photoCapturedAt, setPhotoCapturedAt] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedComplaint, setSubmittedComplaint] = useState(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const activeIssueLabel = useMemo(
    () => issueOptions.find((option) => option.value === form.issue_type)?.label || 'Issue',
    [form.issue_type],
  )

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {
        setCameraError('Could not start the camera preview. Please check camera permissions.')
      })
    }
  }, [cameraActive])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      if (form.photo_url) URL.revokeObjectURL(form.photo_url)
    }
  }, [])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraActive(false)
  }

  const startCamera = async () => {
    setCameraError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access requires HTTPS or localhost and a supported browser.')
      return
    }

    try {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      setCameraActive(true)
    } catch (error) {
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings.')
      } else if (error?.name === 'NotFoundError') {
        setCameraError('No camera was found on this device.')
      } else {
        setCameraError('Unable to open the camera. Please close other apps using it and try again.')
      }
    }
  }

  const getCurrentPosition = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('This browser does not support GPS location.'))
        return
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      })
    })

  const lookupAddress = async (latitude, longitude) => {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Address lookup failed')
    const data = await response.json()
    if (!data.display_name) throw new Error('No address found')
    return data.display_name
  }

  const detectCurrentLocation = async () => {
    setIsLocating(true)
    setLocationMessage('Getting your current location...')
    try {
      const position = await getCurrentPosition()
      const { latitude, longitude, accuracy } = position.coords
      setForm((current) => ({ ...current, latitude, longitude }))
      try {
        const address = await lookupAddress(latitude, longitude)
        setForm((current) => ({ ...current, latitude, longitude, address }))
        setLocationMessage(`Address detected. GPS accuracy: approximately ${Math.round(accuracy)} metres.`)
      } catch {
        setLocationMessage('GPS detected, but the address could not be found. Please enter the address manually.')
      }
    } catch (error) {
      if (error?.code === 1) setLocationMessage('Please allow location permission in your browser.')
      else if (error?.code === 2) setLocationMessage('Location unavailable. Check your device location settings.')
      else if (error?.code === 3) setLocationMessage('Location request timed out. Please try again.')
      else setLocationMessage(error?.message || 'Unable to detect your location. Please try again.')
    } finally {
      setIsLocating(false)
    }
  }

  const capturePhoto = async () => {
    const video = videoRef.current
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError('The camera is not ready yet. Please wait a moment.')
      return
    }

    setCameraError('')
    try {
      setLocationMessage('Getting GPS location for this photo...')
      const position = await getCurrentPosition()
      const { latitude, longitude, accuracy } = position.coords
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Photo capture failed. Please try again.')
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result)
          else reject(new Error('Could not create the captured photo.'))
        }, 'image/jpeg', 0.9)
      })

      const photo = new File([blob], `civic-fix-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const photoUrl = URL.createObjectURL(photo)
      setForm((current) => {
        if (current.photo_url) URL.revokeObjectURL(current.photo_url)
        return {
          ...current,
          photo,
          photo_url: photoUrl,
          latitude,
          longitude,
          captured_at: new Date().toISOString(),
        }
      })
      setPhotoLocation({ latitude, longitude, accuracy })
      setPhotoCapturedAt(new Date().toISOString())
      setErrors((current) => ({ ...current, photo: '' }))
      stopCamera()
      setLocationMessage(`GPS captured. Accuracy: approximately ${Math.round(accuracy)} metres.`)

      try {
        const address = await lookupAddress(latitude, longitude)
        setForm((current) => ({ ...current, address, latitude, longitude }))
      } catch {
        // GPS coordinates are still saved; the user can type the address manually.
      }
    } catch (error) {
      if (error?.code === 1) setCameraError('GPS permission is required to capture a photo with location.')
      else if (error?.code === 3) setCameraError('GPS timed out. Please try again in an open area.')
      else setCameraError(error?.message || 'Could not capture the photo. Please try again.')
    }
  }

  const discardPhoto = () => {
    if (form.photo_url) URL.revokeObjectURL(form.photo_url)
    setForm((current) => ({
      ...current,
      photo: null,
      photo_url: null,
      captured_at: null,
    }))
    setPhotoLocation(null)
    setPhotoCapturedAt(null)
    setErrors((current) => ({ ...current, photo: '' }))
    setLocationMessage('')
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const validateForm = () => {
    const nextErrors = {}
    if (!form.description.trim()) nextErrors.description = 'Please describe the civic issue.'
    if (!form.address.trim()) nextErrors.address = 'Please enter the issue location.'
    if (!form.photo) nextErrors.photo = 'Please capture a photo using the camera.'
    else if (!photoLocation) nextErrors.photo = 'A photo with GPS location is required.'
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validateForm()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    try {
      const createdComplaint = await createComplaint({
        ...form,
        photo_captured_at: photoCapturedAt,
        photo_location: photoLocation,
      })
      setSubmittedComplaint(createdComplaint)
      if (form.photo_url) URL.revokeObjectURL(form.photo_url)
      stopCamera()
      setForm({ ...initialFormState })
      setPhotoLocation(null)
      setPhotoCapturedAt(null)
      setErrors({})
    } catch (error) {
      setErrors({
        submit: error?.message || 'There was a problem submitting the complaint. Please try again.',
      })
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
              <div className="rounded-full bg-emerald-100 p-2"><Sparkles className="h-5 w-5" /></div>
              <div>
                <h1 className="text-2xl font-bold">Report submitted</h1>
                <p className="text-sm text-emerald-700">Your issue is under review and has been assessed by AI.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Submitted complaint</div>
              {submittedComplaint.photo_url && (
                <img src={submittedComplaint.photo_url} alt="Submitted civic issue" className="h-52 w-full rounded-2xl object-cover" />
              )}
              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Issue type</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">{submittedComplaint.ai?.category || submittedComplaint.issue_type}</div>
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
          <button type="button" onClick={() => setSubmittedComplaint(null)} className="rounded-full bg-[#ffbf07] px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-[#ffd04a]">
            Report another issue
          </button>
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
          <p className="mt-2 text-sm text-slate-600">Add a description, capture fresh photo evidence, and attach its GPS location.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="issue_type" className="mb-2 block text-sm font-medium text-slate-700">Issue type</label>
              <select id="issue_type" name="issue_type" value={form.issue_type} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-[#ffbf07] focus:outline-none focus:ring-2 focus:ring-[#ffbf07]/30">
                {issueOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="rounded-2xl bg-[#fff8df] p-4 text-sm text-[#8a6100] ring-1 ring-[#ffbf07]/40">
              <div className="font-semibold">Issue category</div>
              <div className="mt-1 text-base font-bold">{activeIssueLabel}</div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">Description</label>
            <textarea id="description" name="description" rows="5" value={form.description} onChange={handleInputChange} placeholder="Describe what is wrong, how bad it is, and any information that helps the team act quickly." className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#ffbf07] focus:outline-none focus:ring-2 focus:ring-[#ffbf07]/30" />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Capture issue photo</label>
            <p className="text-sm text-slate-500">Take a fresh photo of the civic issue. Gallery uploads are not available.</p>
            {!cameraActive && !form.photo_url && (
              <button type="button" onClick={startCamera} className="inline-flex items-center gap-2 rounded-full bg-[#ffbf07] px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-[#ffd04a]">
                <Camera className="h-5 w-5" /> Open camera
              </button>
            )}
            {cameraActive && (
              <div className="space-y-3">
                <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-lg rounded-2xl bg-black" />
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={capturePhoto} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
                    <Camera className="h-4 w-4" /> Capture photo and GPS
                  </button>
                  <button type="button" onClick={stopCamera} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700">Cancel</button>
                </div>
              </div>
            )}
            {form.photo_url && (
              <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <img src={form.photo_url} alt="Captured civic issue evidence" className="h-56 w-full max-w-lg rounded-2xl object-cover" />
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-800"><MapPin className="h-4 w-4" /> GPS location captured</p>
                <p className="text-xs text-slate-600">Latitude: {photoLocation?.latitude.toFixed(6)} · Longitude: {photoLocation?.longitude.toFixed(6)}</p>
                <p className="text-xs text-slate-600">GPS accuracy: {photoLocation?.accuracy ? `approximately ${Math.round(photoLocation.accuracy)} metres` : 'unavailable'}</p>
                <p className="text-xs text-slate-600">Captured: {photoCapturedAt ? new Date(photoCapturedAt).toLocaleString() : 'unavailable'}</p>
                <button type="button" onClick={discardPhoto} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
                  <RefreshCw className="h-4 w-4" /> Retake photo
                </button>
              </div>
            )}
            {cameraError && <p role="alert" className="text-sm text-red-600">{cameraError}</p>}
            {errors.photo && <p className="text-sm text-red-600">{errors.photo}</p>}
          </div>

          <div>
            <label htmlFor="address" className="mb-2 block text-sm font-medium text-slate-700">Location / address</label>
            <input id="address" name="address" type="text" value={form.address} onChange={handleInputChange} placeholder="Enter your address or nearby landmark" className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#ffbf07] focus:outline-none focus:ring-2 focus:ring-[#ffbf07]/30" />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">📍 Current GPS location</p>
                <p className="mt-1 text-xs text-slate-500">{locationMessage || 'Capture a photo or detect your location automatically.'}</p>
              </div>
              <button type="button" onClick={detectCurrentLocation} disabled={isLocating} className="rounded-full bg-[#ffbf07] px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60">
                {isLocating ? 'Detecting...' : 'Detect location'}
              </button>
            </div>
            {form.latitude !== null && form.longitude !== null && (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-3"><p className="text-xs text-slate-500">Latitude</p><p className="mt-1 text-sm font-medium text-slate-800">{form.latitude}</p></div>
                <div className="rounded-xl bg-white p-3"><p className="text-xs text-slate-500">Longitude</p><p className="mt-1 text-sm font-medium text-slate-800">{form.longitude}</p></div>
              </div>
            )}
          </div>

          {errors.submit && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{errors.submit}</div>}
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-full bg-[#ffbf07] px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-[#ffd04a] disabled:cursor-not-allowed disabled:bg-[#f3d77b]">
            {isSubmitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Sending...</> : <><Send className="h-4 w-4" /> Submit report</>}
          </button>
        </form>
      </div>
    </AbstractPageBackground>
  )
}
