from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

IssueType = Literal['pothole', 'blocked_drain', 'garbage', 'broken_streetlight', 'water_leakage', 'other']
LocationSource = Literal['photo_exif', 'device_gps', 'manual_pin']
ComplaintStatus = Literal['Submitted', 'Under Review', 'In Progress', 'Resolved']
PriorityLevel = Literal['Low', 'Medium', 'High', 'Critical']


class AIAnalysis(BaseModel):
    category: str
    confidence: float = Field(..., ge=0, le=1)
    priority_score: int = Field(..., ge=0, le=100)
    priority_level: PriorityLevel
    explanation: str
    is_uncertain: bool = False
    possible_duplicate_of: str | None = None
    related_issues: list[str] = Field(default_factory=list)


class ComplaintBase(BaseModel):
    issue_type: IssueType
    description: str
    photo_url: str | None = None
    latitude: float
    longitude: float
    address: str
    location_source: LocationSource = 'manual_pin'
    status: ComplaintStatus = 'Submitted'
    created_at: str
    ai: AIAnalysis


class ComplaintRecord(ComplaintBase):
    id: str


class ComplaintCreate(BaseModel):
    issue_type: IssueType
    description: str = Field(..., min_length=10)
    latitude: float
    longitude: float
    address: str = Field(..., min_length=3)
    location_source: LocationSource = 'manual_pin'


class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus
    changed_by: str = 'system'


class StatusHistoryItem(BaseModel):
    id: str
    complaint_id: str
    status: ComplaintStatus
    changed_at: str
    changed_by: str


class StatsSummary(BaseModel):
    total: int
    by_status: dict[str, int]
    by_category: dict[str, int]
    by_priority_level: dict[str, int]


class HotspotItem(BaseModel):
    category: str
    lat_bucket: float
    lng_bucket: float
    count: int
    center_latitude: float
    center_longitude: float
