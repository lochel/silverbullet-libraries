---
name: Library/lochel/Journal Calendar
tags: meta/library
---

## Example
${widget.html(journal.calendar("Journal/", date.today(), true))}

## Implementation

```space-style
.calendar {
  --side-padding: 0px;
  --border-radius: 8px;
  --cell-size: 40px;

  /* Light Mode Variables */
  --bg-color: #ffffff;
  --text-color: #000000;
  --muted-text-color: #999999;
  --greyed-date-color: #cccccc;
  --select-bg: #f3f4f6;
  --week-bg: #f5f5f5;
  --week-text-color: #888888;
  --hover-bg: #f0f0f0;
  --content-bg: #dbeafe;
  --selected-border: #000000;
  --today-color: red;

  width: fit-content;
  font-family: sans-serif;
}

@media (prefers-color-scheme: dark) {
  .calendar {
    --bg-color: #1e1e1e;
    --text-color: #ffffff;
    --muted-text-color: #cccccc;
    --greyed-date-color: #555555;
    --select-bg: #2c2c2c;
    --week-bg: #2a2a2a;
    --week-text-color: #bbbbbb;
    --hover-bg: #333333;
    --content-bg: #3b82f6;
    --selected-border: #ffffff;
    --today-color: #ff6b6b;
  }
}

.calendar select {
  background: var(--select-bg);
  border: none;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--text-color);
}

.calendar__body {
  background: var(--bg-color);
}

.calendar__days {
  display: grid;
  grid-template-columns: repeat(8, var(--cell-size));
  text-align: center;
  font-weight: bold;
  font-size: 0.85rem;
  color: var(--muted-text-color);
  padding: 4px;
}

.calendar__dates {
  display: grid;
  grid-template-columns: repeat(8, var(--cell-size));
  padding: 4px;
}

.calendar__date,
.calendar__week {
  width: var(--cell-size);
  height: var(--cell-size);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--text-color);
}

.calendar__date span {
  position: relative;
  z-index: 1;
  text-decoration: none;
}

.calendar__date a {
  color: inherit;
  text-decoration: none;
}

.calendar__date::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  z-index: 0;
  transition: background 0.2s ease;
}

.calendar__date--grey {
  color: var(--greyed-date-color);
  cursor: default;
}

/* Hover effect */
.calendar__date:hover:not(.calendar__date--grey):not(.calendar__week)::before {
  background: var(--hover-bg);
  width: 80%;
  height: 80%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Has content */
.calendar__date--has-content::before {
  background: var(--content-bg);
}

/* Selected */
.calendar__date--selected::before {
  background: none;
  border: 2px solid var(--selected-border);
}

.calendar__date--selected span {
  color: var(--selected-border);
}

/* Today */
.calendar__date--today span {
  color: var(--today-color);
}

/* Today + Selected */
.calendar__date--today-selected::before {
  background: none;
  border: 2px solid var(--selected-border);
}

.calendar__date--today-selected span {
  color: var(--today-color);
}

/* Has content + selected */
.calendar__date--has-content.calendar__date--selected::before {
  background: #1752ff;
  border: none;
}

.calendar__date--has-content.calendar__date--selected span {
  color: white;
}

/* Today + Selected + Has Content */
.calendar__date--today-selected.calendar__date--has-content::before {
  background: none;
  border: 2px solid var(--selected-border);
}

.calendar__date--today-selected.calendar__date--has-content span {
  color: var(--today-color);
}

/* Week number (inert) */
.calendar__week {
  background: var(--week-bg);
  color: var(--week-text-color);
  pointer-events: none;
  cursor: default;
  font-weight: bold;
}

.calendar__week::before {
  display: none;
}

.calendar__date--today-selected-has-content::before {
  background: var(--content-bg);
  border: 2px solid var(--selected-border);
}

.calendar__date--today-selected-has-content span {
  color: var(--today-color);
}
```

