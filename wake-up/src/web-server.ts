const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const serveIndex = require('serve-index');

export class WebServer {
  private app;
  private port = 6969;
  private mem;
  private aP;

  constructor(audioPlayer, memory) {
    this.mem = memory;
    this.aP = audioPlayer
    this.app = express();
    this.setup();
  }

  private setup(): void {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use('/audio', serveIndex('./audio/'));
    this.app.use('/audio', express.static('./audio'));
    this.app.use(fileUpload({
      createParentPath: true
    }));

    this.app.post('/upload', async (req, res) => {
      try {
        if (!req.files) {
          res.send({
            status: false,
            message: 'No file uploaded'
          });
        } else {
          let file = req.files.file;

          file.mv('./audio/' + file.name);

          res.send({
            status: true,
            message: 'File is uploaded',
            data: {
              name: file.name,
              mimetype: file.mimetype,
              size: file.size
            }
          });
        }
      } catch (err) {
        res.status(500).send(err);
      }
    })

    this.app.post('/pick', async (req, res) => {
      let pick = req.body.filePick

      this.mem.saveFile(pick);
      this.aP.setAudioFile(pick);

      res.send('ok')

    })

    this.app.get('/', async (req, res) => {
      let filesToPick = ['nature.wav', 'waves.wav']
      res.send(`
        <html>
          <body>
            <form ref='uploadForm' 
              id='uploadForm' 
              action='/upload' 
              method='post' 
              encType="multipart/form-data">
                <input type="file" name="file" />
                <input type='submit' value='Upload!' />
            </form>

            <form ref='pickForm'
              id='pickForm'
              action='/pick'
              method='post'
              encType="multipart/form-data">
                <select name='filePick' id='filePick'>
                  ${filesToPick.map(f => `<option value='${f}'>${f}</option>`)}
                </select>
                <input type='submit' value='Pick!' />
            </form>
          </body>
        </html>
      `)
    })
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server started on port ${this.port}`);
    });
  }
}
