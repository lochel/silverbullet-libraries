---
name: Library/lochel/Date
tags: meta/library
---

# Date

This library extends  the [[^Library/Std/APIs/Date]] functionality with additional helpers for parsing, formatting, and comparing dates and timestamps.

## Examples

${date.fromString("2025-12-07")}              -- should return 2025
${date.toString(2025, 12, 7)}        -- should return "2025-12-07"
${date.niceDate("2025-12-07T14:30:00")}  -- should return "2025-12-07 14:30"
${date.to_timestamp("2025-12-07 14:30")}        -- should return a UNIX timestamp
${date.diff_days("2025-12-07 14:30", "2025-12-09 14:30")}                 -- should return 2


# Implementation

```space-lua
-- priority: 9

-- Make sure the global `date` table exists
date = date or {}

-- Add a datetime format without overwriting existing fields
date.datetime_format = "%Y-%m-%d %H:%M"

local DAY_SECONDS = 60 * 60 * 24

-----------------------------------------------------------
-- Convert ISO-like string YYYY-MM-DD to y, m, d
-----------------------------------------------------------
function date.fromString(str)
  local y, m, d = str:match("(%d+)%-(%d+)%-(%d+)")
  return tonumber(y), tonumber(m), tonumber(d)
end

-----------------------------------------------------------
-- Convert y, m, d to string YYYY-MM-DD
-----------------------------------------------------------
function date.toString(y, m, d)
  return string.format("%04d-%02d-%02d", y, m, d)
end

-----------------------------------------------------------
-- Convert ISO timestamp YYYY-MM-DDTHH:MM:SS to
-- "YYYY-MM-DD HH:MM"
-----------------------------------------------------------
function date.niceDate(iso_timestamp)
  if not iso_timestamp then
    return "Invalid argument #1"
  end
  
  local year, month, day, hour, min, sec = iso_timestamp:match("(%d+)%-(%d+)%-(%d+)T(%d+):(%d+):(%d+)")

  if not year then
    return "Invalid ISO timestamp"
  end

  local time_table = {
    year = tonumber(year),
    month = tonumber(month),
    day = tonumber(day),
    hour = tonumber(hour),
    min = tonumber(min),
    sec = tonumber(sec),
    isdst = false, -- assume UTC
  }

  local timestamp = os.time(time_table)
  return os.date(date.datetime_format, timestamp)
end

-----------------------------------------------------------
-- Convert "YYYY-MM-DD HH:MM" to timestamp
-----------------------------------------------------------
function date.to_timestamp(datetime_str)
  local year, month, day, hour, min =
    datetime_str:match("(%d+)%-(%d+)%-(%d+)%s+(%d+):(%d+)")

  if not year then
    year, month, day = datetime_str:match("(%d+)%-(%d+)%-(%d+)")
    hour, min = 0, 0
    if not year then
      return "Invalid datetime format. Expected: YYYY-MM-DD HH:MM or YYYY-MM-DD"
    end
  end

  return os.time({
    year = tonumber(year),
    month = tonumber(month),
    day = tonumber(day),
    hour = tonumber(hour),
    min = tonumber(min),
    sec = 0,
  })
end

-----------------------------------------------------------
-- Return difference in days (fractional) between dt1 and
-- dt2
-----------------------------------------------------------
function date.diff_days(dt1, dt2)
  local t1 = date.to_timestamp(dt1)
  local t2 = date.to_timestamp(dt2)
  return (t2 - t1) / DAY_SECONDS
end

function date.now()
  return os.date(date.datetime_format)
end

function niceDate(ts) return date.niceDate(ts) end
```
