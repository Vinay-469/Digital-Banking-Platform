# Repository Sharing Cleanup

- Removed committed demo login passwords and account PINs.
- Demo credentials are supplied through local environment variables.
- Missing or blank seeded credentials fail login and balance checks.
- Replaced contact, KYC, account, card, birth-date, and address fixtures with
  clearly synthetic examples; related service snapshots remain consistent.
- Removed unrelated business screenshots and an unused personal photo.
- Removed the repository owner's URL from the generic upload instructions.
- Git history, local secret files, keys, logs, caches, and generated output
  are excluded from this package.

This is a source-sharing cleanup, not a production security audit. The demo
authentication and persistence implementation still needs production hardening.
