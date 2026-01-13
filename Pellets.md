---
name: Library/lochel/Pellets
tags: meta/library
---

# Pellets

This library provides simple tools for tracking pellet usage and storage levels.

It includes:

- A button to record consumed pellet bags  
- A table overview showing storage changes and daily consumption rates  

## Usage

${record_consumed_bags()}
${print_pellets_lager()}

# Implementation

```space-lua
-- priority: 1
pellets = pellets or {}
pellets.path = "Data/Pellets Data"

function record_consumed_bags()
  return widget.new {
    html = "<button>Record Consumed Pellets</button>",
    events = {
      click = function()
        local _bags = editor.prompt("Enter number of consumed pellets bags", "")
        if not _bags then return end

        local comment = editor.prompt("Enter comment (optional)", "") or ""
        local _date = date.now()
        
        local record = "\n```#meta/data/pellets\n"
                     .. "date: \"" .. _date .. "\"\n"
                     .. "consumed: " .. _bags .. "\n"
                     .. "comment: \"" .. comment .. "\"\n"
                     .. "```\n"

        local content = space.readPage(pellets.path)
        space.writePage(pellets.path, content .. record)
        
        editor.flashNotification("Consumed record added")
      end
    }
  }
end

function print_pellets_lager()
  local q = query[[
    from index.tag "meta/data/pellets"
    order by date
  ]]

  local md = "| date | storage | consumed/day | comment |\n"
           .. "|---|:---:|:---:|---|\n"

  local running_storage = nil
  local prev_consumed_date = nil
  local prev_consumed_value = nil

  for i = 1, #q do
    local e = q[i]

    local comment = e.comment or ""
    local consumed = 0
    local consumed_per_day = ""
    local storage_display = ""

    -- determine delta
    local delta = 0
    if e.added then
      delta = e.added
    elseif e.consumed then
      delta = -e.consumed
      consumed = e.consumed
    end

    -- update running storage
    if e.storage then
      running_storage = e.storage
      storage_display = tostring(e.storage)
    else
      if running_storage then
        running_storage = running_storage + delta
        storage_display = "(" .. tostring(running_storage) .. ")"
      else
        storage_display = ""
      end
    end

    -- compute consumed/day only based on previous consumed entry
    if consumed > 0 and prev_consumed_date then
      local days = date.diff_days(prev_consumed_date, e.date)
      if days > 0 then
        consumed_per_day = string.format("%.2f", consumed / days)
      else
        consumed_per_day = tostring(consumed)
      end
    end

    md = md
      .. "| " .. e.date
      .. " | " .. storage_display
      .. " | " .. consumed_per_day
      .. " | " .. comment
      .. " |\n"

    -- update previous consumed trackers if this entry has consumed
    if consumed > 0 then
      prev_consumed_date = e.date
      prev_consumed_value = consumed
    end
  end

  return md
end
```
