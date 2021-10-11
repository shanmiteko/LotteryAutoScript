#!/bin/bash
./lottery update

if [[ -r "latest_version.zip" ]]; then
    unzip latest_version.zip
    rm latest_version.zip
    chmod u+x lottery
fi