@echo off
echo === Git Push to adochris/IAcompagnon ===

git add .
git commit -m "Evidence-based therapeutic system with Safety Monitor, EmotionBERT integration, and complete voice/chat modes"
git branch -M main
git remote remove origin
git remote add origin https://github.com/adochris/IAcompagnon.git
git push -u origin main

echo.
echo === Push complete ===
pause

