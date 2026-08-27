# Pregnancy Dashboard

Installable, offline-first pregnancy support dashboard with client-side encrypted
backup, recovery-code linking, and encrypted cross-device sync.

Live dashboard: https://rkvconsults-ops.github.io/pregnancy-dashboard/?release=9

Live questionnaire: https://rkvconsults-ops.github.io/pregnancy-dashboard/pregnancy-intake-questionnaire.html?release=9

## Privacy

- Health entries are stored in the browser's IndexedDB.
- Cloud sync stores only AES-GCM encrypted envelopes.
- Encryption secrets and sync capabilities stay in the recovery code and trusted devices.
- GitHub contains app code and synthetic examples only. Never commit real user data,
  recovery codes, exported backups, or personalized configuration files.

This dashboard organises user-supplied information. It is not medical advice.

## Tailored dashboard workflow

1. Share `pregnancy-intake-questionnaire.html` or its hosted link with the person.
2. They complete it locally and download the generated setup JSON.
3. They import that file into the dashboard. The dashboard adopts their supplied
   name, dates, routine, meal choices, care context and tracking preferences.

The questionnaire and dashboard do not upload the intake answers. The setup file
must be handled as sensitive health information and must never be committed here.

## Local test

Serve this directory on localhost. The canonical source repository maintains
browser and synchronization regression tests before each release.
