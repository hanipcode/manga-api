const MangaPlugin = require('./dist/main.js');
const fs = require('fs');

//Building database
MangaPlugin.buildMangaDB()
  .then(data => 
    fs.writeFile('output.json', data, (err) => {
      if (err) {
        console.log(err);
        throw err;
      }
      console.log('The File has been saved succesfully');
    })
  );

module.exports = MangaPlugin;

