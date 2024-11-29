#!/bin/sh

npm run build && git --git-dir=https://github.com/EA-Digifolk/MeiConstructor.git subtree push --prefix dist origin gh-pages