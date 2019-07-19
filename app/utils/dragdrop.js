const { ipcMain } = require('electron').remote;

ipcMain.on('ondragstart', (event, filePath) => {
  event.sender.startDrag({
    file: filePath,
    icon: 'bird300.png'
  })
})

const dragdrop = {

}

export default dragdrop;