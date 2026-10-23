from __future__ import annotations

from io import BytesIO
from typing import Any

from PIL import Image
from PIL.ExifTags import TAGS


def degree_to_decimal(value: tuple[float, float, float], ref: str) -> float:
    degrees, minutes, seconds = value
    decimal = float(degrees) + (float(minutes) / 60.0) + (float(seconds) / 60.0 / 60.0)
    if ref in {'S', 'W'}:
        decimal *= -1
    return decimal


def extract_exif_gps(photo_bytes: bytes) -> dict[str, Any] | None:
    try:
        image = Image.open(BytesIO(photo_bytes))
        exif_data = image.getexif()
        if not exif_data:
            return None

        gps_info = exif_data.get(34853)
        if not gps_info:
            return None

        lat_ref = gps_info.get(1)
        lat = gps_info.get(2)
        lng_ref = gps_info.get(3)
        lng = gps_info.get(4)

        if not lat or not lng or not lat_ref or not lng_ref:
            return None

        latitude = degree_to_decimal(lat, lat_ref)
        longitude = degree_to_decimal(lng, lng_ref)
        return {'latitude': latitude, 'longitude': longitude}
    except Exception:
        return None


def extract_exif_details(photo_bytes: bytes) -> dict[str, Any]:
    result: dict[str, Any] = {}
    try:
        image = Image.open(BytesIO(photo_bytes))
        exif_data = image.getexif()
        if not exif_data:
            return result

        gps_info = exif_data.get(34853)
        if gps_info:
            lat_ref = gps_info.get(1)
            lat = gps_info.get(2)
            lng_ref = gps_info.get(3)
            lng = gps_info.get(4)
            if lat and lng and lat_ref and lng_ref:
                result['latitude'] = degree_to_decimal(lat, lat_ref)
                result['longitude'] = degree_to_decimal(lng, lng_ref)

        timestamp = exif_data.get(36867) or exif_data.get(306)
        if timestamp:
            result['timestamp'] = str(timestamp)

        return result
    except Exception:
        return result
