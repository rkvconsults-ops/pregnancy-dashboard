# Preg Journey Tracker

Installable, offline-first pregnancy journey tracker with client-side encrypted
backup, recovery-code linking, and encrypted cross-device sync.

Live journey: https://rkvconsults-ops.github.io/pregnancy-dashboard/?release=11

Live questionnaire: https://rkvconsults-ops.github.io/pregnancy-dashboard/pregnancy-intake-questionnaire.html?release=11

## Privacy

- Health entries are stored in the browser's IndexedDB.
- Cloud sync stores only AES-GCM encrypted envelopes.
- Encryption secrets and sync capabilities stay in the recovery code and trusted devices.
- GitHub contains app code and synthetic examples only. Never commit real user data,
  recovery codes, exported backups, or personalized configuration files.

This journey tracker organises user-supplied information. It is not medical advice.

## Tailored journey workflow

1. Share `pregnancy-intake-questionnaire.html` or its hosted link with the person.
2. They complete it locally and download the generated setup JSON.
3. They import that file into the journey tracker. The journey adopts their supplied
   name, dates, routine, meal choices, care context and tracking preferences.

The questionnaire and journey do not upload the intake answers. The setup file
must be handled as sensitive health information and must never be committed here.

## Local test

Serve this directory on localhost. The canonical source repository maintains
browser and synchronization regression tests before each release.
