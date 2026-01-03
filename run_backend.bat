@echo off
echo ========================================
echo   STARTING BACKEND API SERVER
echo ========================================
echo.
echo Checking MySQL connection...
echo.

cd back_end

echo Starting ASP.NET Core backend...
echo Backend will run at: http://localhost:5200
echo.
echo Press Ctrl+C to stop the server
echo.

dotnet run

pause

