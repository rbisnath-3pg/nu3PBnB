# Locked Default Users

> **WARNING:** These users and credentials are locked for all environments and must never be changed. Any modification requires explicit approval and coordination across all deployments.

The following users are always present in every build, seed, and deployment:

| Email                        | Password   | Role   | Name              |
|------------------------------|------------|--------|-------------------|
| admin@nu3pbnb.com            | admin123   | admin  | Admin User        |
| Raul50@gmail.com             | host123    | host   | Raul Host         |
| Ashtyn.Barrows99@gmail.com   | host123    | host   | Ashtyn Barrows    |
| Evelyn_Feeney68@gmail.com    | guest123   | guest  | Evelyn Feeney     |
| Kristopher32@hotmail.com     | guest123   | guest  | Kristopher Guest  |

- These users are seeded by `scripts/seed-locked-users.js` from `locked-test-users.json`.
- All other users are deleted during seeding.
- Never change these credentials or add/remove users from this list. 