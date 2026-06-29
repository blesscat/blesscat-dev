#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import math
import sqlite3
from collections.abc import Iterable
from datetime import date
from pathlib import Path
from typing import Any

from garminconnect import Garmin

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = Path.home() / '.hermes' / 'logsDB' / 'dive-log.db'
TOKEN_DIR = Path.home() / '.garminconnect'
DIVES_JSON = ROOT / 'src' / 'data' / 'dives.json'
DIVE_PROFILES_JSON = ROOT / 'src' / 'data' / 'dive_profiles.json'
PUBLIC_DIVE_PROFILES_JSON = ROOT / 'public' / 'dive_profiles.json'
DEFAULT_SYNC_START = '2024-01-01'


def round_or_none(value: Any, digits: int = 1) -> float | None:
    if value is None:
        return None
    return round(float(value), digits)


def get_garmin_client() -> Garmin:
    garmin = Garmin()
    garmin.login(str(TOKEN_DIR))
    return garmin


def ensure_schema(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()
    columns = {row[1] for row in cur.execute('PRAGMA table_info(dives)')}
    if 'garmin_dive_number' not in columns:
        cur.execute('ALTER TABLE dives ADD COLUMN garmin_dive_number INTEGER')
        cur.execute(
            '''
            UPDATE dives
            SET garmin_dive_number = dive_number
            WHERE source = 'garmin' AND garmin_activity_id IS NOT NULL AND dive_number IS NOT NULL
            '''
        )
        conn.commit()


def first_gas(summary: dict[str, Any] | None) -> tuple[float | None, float | None]:
    gases = (summary or {}).get('summarizedDiveGases') or []
    if not gases:
        return None, None
    gas = gases[0] or {}
    return gas.get('oxygenContent'), gas.get('heliumContent')


def water_type_name(summary: dict[str, Any] | None) -> str | None:
    water_type = (summary or {}).get('waterType')
    if water_type is None:
        return None
    mapping = {
        0: 'fresh',
        1: 'salt',
    }
    return mapping.get(int(water_type))


def meter_from_cm(value: Any) -> float | None:
    if value is None:
        return None
    return round(float(value) / 100.0, 2)


def activity_sort_key(activity: dict[str, Any]) -> tuple[str, str, int]:
    return (
        str(activity.get('startTimeLocal') or ''),
        str(activity.get('startTimeGMT') or ''),
        int(activity.get('activityId') or 0),
    )


def renumber_dives(conn: sqlite3.Connection) -> int:
    cur = conn.cursor()
    rows = cur.execute(
        '''
        SELECT id
        FROM dives
        WHERE duplicate_of IS NULL
        ORDER BY date ASC, COALESCE(start_time_local, start_time_gmt, date) ASC, id ASC
        '''
    ).fetchall()
    for idx, (row_id,) in enumerate(rows, start=1):
        cur.execute('UPDATE dives SET dive_number = ? WHERE id = ?', (idx, row_id))
    conn.commit()
    return len(rows)


def upsert_activity(conn: sqlite3.Connection, activity: dict[str, Any], *, allow_insert: bool = True) -> tuple[str, int | None]:
    cur = conn.cursor()
    activity_id = str(activity['activityId'])
    existing = cur.execute(
        'SELECT id FROM dives WHERE garmin_activity_id = ?',
        (activity_id,),
    ).fetchone()

    summary = activity.get('summarizedDiveInfo') or {}
    o2_pct, he_pct = first_gas(summary)
    garmin_dive_number = activity.get('diveNumber')
    try:
        garmin_dive_number = int(garmin_dive_number) if garmin_dive_number is not None else None
    except (TypeError, ValueError):
        garmin_dive_number = None

    row_data = {
        'garmin_activity_id': activity_id,
        'source': 'garmin',
        'garmin_dive_number': garmin_dive_number,
        'date': str(activity.get('startTimeLocal') or activity.get('startTimeGMT') or '')[:10],
        'start_time_local': activity.get('startTimeLocal'),
        'start_time_gmt': activity.get('startTimeGMT'),
        'duration_s': activity.get('bottomTime') or activity.get('duration'),
        'elapsed_s': activity.get('elapsedDuration') or activity.get('duration'),
        'max_depth_m': meter_from_cm(activity.get('maxDepth')),
        'avg_depth_m': meter_from_cm(activity.get('avgDepth')),
        'water_temp_min_c': activity.get('minTemperature'),
        'water_temp_max_c': activity.get('maxTemperature'),
        'water_type': water_type_name(summary),
        'o2_pct': o2_pct,
        'he_pct': he_pct,
        'deco_dive': 1 if activity.get('decoDive') else 0,
        'avg_hr': activity.get('averageHR'),
        'max_hr': activity.get('maxHR'),
        'calories': activity.get('calories'),
        'surface_interval_s': (activity.get('surfaceInterval') or 0) / 1000.0 if activity.get('surfaceInterval') is not None else None,
        'start_lat': activity.get('startLatitude') or activity.get('beginLatitude'),
        'start_lon': activity.get('startLongitude') or activity.get('beginLongitude'),
        'end_lat': activity.get('endLatitude'),
        'end_lon': activity.get('endLongitude'),
        'dive_site': activity.get('locationName'),
        'location_country': None,
        'garmin_raw': json.dumps(activity, ensure_ascii=False),
    }

    if existing:
        cur.execute(
            '''
            UPDATE dives
            SET
              source = :source,
              garmin_dive_number = COALESCE(:garmin_dive_number, garmin_dive_number),
              date = :date,
              start_time_local = :start_time_local,
              start_time_gmt = :start_time_gmt,
              duration_s = :duration_s,
              elapsed_s = :elapsed_s,
              max_depth_m = :max_depth_m,
              avg_depth_m = :avg_depth_m,
              water_temp_min_c = :water_temp_min_c,
              water_temp_max_c = :water_temp_max_c,
              water_type = COALESCE(:water_type, water_type),
              o2_pct = :o2_pct,
              he_pct = :he_pct,
              deco_dive = :deco_dive,
              avg_hr = :avg_hr,
              max_hr = :max_hr,
              calories = :calories,
              surface_interval_s = :surface_interval_s,
              start_lat = COALESCE(:start_lat, start_lat),
              start_lon = COALESCE(:start_lon, start_lon),
              end_lat = COALESCE(:end_lat, end_lat),
              end_lon = COALESCE(:end_lon, end_lon),
              dive_site = COALESCE(:dive_site, dive_site),
              location_country = COALESCE(:location_country, location_country),
              garmin_raw = :garmin_raw
            WHERE garmin_activity_id = :garmin_activity_id
            ''',
            row_data,
        )
        return 'updated', existing[0]

    if not allow_insert:
        return 'skipped', None

    cur.execute(
        '''
        INSERT INTO dives (
          garmin_activity_id, source, garmin_dive_number, date,
          start_time_local, start_time_gmt,
          duration_s, elapsed_s,
          max_depth_m, avg_depth_m,
          water_temp_min_c, water_temp_max_c,
          water_type, o2_pct, he_pct,
          deco_dive, avg_hr, max_hr, calories,
          surface_interval_s,
          start_lat, start_lon, end_lat, end_lon,
          dive_site, location_country,
          garmin_raw
        ) VALUES (
          :garmin_activity_id, :source, :garmin_dive_number, :date,
          :start_time_local, :start_time_gmt,
          :duration_s, :elapsed_s,
          :max_depth_m, :avg_depth_m,
          :water_temp_min_c, :water_temp_max_c,
          :water_type, :o2_pct, :he_pct,
          :deco_dive, :avg_hr, :max_hr, :calories,
          :surface_interval_s,
          :start_lat, :start_lon, :end_lat, :end_lon,
          :dive_site, :location_country,
          :garmin_raw
        )
        ''',
        row_data,
    )
    return 'inserted', cur.lastrowid


def sync_garmin_to_db(garmin: Garmin, start_date: str, end_date: str) -> dict[str, Any]:
    activities = garmin.get_activities_by_date(start_date, end_date, activitytype='diving')
    activities = sorted(activities, key=activity_sort_key)

    conn = sqlite3.connect(DB_PATH)
    inserted = 0
    updated = 0
    inserted_ids: list[str] = []
    updated_ids: list[str] = []
    try:
        ensure_schema(conn)
        for activity in activities:
            status, _ = upsert_activity(conn, activity)
            if status == 'inserted':
                inserted += 1
                inserted_ids.append(str(activity['activityId']))
            elif status == 'updated':
                updated += 1
                updated_ids.append(str(activity['activityId']))
        total_rows = renumber_dives(conn)
        max_dive_number = conn.execute('SELECT COALESCE(MAX(dive_number), 0) FROM dives').fetchone()[0]
    finally:
        conn.close()

    return {
        'activities_fetched': len(activities),
        'inserted': inserted,
        'updated': updated,
        'inserted_ids': inserted_ids,
        'updated_ids': updated_ids,
        'total_rows': total_rows,
        'max_dive_number': max_dive_number,
    }


def load_dives() -> list[dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    ensure_schema(conn)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        '''
        SELECT
          dive_number,
          garmin_dive_number,
          date,
          start_time_local,
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
                'garmin_dive_number': row['garmin_dive_number'],
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


def build_profiles(garmin: Garmin, dives: Iterable[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
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


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Sync Garmin dive data into dive-log.db and export website JSON.')
    parser.add_argument('--skip-sync', action='store_true', help='Skip Garmin -> DB sync and export from current DB only.')
    parser.add_argument('--sync-start', default=DEFAULT_SYNC_START, help='Sync Garmin activities starting from this date (YYYY-MM-DD).')
    parser.add_argument('--sync-end', default=date.today().isoformat(), help='Sync Garmin activities until this date (YYYY-MM-DD).')
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if not DB_PATH.exists():
        raise FileNotFoundError(f'Dive DB not found: {DB_PATH}')
    if not TOKEN_DIR.exists():
        raise FileNotFoundError(f'Garmin token dir not found: {TOKEN_DIR}')

    sync_summary: dict[str, Any] | None = None
    if args.skip_sync:
        conn = sqlite3.connect(DB_PATH)
        try:
            ensure_schema(conn)
            total_rows = renumber_dives(conn)
            sync_summary = {
                'activities_fetched': 0,
                'inserted': 0,
                'updated': 0,
                'inserted_ids': [],
                'updated_ids': [],
                'total_rows': total_rows,
                'max_dive_number': conn.execute('SELECT COALESCE(MAX(dive_number), 0) FROM dives').fetchone()[0],
                'skip_sync': True,
            }
        finally:
            conn.close()
        garmin = get_garmin_client()
    else:
        garmin = get_garmin_client()
        sync_summary = sync_garmin_to_db(garmin, args.sync_start, args.sync_end)

    dives = load_dives()
    profiles = build_profiles(garmin, dives)

    dump_json(DIVES_JSON, dives)
    dump_json(DIVE_PROFILES_JSON, profiles)
    dump_json(PUBLIC_DIVE_PROFILES_JSON, profiles)

    with_profile = sum(1 for dive in dives if str(dive.get('num')) in profiles)
    payload = {
        'db_path': str(DB_PATH),
        'dives': len(dives),
        'dives_with_garmin_id': sum(1 for dive in dives if dive.get('garmin_id')),
        'dives_with_profile': with_profile,
        'dives_json': str(DIVES_JSON),
        'dive_profiles_json': str(DIVE_PROFILES_JSON),
        'public_dive_profiles_json': str(PUBLIC_DIVE_PROFILES_JSON),
    }
    if sync_summary is not None:
        payload['sync'] = sync_summary
    print(json.dumps(payload, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
