# Artalk production deployment

This directory contains the non-secret production definition for `vps-xq`.

1. In Cloudflare Zero Trust, add the public hostname `artalk.xqcherry.top` to the existing tunnel. Its service is `https://nginx:443`; enable **No TLS Verify**, matching the current blog and Waline routes.
2. Copy `docker-compose.yml` to `/srv/artalk/` and start the service with `docker compose up -d` from that directory. Artalk data is persisted at `/srv/artalk/data`.
3. Copy `nginx.conf` to `/srv/nginx/conf/artalk.conf` and run `docker exec nginx nginx -t` followed by `docker exec nginx nginx -s reload`.
4. Verify `https://artalk.xqcherry.top/api/v2/conf` and submit a test comment from `https://blog.xqcherry.top`.
5. Only after the Cloudflare Pages frontend deployment and an end-to-end test, remove the Waline tunnel hostname and Nginx configuration, then stop/remove the `waline` container and delete `/srv/waline` and `/data/waline`.

Do not expose Artalk with a host port. It is reachable only on Docker's external `web` network through Nginx and the Cloudflare Tunnel.
