# Deploy Hirely on Render

The root `render.yaml` Blueprint creates the frontend, four private Node services, and a private Redis-compatible Key Value instance. It uses the existing Neon PostgreSQL database and an external Kafka cluster; it does not copy local database data or put secrets in Git.

## Before deploying

Have these production values ready:

- Neon PostgreSQL connection string (`DB_URL`). Enter the same value for auth, user, and job.
- Cloudinary cloud name, API key, and API secret.
- Google Gemini API key.
- Gmail SMTP address and app password for outgoing email.
- Kafka bootstrap host and port, plus a Kafka API key and secret for SASL/PLAIN over TLS. The API key must be allowed to create and use the `send-mail` topic.

The code uses `@neondatabase/serverless`, so `DB_URL` must be a Neon connection string. The Kafka settings use KafkaJS SASL_SSL with the PLAIN mechanism when both `KAFKA_SASL_USERNAME` and `KAFKA_SASL_PASSWORD` are set.

## Create the Render services

1. Push the repo to GitHub and connect it to Render.
2. In Render, create a new Blueprint from this repository and select `render.yaml`.
3. Enter the prompted secrets. Reuse the same Neon `DB_URL` for auth, user, and job. Render generates `JWT_SEC` once and shares it with the user and job services.
4. Wait for all services to finish deploying. Render assigns the frontend's public `onrender.com` URL and the Blueprint passes it to auth for password-reset links.
5. Open the frontend URL and verify registration, login, uploads, job search, and resume analysis.

All services are configured for Singapore so their Render private-network calls work. The frontend is on Render's free web plan and can sleep after inactivity. The four private application services use the smallest paid plan; Render charges for these services and any paid datastore usage. The Redis-compatible free instance is private to the Render network and does not persist data across restarts, which can invalidate outstanding password-reset tokens after a restart.

If the Blueprint deploy fails, inspect the failing service's Render logs first. For Kafka connection errors, check that `kafka_broker` is only `hostname:port` (no scheme), and that the SASL credentials and topic permissions are valid.
