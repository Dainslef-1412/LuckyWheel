# DATA_DESIGN.md

This file is the data source of truth for `luckyWheel`.

## Core Configuration Object

The app operates on one wheel configuration object:

```javascript
{
  title: "我的转盘",
  theme: "forest",
  items: [
    { id: "item-id", label: "选项A", weight: 1 }
  ]
}
```

## Fields

| Field | Type | Rule |
| --- | --- | --- |
| `title` | string | Display title for the wheel. Falls back to `我的转盘`. |
| `theme` | string | Theme key from `src/themes.js`; unknown values fall back to `forest`. |
| `items` | array | Ordered wheel options. At least two items are required to spin. |
| `items[].id` | string | Stable client-side identifier generated in the browser. |
| `items[].label` | string | User-facing option label. Empty labels fall back to generated labels. |
| `items[].weight` | positive integer | Relative probability weight. Invalid values normalize to `1`. |

## Derived Data

- Sector angle = `item.weight / totalWeight * 360`.
- Winning item is selected by cumulative weighted random.
- Theme colors are assigned cyclically from `src/themes.js`.
- Share URLs encode the current configuration as Base64 plus URI-encoded JSON in the `config` query parameter.

## Persistence

The app has no backend database.

| Data | Location | Owner |
| --- | --- | --- |
| Built-in presets | `src/presets.js` | Versioned with code. |
| User presets | `localStorage:zhuanpan-user-presets` | Browser-local user data. |
| Built-in preset overrides | `localStorage:zhuanpan-builtin-preset-overrides` | Browser-local user data. |
| Hidden built-in preset ids | `localStorage:zhuanpan-hidden-builtin-presets` | Browser-local user data. |
| Share config | URL `?config=` | Portable share state. |

## Privacy And Compatibility

- User-created presets stay in the browser unless the user shares a URL.
- Shared URLs may expose option labels and weights; do not put secrets in wheel options.
- URL decoding should stay backward-compatible whenever possible.
