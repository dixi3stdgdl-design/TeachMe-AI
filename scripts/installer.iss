; Inno Setup Script para Tooltip AI (Microsoft Store Win32 Certified)
#define MyAppName "Tooltip AI"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Tooltip AI"
#define MyAppURL "https://github.com/dixi3stdgdl-design/TeachMe-AI"
#define MyAppExeName "TooltipAI.exe"

[Setup]
AppId={{5728888F-92BE-4A80-81BB-5F23A546FE29}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}/issues
AppUpdatesURL={#MyAppURL}/releases
DefaultDirName={localappdata}\Programs\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=d:\TeachMe AI\MicrosoftStore_Submission\Package
OutputBaseFilename=TooltipAI-Setup
SetupIconFile=d:\TeachMe AI\app.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
CloseApplications=yes
RestartApplications=no

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "d:\TeachMe AI\MicrosoftStore_Submission\Package\TooltipAI.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "d:\TeachMe AI\app.ico"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\app.ico"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\app.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
