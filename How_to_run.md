so to run this next time first docker compose up -d then npm run dev
for front thats it ?

• Yes, for normal local run that’s enough:

1. In Backend/:
   docker compose up -d
2. In project root (frontend):
   npm run dev

Optional when code changed:

- Backend rebuild: docker compose up --build -d
- Check backend logs: docker compose logs -f api

Access DB

docker compose exec db psql -U admin -d threat_intel

verif block chain
SELECT
ioc_id,
event_type,
tx_hash,
block_number,
recorded_at
FROM blockchain_records
ORDER BY recorded_at DESC;
