---
name: Library/lochel/Tasks
tags: meta/library
---

# Tasks

source: https://community.silverbullet.md/t/decorate-attributes-with-emojis/3823

```space-style
/* common attribute selector */
.sb-attribute:is(
  [data-ask],
  [data-to],
  [data-pr],
  [data-due],
  [data-deadline],
  [data-done]
) {
  /* padding inside the box */
  padding: 0px 6px; /* 6px left/right */
}

/* emoji prefix (shared) */
.sb-attribute:is(
  [data-ask],
  [data-to],
  [data-pr],
  [data-due],
  [data-deadline],
  [data-done]
)::before {
  background: none;
  color: var(--root-color);
  display: inline;
}

/* hide meta + attribute name */
.sb-attribute:is(
  [data-ask],
  [data-to],
  [data-pr],
  [data-due],
  [data-deadline],
  [data-done]
) > .sb-list.sb-frontmatter {
  background: none;
}

.sb-attribute:is(
  [data-ask],
  [data-to],
  [data-pr],
  [data-due],
  [data-deadline],
  [data-done]
) > .sb-list.sb-frontmatter.sb-meta,
.sb-attribute:is(
  [data-ask],
  [data-to],
  [data-pr],
  [data-due],
  [data-deadline],
  [data-done]
) > .sb-list.sb-frontmatter.sb-atom {
  display: none;
}

/* emoji mapping */
.sb-attribute[data-ask]::before      { content: "🚩"; }
.sb-attribute[data-to]::before       { content: "🤵"; }
.sb-attribute[data-pr]::before       { content: "⚡️"; }
.sb-attribute[data-due]::before      { content: "📅"; }
.sb-attribute[data-deadline]::before { content: "⌛"; }
.sb-attribute[data-done]::before     { content: "✅"; }
```

## Don’t strike attributes
```space-style
#sb-main .cm-editor .cm-task-checked {
  text-decoration: none !important;
  opacity: 0.3;
  filter: grayscale(1);

  .sb-task {
    text-decoration: line-through;
  }
}
```

## Auto insert done-attribute
```space-lua
-- priority: 1
tasks = tasks or {}
tasks.done = false

event.listen {
  name = "task:stateChange",
  run = function(e)
    local function find_attr(s, attr)
      local a, b = string.find(s, "%[" .. attr .. "[^%]]*%]")
      return a, b
    end

    if not tasks.done then
      return
    end

    local text = e.data.text

    -- remove old attribute
    local attr_start, attr_end = find_attr(text, "done")
    if attr_start ~= nil then
      text = text:sub(1, attr_start - 1) .. text:sub(attr_end + 1)
      text = text:trimEnd()
    end

    -- set new state
    text = text:gsub("^%[[^%]]*%]", "[" .. e.data.newState .. "]")
    
    -- set new attribute
    if e.data.newState == "x" then
      text = text .. "[done:" .. date.now() .. "]"
    end
    
    editor.replaceRange(e.data.from, e.data.to, text)
  end
}
```

## For Debugging

```lua
command.define {
  name = "toggle-attr-display",
  key = "Ctrl-Alt-a",
  run = function()
    local body = js.window.document.body
    if not body then
      editor.flashNotification("Body inaccessible")
      return
    end

    local classStr = body.className or ""
    local hasAlt = classStr:find("attr%-alt%-display") ~= nil

    if hasAlt then
      body.className = classStr:gsub("%s*attr%-alt%-display", "")

      editor.flashNotification("Attribute highlight: disabled")
    else
      body.className = classStr .. " attr-alt-display"
      editor.flashNotification("Attribute highlight: enabled")
    end
  end
}
```

```style
body.attr-alt-display .sb-attribute {
  border: 1px solid orange !important ;
}
body.attr-alt-display .sb-attribute > .sb-list.sb-frontmatter.sb-meta {
  display: inline !important;
  background: green; 
}
body.attr-alt-display .sb-attribute > .sb-list.sb-frontmatter.sb-atom {
  display: inline !important;
  background: yellow;
}
body.attr-alt-display .sb-attribute > .sb-list.sb-frontmatter {
  display: inline !important;
  background: red;
}
```
