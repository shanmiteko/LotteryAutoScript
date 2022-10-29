#!/usr/bin/env bash

set -e

ROOT=$PWD
README="README.md"
TEMPLATE_CONFIG_FILE="my_config.example.js"
TEMPLATE_ENV_FILE="env.example.js"
CONFIG_FILE="my_config.js"
ENV_FILE="env.js"
TARGET_DIR="dist"
BIN_NAME="lottery"

create_win_bat() {
	echo "@echo off && lottery $1 && pause"
}

if [ -d "$TARGET_DIR" ]; then
	rm -rf "$TARGET_DIR"
fi

if [[ -z "$1" ]]; then
	$1=node18-linux-x64
fi

mkdir -p $TARGET_DIR

if [[ "$1" == *"arm"* ]]; then
	sudo podman run --rm --privileged multiarch/qemu-user-static --reset -p yes
	podman run -it --rm -v ${PWD}/dist:/root/lottery/dist shanmite/pkg-arm64
elif [[ "$1" == *"x64"* ]]; then
	OUTFILE="$TARGET_DIR/lottery-auto-script-$1"
	npx pkg -t "$1" -o $OUTFILE .
fi

for file in "$TARGET_DIR/"*; do
	TMPDIR="${file%.exe}"
	TMPDIR_NAME="${TMPDIR##*/}"
	REMANE_FILE="$TARGET_DIR/$BIN_NAME"
	mv $file $REMANE_FILE
	mkdir -p "$TMPDIR.d/"
	mv $REMANE_FILE "$TMPDIR.d/"
	cp $README "$TMPDIR.d/"
	cp $TEMPLATE_CONFIG_FILE "$TMPDIR.d/$CONFIG_FILE"
	cp $TEMPLATE_ENV_FILE "$TMPDIR.d/$ENV_FILE"
	if [ "$(echo $file | grep '.exe')" ]; then
		BATS=("start" "check" "clear" "update")
		for item in "${BATS[@]}"; do
			create_win_bat "${item}" >"$TMPDIR.d/$item.bat"
		done
		mv "$TMPDIR.d/$BIN_NAME" "$TMPDIR.d/$BIN_NAME.exe"
	else
		ZIP_NAME=latest_version0
		cat >"$TMPDIR.d/update.sh" <<-EOF
			#!/bin/bash
			./lottery update
			ZIP_NAME=$ZIP_NAME
			if [[ -r "\$ZIP_NAME.zip" ]]; then
			unzip \$ZIP_NAME.zip
			rm \$ZIP_NAME.zip
			chmod u+x lottery
			fi
		EOF
	fi
	cd $TMPDIR.d
	zip -r "$TMPDIR_NAME.zip" .
	mv "$TMPDIR_NAME.zip" ../
	cd $ROOT
done
