# Despliegue en VPS con Docker

## 1. Preparar variables

```bash
cp .env.deploy.example .env.deploy
nano .env.deploy
```

Completa `POSTGRES_PASSWORD`, `JWT_SECRET` y `ROBOFLOW_API_KEY`.

## 2. Levantar servicios

```bash
docker compose --env-file .env.deploy up -d --build
```

La aplicacion queda publicada en:

```text
http://TU_IP_DEL_VPS
```

## 3. Ver logs

```bash
docker compose --env-file .env.deploy logs -f backend
docker compose --env-file .env.deploy logs -f arduino
docker compose --env-file .env.deploy logs -f frontend
```

## 4. Actualizar despues de hacer pull

```bash
git pull
docker compose --env-file .env.deploy up -d --build
```

## Nota sobre camara del navegador

En muchos navegadores, `getUserMedia` solo funciona en `localhost` o HTTPS. En un VPS real debes poner HTTPS con un dominio y un proxy como Nginx Proxy Manager, Caddy o Traefik. Sin HTTPS, la pantalla de clasificacion puede cargar, pero el navegador puede bloquear la camara.
