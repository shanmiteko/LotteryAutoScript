#!/usr/bin/env bash

ROOT=$PWD
README="README.md"
TEMPLATE_CONFIG_FILE="my_config.example.js"
TEMPLATE_ENV_FILE="env.example.js"
CONFIG_FILE="my_config.js"
ENV_FILE="env.js"
TARGET_DIR="./dist"
BIN_NAME="lottery"

create_win_bat() {
	echo "@echo off && lottery $1 && pause"
}

if [ -d "$TARGET_DIR" ]; then
	rm -rf "$TARGET_DIR"
fi

npx pkg .

# Searching in the current directory
for file in "$TARGET_DIR/"*; do
	TMPDIR="${file%.exe}"
	TMPDIR_NAME="${TMPDIR##*/}"
	REMANE_FILE="$TARGET_DIR/$BIN_NAME"
	mv $file $REMANE_FILE
	mkdir -p "$TMPDIR/"
	mv $REMANE_FILE "$TMPDIR/"
	cp $README "$TMPDIR/"
	cp $TEMPLATE_CONFIG_FILE "$TMPDIR/$CONFIG_FILE"
	cp $TEMPLATE_ENV_FILE "$TMPDIR/$ENV_FILE"
	if [ "$(echo $file | grep '.exe')" ]; then
		BATS=("start" "check" "clear" "update")
		for item in "${BATS[@]}"; do
			create_win_bat "${item}" >"$TMPDIR/$item.bat"
		done
	else
		cat >"$TMPDIR/update.sh" <<-EOF
			#!/bin/bash
			./lottery update
			if [[ -r "latest_version.zip" ]]; then
			unzip latest_version.zip
			rm latest_version.zip
			chmod u+x lottery
			fi
		EOF
	fi
	cd $TMPDIR
	zip -r "$TMPDIR_NAME.zip" .
	mv "$TMPDIR_NAME.zip" ../
	cd $ROOT
done
