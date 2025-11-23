@echo off
echo ========================================
echo   Helō - Démarrage de tous les services
echo ========================================
echo.

REM Vérifier Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Python n'est pas installé ou pas dans le PATH
    pause
    exit /b 1
)

REM Vérifier Node
node --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Node.js n'est pas installé ou pas dans le PATH
    pause
    exit /b 1
)

echo [1/6] Installation des dépendances backend...
echo.

cd backend\api-gateway
echo Installing API Gateway dependencies...
pip install -r requirements.txt --quiet
cd ..\..

cd backend\ai-engine
echo Installing AI Engine dependencies...
pip install -r requirements.txt --quiet
cd ..\..

cd backend\emotions-service
echo Installing Emotions Service dependencies...
pip install -r requirements.txt --quiet
cd ..\..

cd backend\voice-service
echo Installing Voice Service dependencies...
pip install -r requirements.txt --quiet
cd ..\..

echo.
echo [2/6] Installation des dépendances frontend...
cd frontend
call npm install
cd ..

echo.
echo [3/6] Démarrage API Gateway (port 8000)...
start "API Gateway" cmd /k "cd backend\api-gateway && python -m uvicorn app.main:app --reload --port 8000"
timeout /t 3 /nobreak >nul

echo [4/6] Démarrage AI Engine (port 8001)...
start "AI Engine" cmd /k "cd backend\ai-engine && python -m uvicorn app.main:app --reload --port 8001"
timeout /t 3 /nobreak >nul

echo [5/6] Démarrage Emotions Service (port 8002)...
start "Emotions Service" cmd /k "cd backend\emotions-service && python -m uvicorn app.main:app --reload --port 8002"
timeout /t 3 /nobreak >nul

echo [6/6] Démarrage Voice Service (port 8003)...
start "Voice Service" cmd /k "cd backend\voice-service && python -m uvicorn app.main:app --reload --port 8003"
timeout /t 3 /nobreak >nul

echo.
echo [7/7] Démarrage Frontend (port 5173)...
start "Frontend Vite" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Tous les services sont démarrés !
echo ========================================
echo.
echo Services disponibles :
echo   - API Gateway:       http://localhost:8000
echo   - AI Engine:         http://localhost:8001
echo   - Emotions Service:  http://localhost:8002
echo   - Voice Service:     http://localhost:8003
echo   - Frontend:          http://localhost:5173
echo.
echo Appuyez sur une touche pour ouvrir l'application...
pause >nul
start http://localhost:5173

