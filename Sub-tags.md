---
name: Library/lochel/Sub-tags
tags: meta/library
---

# Example
${query[[
  from index.tag "page"
  where matchSubTag(tags, "meta")
  order by lastModified desc
  limit 5
  select {Name="[[" .. name .. "]]", Tags=tags}
]]}

# Implementation
```space-lua
-- priority: 5

function tableContains(tbl, element)
  for _, value in ipairs(tbl) do
    if value == element then
      return true
    end
  end
  return false
end

function matchSubTag(tbl, element)
  for _, value in ipairs(tbl) do
    if value == element or value.startsWith(element .. '/') then
      return true
    end
  end
  return false
end
```
