---
name: Library/lochel/Cursor
tags: meta/library
---

# Cursor

This library customizes the editor cursor appearance to improve visibility and focus. It replaces the default thin cursor with a slightly thicker, rounded blue caret, subtly taller than the text line and enhanced with a soft glow. The result is a more modern cursor that is easier to track during fast editing without being visually distracting.

**Credit**
Originally shared by avi-cenna on the SilverBullet forum: https://community.silverbullet.md/t/how-to-add-custom-styling-to-the-cursor/3017

# Implementation

## Caret

```space-style
.cm-cursor, .cm-dropCursor {
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

.sb-modal-box .cm-content .cm-line {
  caret-color: #007AFF;
}
```

## Active Line

```space-lua
function setupActiveLineHighlighter()
    local scriptEl = js.window.document.createElement("script")
    scriptEl.innerHTML = [[
    (function() {
        const CLASS_NAME = "sb-active-line";
        
        function updateActiveLine() {
            // 1. Find the primary cursor
            const cursor = document.querySelector(".cm-cursor-primary");
            if (!cursor) return;

            // 2. Get the cursor position
            const rect = cursor.getBoundingClientRect();
            // We shift slightly to the right to ensure we hit the line text area
            const x = rect.left + (rect.width / 2);
            const y = rect.top + (rect.height / 2);

            // 3. Find the element at that coordinate
            const elementAtCursor = document.elementFromPoint(x, y);
            const currentLine = elementAtCursor ? elementAtCursor.closest(".cm-line") : null;

            // 4. Clean up old highlights
            document.querySelectorAll("." + CLASS_NAME).forEach(el => {
                if (el !== currentLine) el.classList.remove(CLASS_NAME);
            });

            // 5. Apply new highlight
            if (currentLine && !currentLine.classList.contains(CLASS_NAME)) {
                currentLine.classList.add(CLASS_NAME);
            }
        }

        // Observer to watch for cursor movements (changes in style or DOM position)
        const observer = new MutationObserver((mutations) => {
            updateActiveLine();
        });

        // We need to wait for the editor to be available in the DOM
        const init = () => {
            const scroller = document.querySelector(".cm-scroller");
            if (scroller) {
                // Monitor the cursor layer for changes (blinking/moving)
                const cursorLayer = document.querySelector(".cm-cursorLayer");
                if (cursorLayer) {
                    observer.observe(cursorLayer, { attributes: true, subtree: true });
                }
                // Also update on scrolls and clicks
                scroller.addEventListener("scroll", updateActiveLine, { passive: true });
                window.addEventListener("click", () => setTimeout(updateActiveLine, 10));
                updateActiveLine();
            } else {
                setTimeout(init, 500);
            }
        };

        init();
    })();
    ]]
    js.window.document.body.appendChild(scriptEl)
end

-- Initialize the hack on page load
event.listen { 
    name = "editor:pageLoaded", 
    run = function() 
        setupActiveLineHighlighter() 
    end 
}
```

```space-style
.cm-line {
  transition: background-color 0.15s ease-out;
}

.sb-active-line {
  background-color: rgba(0, 122, 255, 0.2) !important;
}
```

## Task Attributes

source: https://community.silverbullet.md/t/decorate-attributes-with-emojis/3823

```space-style
/* color */
.sb-attribute[data-due]::before,
.sb-attribute[data-ask]::before,
.sb-attribute[data-pr]::before,
.sb-attribute[data-to]::before,
.sb-attribute[data-deadline]::before,
.sb-attribute[data-done]::before {
  background: none;
  color: var(--root-color); /* readable emoji color */
}

/* hide meta characters: [ : ] */
.sb-attribute:is([data-ask], [data-to], [data-pr], [data-due], [data-deadline], [data-done]) > .sb-list.sb-frontmatter.sb-meta {
  display: none;
  background: none;
}

/* hide attribute name */
.sb-attribute:is([data-ask], [data-to], [data-pr], [data-due], [data-deadline], [data-done]) > .sb-list.sb-frontmatter.sb-atom {
  display: none;
  background: none;
}

/* attribute value */
.sb-attribute:is([data-ask], [data-to], [data-pr], [data-due], [data-deadline], [data-done]) > .sb-list.sb-frontmatter {
  background: none;
}

/* entire attribute */
.sb-attribute {
  border: 1px solid rgba(0, 122, 255, 0.7) !important;
  border-radius: 6px;
  opacity: 0.7;
}

/* attribute decoration */
.sb-attribute[data-ask]::before {
  content: "🚩";
  display: inline;
}
.sb-attribute[data-to]::before {
  content: "🤵";
  display: inline;
}
.sb-attribute[data-pr]::before {
  content: "⚡️";
  display: inline;
}
.sb-attribute[data-due]::before {
  content: "📅";
  display: inline;
}
.sb-attribute[data-deadline]::before {
  content: "⌛";
  display: inline;
}
.sb-attribute[data-done]::before {
  content: "✅";
  display: inline;
}

#sb-main .cm-editor .cm-task-checked {
  text-decoration: none !important;
  opacity: 0.3;
}

#sb-main .cm-editor .cm-task-checked .sb-task {
  text-decoration: line-through;
}

#sb-main .cm-editor .cm-task-checked .sb-attribute {
  border: 1px solid gray !important;
}
```

```space-lua
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

```space-style
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


```space-lua
-- priority: 1
tasks = tasks or {}
tasks.done = False

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
      text = text .. " [done:" .. date.now() .. "]"
    end
    
    editor.replaceRange(e.data.from, e.data.to, text)
  end
}
```
