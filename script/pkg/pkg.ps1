$CONFIG_FILE = "my_config.json"
$ENV_FILE = "env.js"

$WIN_BIN = "lottery-in-bili-win.exe"
$LINUX_BIN = "lottery-in-bili-linux"
$MACOS_BIN = "lottery-in-bili-macos"

$WIN_X64 = "nlts-win-x64"
$LINUX_X64 = "nlts-linux-x64"
$MACOS_X64 = "nlts-macos-x64"

$MAP = @{ $WIN_X64 = $WIN_BIN; $LINUX_X64 = $LINUX_BIN; $MACOS_X64 = $MACOS_BIN}

Copy-Item -Path "env.example.js" -Destination .\dist -Force

cd .\dist

Move-Item -Path "env.example.js" -Destination $ENV_FILE -Force

foreach($X64 in $MAP.Keys) {
    $BIN = $MAP[$X64]
    if (!(Test-Path $X64 -PathType Container)) { 
        New-Item -ItemType Directory -Force -Path $X64
    }
    Move-Item -Path $BIN -Destination $X64 -Force
    Copy-Item -Path $ENV_FILE -Destination $X64 -Force
    cd $X64
    echo "{`n`t`"config_1`":{}`n}" > $CONFIG_FILE
    cd ..
    Compress-Archive -Path $X64 -DestinationPath $X64 -Force
}

Remove-Item -Path $ENV_FILE