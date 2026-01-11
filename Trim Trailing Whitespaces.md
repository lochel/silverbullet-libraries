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
    data = editor.getText()
    if data:match("\n%s+$") then
      data = data:gsub("%s+$", "\n")
      space.writePage(e.data, data)
    end
  end
}
```
