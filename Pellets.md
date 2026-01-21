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

${pellets.record_consumed_bags()}

${query[[from pellets.pellets_lager() order by date desc limit 5]]}

# Implementation

```space-lua
-- priority: 1
pellets = pellets or {}
pellets.path = "Data/Pellets Data"

function pellets.last_comment()
  local q = query[[
    from index.tag "meta/data/pellets"
    order by date desc
    limit 1
    select comment
  ]]
  return q[1]
end

function pellets.record_consumed_bags()
  return widget.new {
    html = "<button>Record Consumed Pellets</button>",
    events = {
      click = function()
        local _bags = editor.prompt("Enter number of consumed pellets bags", "")
        if not _bags then return end

        local last_comment = pellets.last_comment()
        local comment = editor.prompt("Enter comment (optional)", last_comment) or ""
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

function pellets.pellets_lager()
  local q = query[[
    from index.tag "meta/data/pellets"
    order by date
  ]]

  local rows = {}

  local running_storage = nil
  local prev_consumed_date = nil

  for i = 1, #q do
    local e = q[i]

    local comment = e.comment or ""
    local consumed = 0
    local consumed_per_day = nil

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
    else
      if running_storage then
        running_storage = running_storage + delta
      end
    end

    -- compute consumed/day only based on previous consumed entry
    if consumed > 0 and prev_consumed_date then
      local days = date.diff_days(prev_consumed_date, e.date)
      if days > 0 then
        consumed_per_day = consumed / days
      else
        consumed_per_day = consumed
      end
    end

    -- store structured row
    table.insert(rows, {
      date = e.date,
      validated = validated,
      storage = e.storage,
      running_storage = running_storage,
      consumed_per_day = consumed_per_day,
      comment = comment,
      added = e.added,
      consumed = e.consumed,
    })

    if consumed > 0 then
      prev_consumed_date = e.date
    end
  end

  return rows
end
```
