@echo off
rem Run this on your PC to fill yahoo_quotes.json right now (no need to wait for GitHub), then upload the file(s) it writes.
cd /d "%~dp0"
python tools\pull_yahoo.py
pause
