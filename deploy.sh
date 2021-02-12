#!/bin/sh

USER="kong0135"
MACHINE="csel-kh1250-03.cselabs.umn.edu"
DIRECTORY=".www/deepbrainvr/"

rm -rf dist/assets
cp -r assets dist/assets
rsync -avr --delete --chmod=D701,F644 dist/ "$USER"@"$MACHINE":"$DIRECTORY"
