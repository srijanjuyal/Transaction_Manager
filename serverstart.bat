@echo off
REM Step 1: Open cmd and navigate to C drive
cd /d C:\

REM Step 2: Go to the MongoDB bin directory
cd "C:\Program Files\MongoDB\Server\7.0\bin"

REM Step 3: Execute the mongod command in a new cmd window in the correct directory
start cmd /k "mongod --dbpath E:\college\TEIT\hci_convertion\bank_server"

REM Step 4: Ask the user to proceed
set /p proceed=Do you want to proceed to open mongosh? (y/n): 
if /i "%proceed%"=="n" (
    echo Exiting...
    exit /b
)

REM Step 5: Open the specified file with mongosh
start "" "C:\Users\srija\Desktop\mongosh-2.2.12-win32-x64\bin\mongosh.exe"

REM End of script