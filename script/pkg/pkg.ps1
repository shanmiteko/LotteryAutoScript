$README = "README.md"
$TEMPLATE_CONFIG_FILE = "my_config.example.js"
$TEMPLATE_ENV_FILE = "env.example.js"

$CONFIG_FILE = "my_config.js"
$ENV_FILE = "env.js"

$TARGET_DIR = ".\dist"

$NAME = 'lottery-auto-script'

$TRIARR = @(
    @("$NAME-win.exe", "lottery.exe", "nlts-win-x64"),
    @("$NAME-linux", "lottery", "nlts-linux-x64"),
    @("$NAME-macos", "lottery", "nlts-macos-x64")
)

if((Test-Path $TARGET_DIR) -eq "True") {
    Remove-Item -Path $TARGET_DIR -Recurse
}

npx pkg .

Copy-Item -Path $TEMPLATE_ENV_FILE -Destination $TARGET_DIR -Force
Copy-Item -Path $TEMPLATE_CONFIG_FILE -Destination $TARGET_DIR -Force
Copy-Item -Path $README -Destination $TARGET_DIR -Force

Set-Location -Path $TARGET_DIR

Move-Item -Path $TEMPLATE_ENV_FILE -Destination $ENV_FILE -Force
Move-Item -Path $TEMPLATE_CONFIG_FILE -Destination $CONFIG_FILE -Force

foreach ($TRI in $TRIARR) {
    $PROTO_BIN,$BIN,$DIR = $TRI

    New-Item -ItemType Directory -Force -Path $DIR
    
    Move-Item -Path $PROTO_BIN -Destination $BIN -Force

    Move-Item -Path $BIN -Destination $DIR -Force
    Copy-Item -Path $ENV_FILE -Destination $DIR -Force
    Copy-Item -Path $CONFIG_FILE -Destination $DIR -Force
    Copy-Item -Path $README -Destination $DIR -Force

    if ($DIR -eq "nlts-win-x64") {
        New-Item -Path $DIR -Name "start.bat" -ItemType File -Value "@echo off && lottery start && pause" -Force
        New-Item -Path $DIR -Name "check.bat" -ItemType File -Value "@echo off && lottery check && pause" -Force
        New-Item -Path $DIR -Name "clear.bat" -ItemType File -Value "@echo off && lottery clear && pause" -Force
        New-Item -Path $DIR -Name "update.bat" -ItemType File -Value "@echo off && lottery update && pause" -Force
    }

    Compress-Archive -Path $DIR -DestinationPath $DIR -Force
}

Remove-Item -Path $ENV_FILE
Remove-Item -Path $CONFIG_FILE
Remove-Item -Path $README