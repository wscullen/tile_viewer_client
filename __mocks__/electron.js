export const ipcRenderer = {
  on: jest.fn()
}

// mocks/electronMock.js
export const remote = {
  dialog: {

    // replace the showOpenDialog function with a spy which returns a value
    showOpenDialog: jest.fn().mockReturnValue('path/to/output folder')
  },
  app: {
    getPath: jest.fn().mockReturnValue('path/to/output folder')
  }
}

export const app = {
  getPath: jest.fn().mockReturnValue('path/to/output folder')
}
