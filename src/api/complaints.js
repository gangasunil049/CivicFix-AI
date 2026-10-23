const mockComplaints = [
  {
    id: 'cmp-1001',
    issue_type: 'pothole',
    description: 'Large pothole near the bus stop opposite St. Aloysius College, causing vehicle damage and risk to pedestrians.',
    photo_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
    latitude: 12.8746,
    longitude: 74.846,
    address: 'Hampankatta, Mangaluru, Karnataka',
    status: 'In Progress',
    created_at: '2026-10-16T09:15:00.000Z',
    ai: {
      category: 'Pothole',
      confidence: 0.94,
      priority_score: 88,
      priority_level: 'High',
      explanation: 'Road surface damage is clearly visible and located near a high-traffic bus stop, increasing urgency.',
      is_uncertain: false,
      possible_duplicate_of: null,
      related_issues: ['cmp-1002']
    }
  },
  {
    id: 'cmp-1002',
    issue_type: 'pothole',
    description: 'Pothole on the same road near the college entrance, deep crack spreading across lane.',
    photo_url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=900&q=80',
    latitude: 12.8752,
    longitude: 74.8468,
    address: 'Near St. Aloysius College, Mangaluru, Karnataka',
    status: 'Under Review',
    created_at: '2026-10-16T11:05:00.000Z',
    ai: {
      category: 'Pothole',
      confidence: 0.9,
      priority_score: 81,
      priority_level: 'High',
      explanation: 'The issue matches a recurring road defect pattern in the same corridor and likely needs coordinated repair.',
      is_uncertain: false,
      possible_duplicate_of: 'cmp-1001',
      related_issues: ['cmp-1001']
    }
  },
  {
    id: 'cmp-1003',
    issue_type: 'blocked_drain',
    description: 'Rainwater drain blocked with plastic waste near the market and causing stagnant water.',
    photo_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
    latitude: 12.8924,
    longitude: 74.8471,
    address: 'Kankanady Market Road, Mangaluru, Karnataka',
    status: 'Submitted',
    created_at: '2026-10-18T07:22:00.000Z',
    ai: {
      category: 'Blocked Drain',
      confidence: 0.83,
      priority_score: 74,
      priority_level: 'Medium',
      explanation: 'Drain inlet is obstructed with solid waste and water is pooling at the surface, indicating a clog risk.',
      is_uncertain: false,
      possible_duplicate_of: null,
      related_issues: []
    }
  },
  {
    id: 'cmp-1004',
    issue_type: 'garbage',
    description: 'Overflowing garbage bin with mixed waste accumulating beside the footpath.',
    photo_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80',
    latitude: 12.8608,
    longitude: 74.8404,
    address: 'Pumpwell, Mangaluru, Karnataka',
    status: 'Resolved',
    created_at: '2026-10-12T15:10:00.000Z',
    ai: {
      category: 'Garbage',
      confidence: 0.96,
      priority_score: 62,
      priority_level: 'Medium',
      explanation: 'Waste accumulation is evident, but the issue is on a controlled municipal collection route and is likely manageable.',
      is_uncertain: false,
      possible_duplicate_of: null,
      related_issues: []
    }
  },
  {
    id: 'cmp-1005',
    issue_type: 'broken_streetlight',
    description: 'Streetlight on the road divider is not working, leaving the lane poorly lit at night.',
    photo_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80',
    latitude: 12.8824,
    longitude: 74.8442,
    address: 'Kadri Road, Mangaluru, Karnataka',
    status: 'Resolved',
    created_at: '2026-10-14T19:48:00.000Z',
    ai: {
      category: 'Broken Streetlight',
      confidence: 0.91,
      priority_score: 69,
      priority_level: 'Medium',
      explanation: 'A faulty street lighting unit is reported in a public road corridor, which can affect nighttime safety and visibility.',
      is_uncertain: false,
      possible_duplicate_of: null,
      related_issues: []
    }
  },
  {
    id: 'cmp-1006',
    issue_type: 'water_leakage',
    description: 'Water leaking from a pipe under the footpath and pooling in front of a residential gate.',
    photo_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
    latitude: 12.905,
    longitude: 74.8503,
    address: 'Balmatta, Mangaluru, Karnataka',
    status: 'In Progress',
    created_at: '2026-10-17T08:10:00.000Z',
    ai: {
      category: 'Water Leakage',
      confidence: 0.89,
      priority_score: 83,
      priority_level: 'High',
      explanation: 'Continuous leakage from utility infrastructure is visible and could lead to surface damage or service disruption.',
      is_uncertain: false,
      possible_duplicate_of: null,
      related_issues: []
    }
  },
  {
    id: 'cmp-1007',
    issue_type: 'garbage',
    description: 'Open dumping near the drain by the local market; smell is worsening after every day.',
    photo_url: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=900&q=80',
    latitude: 12.8932,
    longitude: 74.8427,
    address: 'PVS Circle, Mangaluru, Karnataka',
    status: 'Under Review',
    created_at: '2026-10-20T06:18:00.000Z',
    ai: {
      category: 'Garbage',
      confidence: 0.78,
      priority_score: 71,
      priority_level: 'Medium',
      explanation: 'Waste disposal is not in designated bins and sits near a drain, increasing sanitation risk.',
      is_uncertain: false,
      possible_duplicate_of: null,
      related_issues: []
    }
  },
  {
    id: 'cmp-1008',
    issue_type: 'other',
    description: 'Traffic sign board near the junction is tilted and partially hidden by tree branches.',
    photo_url: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
    latitude: 12.8669,
    longitude: 74.8578,
    address: 'Kulshekar Junction, Mangaluru, Karnataka',
    status: 'Submitted',
    created_at: '2026-10-21T10:20:00.000Z',
    ai: {
      category: 'Road Safety Signage',
      confidence: 0.72,
      priority_score: 58,
      priority_level: 'Medium',
      explanation: 'The issue is a public safety signage problem with visibility concerns at a junction, but not a typical municipal utility defect.',
      is_uncertain: false,
      possible_duplicate_of: null,
      related_issues: []
    }
  },
  {
    id: 'cmp-1009',
    issue_type: 'blocked_drain',
    description: 'Drain is clogged with leaves and silt causing water to back up on the road.',
    photo_url: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=900&q=80',
    latitude: 12.878,
    longitude: 74.836,
    address: 'Main Road, Derebail, Mangaluru, Karnataka',
    status: 'Resolved',
    created_at: '2026-10-09T13:35:00.000Z',
    ai: {
      category: 'Blocked Drain',
      confidence: 0.93,
      priority_score: 76,
      priority_level: 'High',
      explanation: 'Surface water retention and visible inlet obstruction strongly indicate a drainage blockage requiring cleanup.',
      is_uncertain: false,
      possible_duplicate_of: null,
      related_issues: []
    }
  },
  {
    id: 'cmp-1010',
    issue_type: 'water_leakage',
    description: 'Pipe burst near the school causing heavy water wastage and muddy ground conditions.',
    photo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80',
    latitude: 12.8888,
    longitude: 74.8509,
    address: 'Near Ladyhill, Mangaluru, Karnataka',
    status: 'In Progress',
    created_at: '2026-10-22T05:05:00.000Z',
    ai: {
      category: 'Water Leakage',
      confidence: 0.67,
      priority_score: 92,
      priority_level: 'Critical',
      explanation: 'An active pipe burst with visible water leak and traffic disruption indicates an urgent utility emergency.',
      is_uncertain: false,
      possible_duplicate_of: null,
      related_issues: []
    }
  },
  {
    id: 'cmp-1011',
    issue_type: 'broken_streetlight',
    description: 'Multiple lamp posts along the park road are dark and one has fallen partially.',
    photo_url: 'https://images.unsplash.com/photo-1500106061081-df3d3802bf98?auto=format&fit=crop&w=900&q=80',
    latitude: 12.8741,
    longitude: 74.8386,
    address: 'Panjimogaru Park Road, Mangaluru, Karnataka',
    status: 'Under Review',
    created_at: '2026-10-19T20:00:00.000Z',
    ai: {
      category: 'Broken Streetlight',
      confidence: 0.59,
      priority_score: 64,
      priority_level: 'Medium',
      explanation: 'Street lighting outage is visible, but some evidence is unclear because the asset may be partially damaged or the issue may affect a wider cluster.',
      is_uncertain: true,
      possible_duplicate_of: null,
      related_issues: []
    }
  },
  {
    id: 'cmp-1012',
    issue_type: 'pothole',
    description: 'Cracked asphalt around a curve near the apartment complex is worsening after rain.',
    photo_url: 'https://images.unsplash.com/photo-1534545883629-4d904daad1f4?auto=format&fit=crop&w=900&q=80',
    latitude: 12.8827,
    longitude: 74.8355,
    address: 'Gokarnanath Road, Mangaluru, Karnataka',
    status: 'Submitted',
    created_at: '2026-10-23T07:30:00.000Z',
    ai: {
      category: 'Pothole',
      confidence: 0.58,
      priority_score: 55,
      priority_level: 'Low',
      explanation: 'Surface cracking suggests a road defect, but the image and location need a manual check before assignment due to low certainty.',
      is_uncertain: true,
      possible_duplicate_of: null,
      related_issues: []
    }
  }
]

