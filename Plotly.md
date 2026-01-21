---
name: Library/lochel/Plotly
tags: meta/library
files:
- plotly.plug.js
---

This library provides Plotly integration for rendering charts. Use this library to embed interactive Plotly charts inside code widgets.

## Example
```plotly
{
    title = "Example Plot",
    data = {{x = 2, y = 5}, {x = 4, y = 2.1}, {x = 10, y = 6}}
}
```

```space-lua
slashCommand.define {
  name = "plotly",
  run = function()
    local tpl = "```plotly\n{\n  title = \"\",\n  data = |^|\n}\n```"
    editor.insertAtCursor(tpl, false, true)
  end
}

slashCommand.define {
  name = "plotly-example",
  run = function()
    local tpl = "```plotly\n{\n  title = \"|^|\",\n  data = query[[from index.tag \"page\" order by lastModified select {x=lastModified, y=size}]]\n}\n```"
    editor.insertAtCursor(tpl, false, true)
  end
}
```
