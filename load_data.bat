@echo off
echo ================================================
echo  Chargement des donnees dans Fuseki
echo ================================================

set FUSEKI_URL=http://localhost:3030
set DATASET=lod
set TTL_DIR=data\ttl

echo.
echo Verification que Fuseki est demarre...
curl -s %FUSEKI_URL%/$/%ping% >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR : Fuseki n'est pas accessible
    echo Lance d'abord : docker-compose up -d
    pause
    exit /b 1
)
echo OK Fuseki est demarre

echo.
echo Chargement des fichiers TTL...

curl -X POST %FUSEKI_URL%/%DATASET%/data ^
     --data-binary @%TTL_DIR%\ontology.ttl ^
     -H "Content-Type: text/turtle" ^
     -u admin:admin123
echo  ontology.ttl charge

curl -X POST %FUSEKI_URL%/%DATASET%/data ^
     --data-binary @%TTL_DIR%\programs.ttl ^
     -H "Content-Type: text/turtle" ^
     -u admin:admin123
echo  programs.ttl charge

curl -X POST %FUSEKI_URL%/%DATASET%/data ^
     --data-binary @%TTL_DIR%\skills.ttl ^
     -H "Content-Type: text/turtle" ^
     -u admin:admin123
echo  skills.ttl charge

curl -X POST %FUSEKI_URL%/%DATASET%/data ^
     --data-binary @%TTL_DIR%\companies.ttl ^
     -H "Content-Type: text/turtle" ^
     -u admin:admin123
echo  companies.ttl charge

curl -X POST %FUSEKI_URL%/%DATASET%/data ^
     --data-binary @%TTL_DIR%\students.ttl ^
     -H "Content-Type: text/turtle" ^
     -u admin:admin123
echo  students.ttl charge

curl -X POST %FUSEKI_URL%/%DATASET%/data ^
     --data-binary @%TTL_DIR%\offers.ttl ^
     -H "Content-Type: text/turtle" ^
     -u admin:admin123
echo  offers.ttl charge

echo.
echo ================================================
echo  Termine ! Ouvre : http://localhost:3030
echo ================================================
pause