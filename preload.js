const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('teachMeNative', {
  isNativeApp: true,
  
  // Real Desktop Screenshot Capture
  captureScreen: () => ipcRenderer.invoke('capture-desktop-screen'),
  
  // Send Crop to AI Engine
  analyzeCrop: (cropData) => ipcRenderer.invoke('analyze-desktop-crop', cropData),
  
  // Window Management
  hideOverlay: () => ipcRenderer.send('hide-overlay-window'),
  showOverlay: () => ipcRenderer.send('show-overlay-window'),
  setClickThrough: (enable) => ipcRenderer.send('set-click-through', enable),
  
  // Listeners from Main Process Hotkeys
  onTriggerSnip: (callback) => ipcRenderer.on('trigger-global-snip', (_event, value) => callback(value)),
  onEscapeKey: (callback) => ipcRenderer.on('on-escape-pressed', () => callback())
});
