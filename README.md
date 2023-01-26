# Image Converter

This repository is a demo for converting a JPG image to webP and creates new image dimensions with sharp as a dependency.

## Pre requirements

You need to install the following software:

- [Docker](https://docs.docker.com/get-docker/)

## Installation

```sh
docker run -w `pwd` -v `pwd`:`pwd` node:slim yarn install
```

## Run project

```sh
docker run -w `pwd` -v `pwd`:`pwd` node:slim yarn resizer
```