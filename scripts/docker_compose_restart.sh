#!/bin/bash

docker-compose stop
docker-compose start
docker-compose run restful_file_system env
