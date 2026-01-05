---
name: Library/Silver/Cursor
tags: meta/library
---

## Cursor

```space-style
.cm-cursor {
  border-left: 3px solid #007AFF !important;
  border-right: none !important;
  margin-left: -1px !important;
  
  /* Make it taller - add padding top and bottom */
  padding-top: 2px !important;
  padding-bottom: 2px !important;
  margin-top: -2px !important;  /* Compensate for padding to keep alignment */
  
  /* Round the corners */
  border-radius: 0.7px !important;
  
  /* Optional: Add a subtle glow effect */
  box-shadow: 0 0 3px rgba(0, 122, 255, 0.4) !important;
}
```