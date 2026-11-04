# Atlanta STR (Airbnb / VRBO) Property Managers Directory (Mogul)

Static comparison page of short-term rental management companies serving **Metro Atlanta**.

| File | Purpose |
|------|---------|
| `index.html` | Public directory page (includes City of Atlanta STR rules summary + disclosure) |
| `styles.css` | Layout (shared with the hard money site) |
| `app.js` | Search, service-model filter, sort |
| `managers.json` | Research data |
| `managers.embedded.js` | Same data embedded so `file://` works |
| `.github/workflows/pages.yml` | GitHub Pages deploy (Source: GitHub Actions) |

## Data rules

- Facts come only from each company's public pages, as of `verified` dates (initial pass **2026-10-30**; all 6 rows re-verified **2026-11-04**).
- Missing facts are **Not published**. Self-contradicting pages are flagged in the row (e.g. Awning's Atlanta page shows 5%, 10%, and 15% "starting" figures).
- Independent; not affiliated with any company listed. Not legal/tax/investment advice.
- City of Atlanta STR rules: https://www.atlantaga.gov/government/departments/city-planning/ordinances-regulations/short-term-rental

## Regenerate embed after editing JSON

```bash
python3 -c "import json; from pathlib import Path; d=json.load(open('managers.json')); Path('managers.embedded.js').write_text('window.MOGUL_MANAGERS = '+json.dumps(d, indent=2)+';\n')"
```

## Candidates for next pass

Vacasa/Casago (Atlanta franchise operator), local co-hosts, and Decatur/Sandy Springs-specific rule summaries.
