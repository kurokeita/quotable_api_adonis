# Production build

## Using Docker

### Build and tag the docker image

`docker build --tag {tag_name} .`

### Run the docker image

```sh
  docker run --name release.0.1 \
    -e TZ=UTC \
    -e HOST=0.0.0.0 \ # This is to allows access the API from outside the docker container
    -e PORT=8080 \ # The docker image exposes port 8080 only, so the app should listen on this specific port
    -e LOG_LEVEL=info \
    -e APP_KEY="{APP_KEY}" \
    -e DB_HOST="{DB_HOST}" \
    -e DB_PORT="{DB_PORT}" \
    -e DB_PASSWORD="{DB_PASSWORD}" \
    -e DB_USER="{DB_USER}" \
    -e DB_DATABASE="{DB_DATABASE}" \
    -e HEALTH_CHECK_SECRET="{HEALTH_CHECK_SECRET}" \
    -e RESOURCES_MANIPULATION_API_KEY="{RESOURCES_MANIPULATION_API_KEY}" \
    -p {APP_PORT}:8080 \
    {tag_name}
```
