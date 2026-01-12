---
name: Library/lochel/Trim Trailing Whitespaces
tags: meta/library
---

# Trim Trailing Whitespaces

This library ensures your pages stay clean by removing any trailing whitespaces (spaces, tabs, and newlines) whenever a page is saved.

# Implementation

```space-lua
event.listen{
  name = "editor:pageSaving",
  run = function(e)
    local data = editor.getText()
    local trimmed = data:gsub("%s+$", "") .. "\n"
    
    if trimmed ~= data then
      space.writePage(e.data, trimmed)
    end
  end
}
```