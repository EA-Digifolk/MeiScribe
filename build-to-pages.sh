#!/bin/bash

npm install && npm run build && git push origin `git subtree split --prefix dist main`:gh-pages --force
