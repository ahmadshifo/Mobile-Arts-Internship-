## BE-02 · Services database design

Both BE-02 design decisions were recorded on 24 November 2026.

### Tables and relationship

Each service belongs to exactly one operator. An operator may have zero or many services. The required foreign key `services.operator_id` points to `operators.operator_id`. This one-to-many relationship needs no junction table. The checkout and subscriber tables in the full application ERD belong to later work.

| Table | Column | MySQL type | Purpose and constraints |
|---|---|---|---|
| operators | operator_id | INT | Auto-increment primary key. |
| operators | name | VARCHAR(100) | Required and unique. Supplies the operator dropdown and display name. |
| services | service_id | INT | Auto-increment primary key. Exposed as `id` in the API. |
| services | operator_id | INT | Required foreign key. Restrict deleting an operator that has service records. |
| services | name, provider | TEXT each | Service name and content provider. Trim at input and require a nonblank value. |
| services | category | ENUM | Games, Video, Education, Health & fitness, News. |
| services | description | VARCHAR(120) | Optional description. |
| services | price_usd | DECIMAL(10,2) | Exact USD amount. Enforce `0 < price_usd <= 50`. Exposed as `price`. Store two decimal places. |
| services | cycle | ENUM | Daily, Weekly, Monthly. |
| services | trial_days | TINYINT | Allowed values are 0, 1, 3 and 7. |
| services | keyword | VARCHAR(10) | Validate 2–10 uppercase ASCII letters. |
| services | shortcode | VARCHAR(6) | Validate 3–6 ASCII digits. Text storage preserves leading zeros such as `0123`. |
| services | notification_url | TEXT | Require a valid absolute URL starting with `https://`. |
| services | send_welcome_sms | BOOLEAN | Whether the service sends a welcome SMS. |
| services | status | ENUM | Active or Paused. Paused services stay visible in the admin list. |
| services | subscriber_count | INT | Nonnegative. The API returns this as `subscribers`. Start newly created services at zero and preserve the seeded counts. |
| services | created_at | DATETIME(6) | Server-assigned UTC creation time. |
| services | deleted_at | DATETIME(6) | Nullable UTC deletion time. Starts at NULL. |

Only `description` and `deleted_at` are nullable. The API returns `operatorId` from the foreign key and `operatorName` from the related operator. Create and edit requests identify the operator by ID. The server manages the record ID, subscriber count and timestamps.

### Constraints and API behavior

- **Duplicate carrier commands.** Create a unique index on `(operator_id, keyword, shortcode)`. Cedar Mobile can have one service using `PLAY` and `1234`. Gulf Connect can independently use the same pair. During edit, exclude the current service's ID from the duplicate lookup. Map a conflict on this specific index to HTTP 409, including when two simultaneous saves pass the initial application check.
- **Soft deletion.** A successful DELETE sets `deleted_at` and returns 204. An EF Core query filter on `DeletedAt == null` hides the row from list results, pagination totals and by-ID reads. Later requests for that ID return 404. The row remains available in MySQL for historical reference.
- **Deleted codes.** A soft-deleted service keeps its keyword and shortcode reserved for its operator. The unique index covers every service row. Create and update duplicate checks must include soft-deleted rows and return HTTP 409 on a conflict.
- **Deployment.** EF Core Code First migrations create the schema, constraints and seed records. MySQL Workbench can then inspect the generated tables.

### Seed data from the Services design

Seed the operators once with stable IDs: 1 = Cedar Mobile, 2 = Gulf Connect, 3 = Nova Telecom. The operator IDs below are proposed seed identifiers. The five service IDs and display values follow the design.

| Service ID | Service | Provider | Operator ID | USD | Cycle | Trial days | Subscribers | Status |
|---:|---|---|---:|---:|---|---:|---:|---|
| 1 | CloudPlay Games | PixelForge Studio | 1 | 0.99 | Weekly | 1 | 18,420 | Active |
| 2 | Reels Video | Frameline Media | 2 | 1.49 | Weekly | 3 | 12,905 | Active |
| 3 | Kids Learn | BrightSteps | 3 | 2.99 | Monthly | 7 | 6,310 | Active |
| 4 | FitDaily | Pulse Labs | 1 | 0.49 | Daily | 0 | 9,870 | Paused |
| 5 | Headline Hub | Inkwell News | 2 | 0.99 | Weekly | 0 | 725 | Paused |

The initial unfiltered list should read **5 services · 3 active**. For fields absent from the list design, use the matching edit design and the original frontend mock seed when implementing the migration.

### Confirmed design decisions · 24 November 2026

1. **Carrier command reuse.** After soft deletion, the same operator cannot reuse the service’s keyword and shortcode combination. Another operator may use the same pair.
2. **USD prices.** Store `price_usd` as `DECIMAL(10,2)` and use C# `decimal` for the price. The allowed range remains greater than zero and at most $50. The existing frontend schema checks this range and currently accepts inputs with more than two decimal places.
