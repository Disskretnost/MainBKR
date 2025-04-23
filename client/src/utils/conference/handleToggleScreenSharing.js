export default async function handleToggleScreenSharing(managerRef, screenSharing, setScreenSharing) {
    const manager = managerRef.current;
    if (!manager) return;
  
    if (screenSharing) {
      await manager.switchToCamera();
      setScreenSharing(false);
    } else {
      await manager.switchToScreen();
      setScreenSharing(true);
    }
  }
  