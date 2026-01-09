---
name: Library/lochel/Path
tags: meta/library
---

```space-lua
path = path or {}

-- Pops the last part of a path (like dirname)
function path.pop_path(p)
    -- normalize
    p = tostring(p or ""):gsub("\\", "/")

    -- handle empty / root
    if p == "" or p == "/" then return "" end

    -- drop trailing slashes (not turning "/" into "")
    p = p:gsub("/+$", "")

    -- capture everything before the last slash
    local parent = p:match("^(.*)/")
    return parent or ""
end

-- Joins a path with a new part
function path.add_to_path(path, part)
    -- If path is empty, just return the part
    if path == "" then
        return part
    end

    -- Remove trailing slash from path (unless root "/")
    path = path:gsub("/+$", "")

    -- Remove leading slashes from part
    part = part:gsub("^/+", "")

    -- Concatenate with a single slash
    return path .. "/" .. part
end
```

