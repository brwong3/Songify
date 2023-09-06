const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const {youtube} = require("scrape-youtube")
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs")
const ytdl = require("ytdl-core")
const ffmpeg = require("fluent-ffmpeg")
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const axios = require('axios');
const path = require('path');


const dbPath = path.resolve(__dirname, 'AppData.db')


ffmpeg.setFfmpegPath(ffmpegPath);


const app = express();
app.use(cors());

let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if(err) {
    console.error("Error Opening Database:" + err.message)
  }
  else {
   db.run('CREATE TABLE IF NOT EXISTS Playlists(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT(255) NOT NULL, dateCreated TEXT(255) NOT NULL, numSongs INTEGER NOT NULL)');
  }
})

app.post("/CreateUser", bodyParser.json(), (req,res) => {
  console.log(req.body.Email)
  console.log(req.body.Password)

})

app.get("/Search/:searchTerm", (req,res) => {
  youtube.search(req.params.searchTerm)
  .then((results) => {
    res.send(results.videos);
  });
})

app.post("/NewPlaylist", bodyParser.json(), (req, res) => {
  //Check Duplicate Names
  if(req.body.Name) {
    db.get("SELECT * FROM Playlists WHERE name = ? LIMIT 1", req.body.Name, function(err, row) {
      if(row){
        res.end("Account Already Exists")
      }
      else {
        let sql = `INSERT INTO Playlists (name, dateCreated, numSongs)
        VALUES(?,?,?)`;

        let today = new Date().toLocaleDateString()

        db.run(sql, [req.body.Name,today,0])
      }
    },
  )
  db.run(`CREATE TABLE "${req.body.Name}"(id TEXT(255) NOT NULL PRIMARY KEY, thumbnail BLOB NOT NULL, name TEXT(255) NOT NULL, artist TEXT(255) NOT NULL, length TEXT(255), location TEXT(255) NOT NULL, downloaded BOOLEAN NOT NULL)`)
  res.end();
  }
})

app.get("/Playlists", (req,res) => {
  db.all("SELECT name from Playlists", (err, row) => {
    res.send(row)
  })
})

//Returns true/false given a name 
app.post("/Playlists/Availability", (req,res) => {

})

app.get("/PlaylistData", (req,res) => {
  db.get(`SELECT * FROM Playlists WHERE name = "${req.query.name}"`, (error, row) => {
    res.send({
      "numSongs" : row.numSongs,
      "dateCreated": row.dateCreated
    })
  });
})

app.post("/UpdatePlaylist", bodyParser.json(), (req,res) => {
  const playlists = req.body.Playlists;
  const Song = req.body.Song;

  for(let i = 0; i < playlists.length; i++) {
    //db.run(`UPDATE Playlists SET numSongs = numSongs + 1 WHERE name = "${playlists[i]}"`)
    db.run(`INSERT OR IGNORE INTO "${playlists[i]}" (id,thumbnail, name, artist, length, location, downloaded) VALUES(?,?,?,?,?,?,?)`, [Song.id, Song.thumbnail, Song.title, Song.artist, Song.length, `https://youtu.be/${Song.id}`, false]);
    db.get(`SELECT COUNT(*) as count FROM "${playlists[i]}"`, (error, row) => {
      totalSongs = row.count;
      db.run(`UPDATE Playlists SET numSongs = ${totalSongs} WHERE name = "${playlists[i]}"`)
    })
  }
})


app.get("/PlaylistSongs", bodyParser.json(), (req,res) => {
  //console.log(req.query.Playlist)
  db.all(`SELECT * FROM ${req.query.Playlist}`, (err, row) => {
    res.send(row);
  })
})

app.post("/Download", bodyParser.json(), (req, res) => {
  db.all(`SELECT * FROM "${req.body.Playlist}" WHERE downloaded IS 0`, async(err, row) => {

    for(let i = 0; i < row.length; i++) {
      //Download Videos
      let stream = ytdl(`https://youtu.be/${row[i].id}`, {filter: 'audioonly', quality: 'highestaudio'})

      const ffmpegCommand = ffmpeg(stream)
        .audioBitrate(128)
        .toFormat('mp3')
        .save(`../public/Songs/${row[i].id}.mp3`)

      ffmpegCommand.run();

      let url = row[i].thumbnail;

      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(`../public/Thumbnails/${row[i].id}.png`);

      response.data.pipe(writer);

      //db.run(`UPDATE "${req.body.Playlist}" SET location = "Songs/${row[i].id}.mp3", thumbnail="Thumbnails/${row[i].id}.png" WHERE id = "${row[i].id}"`)
      db.run(`UPDATE "${req.body.Playlist}" SET location = "Songs/${row[i].id}.mp3", thumbnail="Thumbnails/${row[i].id}.png", downloaded=true WHERE id = "${row[i].id}"`)
    }
    res.end();
  })


});

app.get("/PercentageDownloaded", bodyParser.json(), async(req,res) => {
  let songsDownloaded = 0;
  let totalSongs = 0;
  db.get(`SELECT COUNT(*) as count FROM "${req.query.Playlist}" WHERE downloaded IS 1`, (error, row) => {
    songsDownloaded = row.count;
    db.get(`SELECT COUNT(*) as count FROM "${req.query.Playlist}"`, (error, row) => {
      totalSongs = row.count;
      if(songsDownloaded === 0 && totalSongs === 0) {
        res.send({
          "Percentage": 0
        })
      }
      else {
        res.send({
          "Percentage": Math.round(100 * songsDownloaded/totalSongs)
        })
      }
    })
  })
})

app.post("/DeletePlaylist", bodyParser.json(), (req, res) => {
  db.run(`DROP TABLE "${req.body.Name}"`)
  db.run(`DELETE FROM Playlists WHERE name = "${req.body.Name}"`)
  //res.send("Playlist Deleted!")
})

app.post("/DeleteSong", bodyParser.json(), (req,res) => {
  const Playlist = req.body.Playlist
  const id = req.body.id
  db.run(`DELETE FROM "${Playlist}" WHERE id = "${id}"`, (err, row) => {
    db.run(`UPDATE Playlists SET numSongs = numSongs - 1 WHERE name = "${Playlist}"`)
    res.end();
  })

})


app.post("/RenamePlaylist", bodyParser.json(), (req,res) => {
  db.run(`UPDATE Playlists SET name = "${req.body.newName}" WHERE name = "${req.body.oldName}"`)
  db.run(`ALTER TABLE "${req.body.oldName}" RENAME TO "${req.body.newName}"`)
})

app.get("/FilterSongs", bodyParser.json(), (req,res) => {
  db.all(`SELECT * FROM "${req.query.Playlist}" WHERE name like "%${req.query.term}%"`, (err, row) => {
    res.send(row);
  })
})

// Initialize server
app.listen(8800, () => {
  console.log("Running on port 8800.");
});
