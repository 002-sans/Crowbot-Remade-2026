@echo off
echo Verification du dossier node_modules...

if exist node_modules (
    node .
) else (
    call npm i
    if %errorlevel% equ 0 (
        node .
    ) else (
        echo Erreur lors de l'installation des dependances.
        pause
    )
)

pause