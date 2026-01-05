---
name: Library/Silver/Cursor
tags: meta/library
---

## Cursor

This library customizes the editor cursor appearance to improve visibility and focus. It replaces the default thin cursor with a slightly thicker, rounded blue caret, subtly taller than the text line and enhanced with a soft glow. The result is a more modern cursor that is easier to track during fast editing without being visually distracting.

**Credit**
Originally shared by avi-cenna on the SilverBullet forum: https://community.silverbullet.md/t/how-to-add-custom-styling-to-the-cursor/3017

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