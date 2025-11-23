Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install 2>&1 | Write-Host
Write-Host "Done!" -ForegroundColor Green

