$README = "README.md"
$TEMPLATE_CONFIG_FILE = "my_config.example.js"
$TEMPLATE_ENV_FILE = "env.example.js"

$CONFIG_FILE = "my_config.js"
$ENV_FILE = "env.js"

$TARGET_DIR = ".\dist"

$TRIARR = @(
    @("lottery-in-bili-win.exe", "lottery.exe", "nlts-win-x64"),
    @("lottery-in-bili-linux", "lottery", "nlts-linux-x64"),
    @("lottery-in-bili-macos", "lottery", "nlts-macos-x64")
)

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
    }

    Compress-Archive -Path $DIR -DestinationPath "$($DIR)-$(Get-Date -Format "yyyyMMd")" -Force
}

Remove-Item -Path $ENV_FILE
Remove-Item -Path $CONFIG_FILE
Remove-Item -Path $README