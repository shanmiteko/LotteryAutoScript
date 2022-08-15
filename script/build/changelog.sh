#!/usr/bin/env bash

# version: <major.minor.patch>
level=minor

npm version $level \
    --no-commit-hooks \
    --no-git-tag-version

OLD_VERSION_ARRAY=($(npm view lottery-auto-script version | tr '.' ' '))
major=${OLD_VERSION_ARRAY[0]}
minor=${OLD_VERSION_ARRAY[1]}
patch=${OLD_VERSION_ARRAY[2]}

case "${level}" in
"major")
    ((major += 1))
    minor=0
    patch=0
    ;;
"minor")
    ((minor += 1))
    patch=0
    ;;
*)
    ((patch += 1))
    ;;
esac

NEW_VERSION="$major.$minor.$patch"

echo "New Version: $NEW_VERSION"

GIT_LOG="$(git log --pretty=format:"* %h %s" | sed -e '/CHANGELOG/,$d' | sed ':a;N;s/\n/\\n/g;ta')"

sed -i "/# CHANGELOG/a\## 主要变化($NEW_VERSION)\n$GIT_LOG\n\n_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_\n" CHANGELOG.md

git add .
git commit -m "docs: 更新CHANGELOG"