```space-lua
journal = journal or {}
journal.weekNumbers = true
journal.template = "## Schedule\n* \n\n## Notes\n* "

function journal.calendar(root, today, nav)
  local monthNames = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" }
  local daysOfWeek = { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" }

  local function getWeekday(y, m, d)
    local t = os.time({ year = y, month = m, day = d })
    local w = tonumber(os.date("%w", t))
    return (w + 6) % 7
  end

  local function daysInMonth(y, m)
    if m == 2 then
      if (y % 4 == 0 and y % 100 ~= 0) or (y % 400 == 0) then return 29 else return 28 end
    elseif m == 4 or m == 6 or m == 9 or m == 11 then return 30 else return 31 end
  end

  local function getWeekNumber(y, m, d)
    local t = os.time({ year = y, month = m, day = d })
    return string.format("%02d", tonumber(os.date("%V", t)))
  end

  local function localfromString(str)
    local y, m, d = str:match("(%d+)%-(%d+)%-(%d+)")
    return tonumber(y), tonumber(m), tonumber(d)
  end

  local function makeOption(val, label, selectedVal)
    local selected = val == selectedVal and " selected" or ""
    return string.format("<option%s>%s</option>", selected, label)
  end

  local year, month, selectedDay = localfromString(today)
  local todayStr = date.today()

  local opts = "<div class='calendar__opts'>"
  opts = opts .. "<select name='calendar__month' id='calendar__month' onchange=\"(function(m,y){location.href='" .. root .. "' + y + '-' + (m<9?'0':'') + (m+1) + '-01'})(this.selectedIndex, document.getElementById('calendar__year').value)\">"
  for i, mName in ipairs(monthNames) do
    opts = opts .. makeOption(i, mName, month)
  end
  opts = opts .. "</select>"

  opts = opts .. "<select name='calendar__year' id='calendar__year' onchange=\"(function(m,y){location.href='" .. root .. "' + y + '-' + (m<9?'0':'') + (m+1) + '-01'})(document.getElementById('calendar__month').selectedIndex, this.value)\">"
  for y = year - 5, year + 5 do
    opts = opts .. makeOption(y, tostring(y), year)
  end
  opts = opts .. "</select></div>"

  local daysHtml = "<div class='calendar__days'><div>#</div>"
  for _, d in ipairs(daysOfWeek) do daysHtml = daysHtml .. "<div>" .. d .. "</div>" end
  daysHtml = daysHtml .. "</div>"

  local dateHtml = "<div class='calendar__dates'>"
  local firstDay = getWeekday(year, month, 1)
  local numDays = daysInMonth(year, month)

  local prevMonth = (month == 1) and 12 or (month - 1)
  local prevYear = (month == 1) and (year - 1) or year
  local prevMonthDays = daysInMonth(prevYear, prevMonth)

  local totalCells = firstDay + numDays
  local rows = math.ceil(totalCells / 7)
  local day = 1
  local cellIndex = 0

  for r = 1, rows do
    local weekStartDay = (r == 1 and 1) or (day)
    dateHtml = dateHtml .. "<div class='calendar__date calendar__week'>" .. getWeekNumber(year, month, weekStartDay) .. "</div>"

    for wd = 0, 6 do
      cellIndex = (r - 1) * 7 + wd
      local content = ""
      local class = "calendar__date"

      if cellIndex < firstDay then
        local d = prevMonthDays - firstDay + cellIndex + 1
        content = string.format("<span>%d</span>", d)
        class = class .. " calendar__date--grey"
      elseif day > numDays then
        content = string.format("<span>%d</span>", day - numDays)
        class = class .. " calendar__date--grey"
        day = day + 1
      else
        local dateStr = date.toString(year, month, day)
        local page = root .. dateStr
        content = string.format("<a href='%s'><span>%d</span></a>", page, day)

        local isToday = (dateStr == todayStr)
        local isSelected = (dateStr == today)
local hasContent = space.fileExists(root .. dateStr .. ".md")

if isToday and isSelected and hasContent then
  class = class .. " calendar__date--today-selected-has-content"
elseif isToday and isSelected then
  class = class .. " calendar__date--today-selected"
elseif isToday then
  class = class .. " calendar__date--today"
elseif isSelected then
  class = class .. " calendar__date--selected"
end

if hasContent then
  class = class .. " calendar__date--has-content"
end


        day = day + 1
      end

      dateHtml = dateHtml .. string.format("<div class='%s'>%s</div>", class, content)
    end
  end

  dateHtml = dateHtml .. "</div>"
  local html = "<div class='calendar'>"
  if nav then html = html .. opts end
  html = html .. "<div class='calendar__body'>" .. daysHtml .. dateHtml .. "</div></div>"

  return html
end

function journal.summary(root, days)
  function _trimTrailingWhitespaces(pageName)
    text = space.readPage(pageName)
    text = text:gsub("%s+$", "\n")
    return text
  end
  
  local year, month, day = date.fromString(date.today())
  local text = ""

  for i = 0, days do
    local ts = os.time({year=year, month=month, day=day}) + i * 86400
    local dateStr = os.date("%Y-%m-%d", ts)
    if space.fileExists(root .. dateStr .. ".md") then
      text = text .. "## [[" .. root .. dateStr .. "|" .. os.date("%A, %d/%m", ts) .. "]]\n"
      text = text .. _trimTrailingWhitespaces(root .. dateStr)
    end
  end

  if text == "" then
    return "*(no summary available)*"
  end

  return text
end
```

