const request = require('request-promise');
const cheerio = require('cheerio');

function delayRequest(delay = 2000) {
  return new Promise((resolve, reject) => {
    console.log('delayed');
    setTimeout(() => resolve(), delay);
  })
}

function buildMangaDBSequentially() {
  return getMangaList()
    .then((mangaList) => {
      const mangaDB = [];
      const totalManga = mangaList.length;
      return mangaList.reduce((sequence, mangaObject) => {
        return sequence
          .then(() => getMangaInfo(mangaObject.identifier))
          .then(() => console.log('done downloading', mangaObject.title));
      }, Promise.resolve());
    });
}

function buildMangaDB() {
  return getMangaList()
    .then((mangaList) => {
      const mangaDB = [];
      const totalManga = mangaList.length;
      const mangaPromises = mangaList.map((mangaObject) => {
        getMangaInfo(mangaObject.identifier)
          .then(() => {
            console.log('done downloading', mangaObject.title);
          });
      });
      return Promise.all(mangaPromises)
    });
}

function getMangaList() {
  return request('http://komikid.com/changeMangaList?type=text')
    .then((body) => {
      const mangaList = [];
      const $ = cheerio.load(body);
      $(".manga-list a").each((i, element) => {
        const mangaTitle = $(element).find('h6').text();
        const mangaUri = $(element).attr('href');
        const mangaIdentifier = mangaUri.split('/manga/')[1];
        const mangaObject = {
          title: mangaTitle,
          uri: mangaUri,
          identifier: mangaIdentifier,
        };
        mangaList.push(mangaObject);
      });
      return mangaList;
    })
    .catch((err) => {
      console.log('something went wrong when try to get manga list', err);
      throw err;
    })
}

function getMangaInfo(mangaIdentifier, retryCount = 0) {
  return request(`http://komikid.com/manga/${mangaIdentifier}`)
    .then((body) => {
      const $ = cheerio.load(body);
      const mangaCover = $('.img-responsive').attr('src');
      const mangaTitle = $('.img-responsive').attr('alt');
      const mangaTotalChapter = $('.chapters h5 a').length;
      const chapterElements = $('.chapters h5 a');
      const chapterPages = getAvailableChapter(chapterElements);
      const mangaInfo = {
        mangaTitle,
        mangaCover,
        mangaTotalChapter,
        chapterPages,
      }
      return mangaInfo;
    })
    .catch((err) => {
      if (retryCount > 0) {
        console.log('Something went wrong in getting MangaInfo', err);
        throw err;
      } else {
        console.log('Something Went Wrong in Getting Manga Info');
        console.log('trying to Retry...');
        const newRetryCount = retryCount + 1 || 2;
        delayRequest(5000)
          .then(() => getMangaInfo(mangaIdentifier, 2))
          .catch((err) => {
            console.log('error while retrying', err);
            throw err;
          });
      }
    })
}


function getAvailableChapter(chapterElements) {
  const availableChapters = [];
  const $ = cheerio;
  chapterElements.each((i, element) => {
    const chapterNumber = $(element).siblings('em').text();
    const chapterLink = $(element).attr('href');
    const chapterPages = getChapterImages(chapterLink);
    const chapterObject = {
      chapterNumber,
      chapterLink,
      chapterPages,
    };
    availableChapters.push(chapterObject);
  });
  return availableChapters;
}

function getChapterImages(chapterLink, retryCount = 0) {
  return request(chapterLink)
    .then((body) => {
      const chapterImages = [];
      const $ = cheerio.load(body);
      const chapterPagesElements = $("#all").children(".img-responsive");
      chapterPagesElements.each((i, element) => {
        const imageTitle = $(element).attr("alt");
        const imageLink = $(element).attr("src");
        const chapterImageObject = {
          imageTitle,
          imageLink,
        };
        chapterImages.push(chapterImageObject);
      })
      return chapterImages;
    })
    .catch((err) => {
      if (retryCount > 0) {
        console.log('Something went wrong in getting MangaInfo', err);
        throw err;
      } else {
        console.log('Something Went Wrong in Getting Manga Info');
        console.log('trying to Retry...');
        const newRetryCount = retryCount + 1 || 2;
        delayRequest(5000)
          .then(() => getChapterImages(chapterLink, 2))
          .catch((err) => {
            console.log('error while retrying', err);
            throw err;
          });
      }
    });
}

buildMangaDBSequentially();
