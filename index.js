const express = require('express');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();
const port = 8000;

app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let notes = {}; 

if (fs.existsSync('notes.json')) {
  notes = JSON.parse(fs.readFileSync('notes.json', 'utf8'));
}

app.get('/notes', (req, res) => {
  res.json(Object.values(notes));
});

app.post('/upload', upload.none(), (req, res) => {
  const { note_name, note } = req.body;

  if (!note_name || typeof note_name !== 'string' || note_name.trim() === '') {
    return res.status(400).send('Invalid or missing note name.');
  }

  if (notes[note_name]) {
    return res.status(400).send('Note already exists.');
  }

  notes[note_name] = { name: note_name, text: note };
  fs.writeFileSync('notes.json', JSON.stringify(notes));
  res.status(201).send('Note created.');
});

app.get('/notes/:note_name', (req, res) => {
  const note = notes[req.params.note_name];
  if (!note) {
    return res.status(404).send('Note not found.');
  }
  res.send(note.text);
});

app.put('/notes/:note_name', (req, res) => {
  const note = notes[req.params.note_name];
  if (!note) {
    return res.status(404).send('Note not found.');
  }
  note.text = req.body.text;
  fs.writeFileSync('notes.json', JSON.stringify(notes));
  res.send('Note updated.');
});

app.delete('/notes/:note_name', (req, res) => {
  if (!notes[req.params.note_name]) {
    return res.status(404).send('Note not found.');
  }
  delete notes[req.params.note_name];
  fs.writeFileSync('notes.json', JSON.stringify(notes));
  res.send('Note deleted.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