## Widget
```space-lua
widgets = widgets or {}

function widgets.journalCalendar(options)
  options = options or {}

  local pageName = editor.getCurrentPage()
  local root, ymd = pageName:match("^(.*/)(%d+%-%d+%-%d+)$")
  
  if root == nil then
    return
  end

  return widget.new {
    html = journal.calendar(root, ymd, true)
  }
end

event.listen {
  name = "hooks:renderTopWidgets",
  run = function(e)
    return widgets.journalCalendar()
  end
}
```


## Templates
```space-lua
event.listen {
  name = "editor:pageCreating",
  run = function(e)
    local root, y, m, d = e.data.name:match("^(.*/)(%d+)%-(%d+)%-(%d+)$")
    if root == nil then
      return
    end

    return {
      text = journal.template,
      perm = "rw"
    }
  end
}
```

```space-lua
event.listen {
  name = "editor:pageCreating",
  run = function(e)
    local root = e.data.name:match("^(.*/)-Journal$")
    if root == nil then
      return
    end

    local text = "## Journal Pages\n${query[[from index.tag \"page\" where name:startsWith(\"" .. e.data.name .. "/\") order by name desc select \"[[\" .. name .. \"]]\"]]}\n"

    return {
      text = text,
      perm = "ro"
    }
  end
}
```

```space-lua
event.listen {
  name = "editor:pageCreating",
  run = function(e)
    local root, y, wn = e.data.name:match("^(.*/)(%d+)%-(v%d+)$")
    if not wn then return end

    local year = tonumber(y)
    local week = tonumber(wn:sub(2))  -- remove "v"

    local approx = os.time({year = year, month = 1, day = 1}) + (week - 2) * 7 * 86400

    local text = "# " .. year .. " " .. wn .. "\n\n"
    for i = 0, 13 do  -- check two full weeks (14 days)
      local ts = approx + i * 86400
      local w = tonumber(os.date("%V", ts))
      if w == week then
        local dateStr = os.date("%Y-%m-%d", ts)
        if space.fileExists(root .. dateStr .. ".md") then
          text = text .. "## [[" .. root .. dateStr .. "|" .. os.date("%A, %d/%m", ts) .. "]]\n"
          text = text .. "![[" .. root .. dateStr .. "|" .. dateStr .. "]]\n\n"
        end
      end
    end

    return {
      text = text,
      perm = "ro"
    }
  end
}
```