#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import sqlite3
from pathlib import Path
from typing import Any

from garminconnect import Garmin

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = Path.home() / '.hermes' / 'logsDB' / 'dive-log.db'
TOKEN_DIR = Path.home() / '.garminconnect'
DIVES_JSON = ROOT / 'src' / 'data' / 'dives.json'
DIVE_PROFILES_JSON = ROOT / 'src' / 'data' / 'dive_profiles.json'
PUBLIC_DIVE_PROFILES_JSON = ROOT / 'public' / 'dive_profiles.json'


def round_or_none(value: Any, digits: int = 1) -> float | None:
    if value is None:
        return None
    return round(float(value), digits)


def load_dives() -> list[dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        '''
        SELECT
          dive_number,
          date,
          dive_site,
          location_country,
          duration_s,
          max_depth_m,
          avg_depth_m,
          water_temp_min_c,
          water_temp_max_c,
          o2_pct,
          he_pct,
          avg_hr,
          start_lat,
          start_lon,
          garmin_activity_id
        FROM dives
        WHERE duplicate_of IS NULL
        ORDER BY dive_number ASC
        '''
    ).fetchall()
    conn.close()

    dives: list[dict[str, Any]] = []
    for row in rows:
        dive_site = row['dive_site']
        country = row['location_country']
        if dive_site and country:
            location = f'{dive_site}, {country}'
        else:
            location = dive_site or country or 'Unknown'

        o2 = row['o2_pct']
        he = row['he_pct']
        if o2 is None and he is None:
            gas = None
        elif he and he > 0:
            gas = f'Trimix {int(round(o2 or 0))}/{int(round(he))}'
        elif o2 is not None:
            o2_int = int(round(o2))
            gas = 'Air' if o2_int <= 21 else f'EAN{o2_int}'
        else:
            gas = None

        water_candidates = [v for v in (row['water_temp_min_c'], row['water_temp_max_c']) if v is not None]
        water_temp = round(sum(water_candidates) / len(water_candidates), 1) if water_candidates else None

        dives.append(
            {
                'num': row['dive_number'],
                'date': row['date'],
                'location': location,
                'bottom_time': round(float(row['duration_s']) / 60, 1) if row['duration_s'] is not None else None,
                'max_depth': round(float(row['max_depth_m']), 1) if row['max_depth_m'] is not None else 0.0,
                'avg_depth': round_or_none(row['avg_depth_m'], 1),
                'water_temp': water_temp,
                'gas': gas,
                'avg_hr': None if row['avg_hr'] is None else int(round(float(row['avg_hr']))),
                'lat': round_or_none(row['start_lat'], 4),
                'lon': round_or_none(row['start_lon'], 4),
                'garmin_id': str(row['garmin_activity_id']) if row['garmin_activity_id'] else None,
            }
        )
    return dives


def build_profiles(dives: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    garmin = Garmin()
    garmin.login(str(TOKEN_DIR))

    profiles: dict[str, list[dict[str, Any]]] = {}
    for dive in dives:
        activity_id = dive.get('garmin_id')
        if not activity_id:
            continue

        details = garmin.get_activity_details(activity_id)
        descriptors = details.get('metricDescriptors') or []
        metrics = details.get('activityDetailMetrics') or []
        if not descriptors or not metrics:
            continue

        key_to_index = {descriptor.get('key'): idx for idx, descriptor in enumerate(descriptors)}
        time_idx = key_to_index.get('sumElapsedDuration')
        depth_idx = key_to_index.get('directDepth')
        hr_idx = key_to_index.get('directHeartRate')
        if time_idx is None or depth_idx is None:
            continue

        points: list[dict[str, Any]] = []
        for entry in metrics:
            values = entry.get('metrics') or []
            if len(values) <= max(time_idx, depth_idx):
                continue
            t = values[time_idx]
            depth = values[depth_idx]
            if t is None or depth is None:
                continue
            hr = None
            if hr_idx is not None and len(values) > hr_idx:
                hr_raw = values[hr_idx]
                if hr_raw is not None and not (isinstance(hr_raw, float) and math.isnan(hr_raw)):
                    hr = int(round(float(hr_raw)))
            points.append(
                {
                    't': round(float(t) / 60, 2),
                    'depth': round(float(depth), 2),
                    'hr': hr,
                }
            )

        if points:
            profiles[str(dive['num'])] = points

    return profiles


def dump_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


def main() -> None:
    if not DB_PATH.exists():
        raise FileNotFoundError(f'Dive DB not found: {DB_PATH}')
    if not TOKEN_DIR.exists():
        raise FileNotFoundError(f'Garmin token dir not found: {TOKEN_DIR}')

    dives = load_dives()
    profiles = build_profiles(dives)

    dump_json(DIVES_JSON, dives)
    dump_json(DIVE_PROFILES_JSON, profiles)
    dump_json(PUBLIC_DIVE_PROFILES_JSON, profiles)

    with_profile = sum(1 for dive in dives if str(dive.get('num')) in profiles)
    print(json.dumps({
        'db_path': str(DB_PATH),
        'dives': len(dives),
        'dives_with_garmin_id': sum(1 for dive in dives if dive.get('garmin_id')),
        'dives_with_profile': with_profile,
        'dives_json': str(DIVES_JSON),
        'dive_profiles_json': str(DIVE_PROFILES_JSON),
        'public_dive_profiles_json': str(PUBLIC_DIVE_PROFILES_JSON),
    }, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
