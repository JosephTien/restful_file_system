# Restful File System

### Execute

```
docker-compose up web
```

### Test
```
docker-compose up web-tests
```

### Todo
- Use OpenApi (e.g. Swagger)
- Store Log (Should've been considered by using docker-compose)
- Debounce
- Report Failing reason to client
- Decrease async lock grind
- Find a better way to define tag
- Handling bad params
- Put more handling (e.g. Add more log) in try-catch clause
- Create path with correct seperator (With docker, this should not be an issue anymore)
- Storage sandbox (With docker, this is not an issue anymore)
- Storage Cache
- More test conbination exhaustively
