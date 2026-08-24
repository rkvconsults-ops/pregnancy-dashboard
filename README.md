# Pregnancy Dashboard

Installable, offline-first pregnancy support dashboard with client-side encrypted
backup, recovery-code linking, and encrypted cross-device sync.

## Privacy

- Health entries are stored in the browser's IndexedDB.
- Cloud sync stores only AES-GCM encrypted envelopes.
- Encryption secrets and sync capabilities stay in the recovery code and trusted devices.
- GitHub contains app code and synthetic test fixtures only. Never commit real user data,
  recovery codes, exported backups, or personalized configuration files.

This dashboard organises user-supplied information. It is not medical advice.

## Local test

Serve this directory on localhost. The canonical source repository maintains
browser and synchronization regression tests before each release.
