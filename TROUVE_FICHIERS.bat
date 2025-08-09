@echo off
echo ========================================
echo   SCRIPT POUR TROUVER NOS FICHIERS
echo ========================================
echo.

echo 1. Recherche du dossier my-project...
echo.

if exist "C:\home\z\my-project" (
    echo    TROUVÉ : C:\home\z\my-project
    echo.
    echo 2. Copie des fichiers vers votre Bureau...
    echo.
    
    if not exist "%USERPROFILE%\Desktop\Matrix-AI-System" mkdir "%USERPROFILE%\Desktop\Matrix-AI-System"
    
    xcopy "C:\home\z\my-project\*" "%USERPROFILE%\Desktop\Matrix-AI-System\" /E /H /C /I /Y
    
    echo    ✅ Fichiers copiés avec succès !
    echo.
    echo    Dossier créé sur votre Bureau : Matrix-AI-System
    echo.
    
) else if exist "my-project" (
    echo    TROUVÉ : .\my-project (dossier courant)
    echo.
    echo 2. Copie des fichiers vers votre Bureau...
    echo.
    
    if not exist "%USERPROFILE%\Desktop\Matrix-AI-System" mkdir "%USERPROFILE%\Desktop\Matrix-AI-System"
    
    xcopy "my-project\*" "%USERPROFILE%\Desktop\Matrix-AI-System\" /E /H /C /I /Y
    
    echo    ✅ Fichiers copiés avec succès !
    echo.
    echo    Dossier créé sur votre Bureau : Matrix-AI-System
    echo.
    
) else (
    echo    ❌ Dossier my-project non trouvé
    echo.
    echo 3. Recherche sur tout le disque C:...
    echo.
    
    dir /s /b C:\my-project > "%USERPROFILE%\Desktop\recherche_resultat.txt"
    
    if exist "%USERPROFILE%\Desktop\recherche_resultat.txt" (
        echo    🔍 Résultats de recherche sauvegardés dans :
        echo       %USERPROFILE%\Desktop\recherche_resultat.txt
        echo.
        echo    Ouvrez ce fichier pour voir où se trouvent les fichiers
    )
)

echo.
echo ========================================
echo  FICHIER GUIDE CRÉÉ : NOTRE_PROJET_COMPLETE.md
echo ========================================
echo.

if exist "NOTRE_PROJET_COMPLETE.md" (
    copy "NOTRE_PROJET_COMPLETE.md" "%USERPROFILE%\Desktop\"
    echo    ✅ Guide copié sur votre Bureau !
) else (
    echo    ❌ Guide non trouvé dans le dossier courant
)

echo.
echo ========================================
echo            OPÉRATIONS TERMINÉES
echo ========================================
echo.
echo Vérifiez votre Bureau pour les fichiers copiés.
echo.
pause