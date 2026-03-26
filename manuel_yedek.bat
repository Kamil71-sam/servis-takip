@echo off
set /p mesaj="Yedekleme notunuzu girin (Ornegin: SQL Tablolari Bitti): "
echo [%date% %time%] Manuel yedekleme baslatiliyor...

:: 1. Bilgisayarında ayrı bir klasöre kopyala (Yerel Yedek)
if not exist "..\servis-takip-manuel-yedekler" mkdir "..\servis-takip-manuel-yedekler"
xcopy /s /y /i /e "." "..\servis-takip-manuel-yedekler\yedek_%date%_%time:~0,2%_%time:~3,2%"

:: 2. GitHub'a gönder (Bulut Yedek)
git add .
git commit -m "MANUEL YEDEK: %mesaj%"
git push origin main

echo.
echo Islem tamam! Yedek hem bilgisayarina hem GitHub'a kaydedildi.
pause