const mockApiDelay = 1500

const toIssueType = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  if (normalized === 'blocked_drain') return 'blocked_drain'
  if (normalized === 'garbage') return 'garbage'
  if (normalized === 'broken_streetlight') return 'broken_streetlight'
  if (normalized === 'water_leakage') return 'water_leakage'
  if (normalized === 'other') return 'other'
  return 'pothole'
}

const priorityFromScore = (score) => {
  if (score >= 80) return 'Critical'
  if (score >= 60) return 'High'
  if (score >= 35) return 'Medium'
  return 'Low'
}

const buildMockAiAnalysis = ({ issue_type, description, latitude, longitude }) => {
  const cleanDescription = String(description || '').trim()
  const typeLabel = {
    pothole: 'Pothole',
    blocked_drain: 'Blocked Drain',
    garbage: 'Garbage',
    broken_streetlight: 'Broken Streetlight',
    water_leakage: 'Water Leakage',
    other: 'Other'
  }[issue_type] || 'Other'

  let confidence = 0.78
  let priorityScore = 58
  let explanation = 'The submitted report matches the reported civic issue pattern and is consistent with the observed location.'

  if (issue_type === 'pothole') {
    confidence = 0.88
    priorityScore = 79
    explanation = 'Road surface breakage is clearly visible and likely to affect local mobility and safety.'
  }

  if (issue_type === 'blocked_drain') {
    confidence = 0.82
    priorityScore = 74
    explanation = 'Drain blockage is likely causing water accumulation and sanitation risk in the area.'
  }

  if (issue_type === 'garbage') {
    confidence = 0.91
    priorityScore = 66
    explanation = 'Waste accumulation and public cleanliness concerns are consistent with a garbage collection issue.'
  }

  if (issue_type === 'broken_streetlight') {
    confidence = 0.76
    priorityScore = 63
    explanation = 'The roadway lighting issue is likely due to a failed or damaged streetlight fixture.'
  }

  if (issue_type === 'water_leakage') {
    confidence = 0.86
    priorityScore = 88
    explanation = 'Visible water leakage or pipe malfunction is consistent with a utility issue requiring early intervention.'
  }

  if (cleanDescription.toLowerCase().includes('unclear') || cleanDescription.length < 25) {
    confidence = Math.min(confidence, 0.58)
  }

  if (confidence < 0.6) {
    explanation = 'The information provided is limited and may require on-ground verification before escalation.'
  }

  const duplicate = mockComplaints.find((complaint) => {
    if (complaint.issue_type !== issue_type) return false
    const distance = Math.sqrt(
      (complaint.latitude - latitude) ** 2 + (complaint.longitude - longitude) ** 2,
    )
    return distance < 0.02
  })

  const possibleDuplicateOf = duplicate ? duplicate.id : null

  return {
    category: typeLabel,
    confidence: Number(confidence.toFixed(2)),
    priority_score: priorityScore,
    priority_level: priorityFromScore(priorityScore),
    explanation,
    is_uncertain: confidence < 0.6,
    possible_duplicate_of: possibleDuplicateOf,
    related_issues: duplicate ? [duplicate.id] : []
  }
}

const getBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const getComplaints = async () => {
  const useMock = String(import.meta.env.VITE_USE_MOCK ?? 'true').toLowerCase() === 'true'

  if (useMock) {
    return [...mockComplaints]
  }

  const response = await fetch(`${getBaseUrl()}/complaints`)

  if (!response.ok) {
    throw new Error('Unable to load complaints right now.')
  }

  return response.json()
}

export const getComplaintById = async (id) => {
  const useMock = String(import.meta.env.VITE_USE_MOCK ?? 'true').toLowerCase() === 'true'

  if (useMock) {
    const complaint = mockComplaints.find((item) => item.id === id)
    if (!complaint) {
      throw new Error('Complaint not found.')
    }
    return complaint
  }

  const response = await fetch(`${getBaseUrl()}/complaints/${id}`)

  if (!response.ok) {
    throw new Error('Unable to find that complaint.')
  }

  return response.json()
}

export const createComplaint = async (formData) => {
  const useMock = String(import.meta.env.VITE_USE_MOCK ?? 'true').toLowerCase() === 'true'

  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, mockApiDelay))

    const normalizedIssueType = toIssueType(formData.issue_type)
    const complaint = {
      id: `cmp-${Date.now()}`,
      issue_type: normalizedIssueType,
      description: String(formData.description || '').trim(),
      photo_url: formData.photo_url || null,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      address: String(formData.address || 'Location unavailable').trim() || 'Location unavailable',
      status: 'Submitted',
      created_at: new Date().toISOString(),
      ai: buildMockAiAnalysis({
        issue_type: normalizedIssueType,
        description: String(formData.description || '').trim(),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      })
    }

    mockComplaints.unshift(complaint)
    return complaint
  }

  const form = new FormData()
  form.append('issue_type', formData.issue_type)
  form.append('description', formData.description)
  form.append('latitude', String(formData.latitude))
  form.append('longitude', String(formData.longitude))
  form.append('address', formData.address)

  if (formData.photo) {
    form.append('photo', formData.photo)
  }

  const response = await fetch(`${getBaseUrl()}/complaints`, {
    method: 'POST',
    body: form,
  })

  if (!response.ok) {
    throw new Error('Your report could not be submitted.')
  }

  return response.json()
}

export { mockComplaints }
