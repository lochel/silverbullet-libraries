---
name: Library/lochel/Sub-pages
tags: meta/library
---
# Sub-pages

## Example
${widgets.subPages(path.getParent())}

## Implementation
```space-lua
-- priority: 9
widgets = widgets or {}

function widgets.subPages(pageName)
  local parent = path.getParent(pageName or editor.getCurrentPage())
  local prefix = (pageName or editor.getCurrentPage()) .. "/"
  local pages = query[[
    from index.tag "page"
    where name:startsWith(prefix)
    order by name
  ]]
  
  local md = ""

  if space.pageExists(parent) then
    md = "# Parent\n* [[" .. parent .. "]]\n"
  end
  
  local last_path = ""
  for _, page in ipairs(pages) do
    if path.pop_path(page.name) ~= last_path then
      last_path = path.pop_path(page.name)
      md = md .. "# Sub-pages " .. last_path .. "\n"
    end
    md = md .. "* [[" .. page.name .. "]]\n"
  end
  
  return widget.new {
    markdown = md
  }
end

event.listen {
  name = "hooks:renderTopWidgets",
  run = function(e)
    return widgets.subPages()
  end
}
```
