# Define the URL for the Python installer
$pythonInstallerUrl = "https://www.python.org/ftp/python/3.11.5/python-3.11.5-amd64.exe"

# Define the path to save the installer
$installerPath = "$env:TEMP\python-3.11.5-amd64.exe"

# Download the Python installer
Invoke-WebRequest -Uri $pythonInstallerUrl -OutFile $installerPath

# Define the installation arguments
$installArgs = "/quiet InstallAllUsers=1 PrependPath=1 Include_test=0"

# Run the installer
Start-Process -FilePath $installerPath -ArgumentList $installArgs -Wait

# Remove the installer file after installation
Remove-Item -Path $installerPath -Force

# Verify the installation
python --version
