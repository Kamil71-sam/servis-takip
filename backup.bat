@echo off
:loop
echo [%date% %time%] Yedekleme baslatiliyor...
git add .
git commit -m "Otomatik Yedek: %date% %time%"
git push origin main
timeout /t 1800 /nobreak
goto loop