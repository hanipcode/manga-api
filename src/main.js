const request = require('request-promise');
const cheerio = require('cheerio');

function buildMangaDB() {
  return getMangaList()
    .then((mangaList) => {
      const mangaDB = [];
      const mangaPromises = mangaList.map((mangaObject) => getMangaInfo(mangaObject.identifier));
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
    });
}

function getMangaInfo(mangaIdentifier) {
  return request(`http://komikid.com/manga/${mangaIdentifier}`)
    .then((body) => {
      const $ = cheerio.load(body);
      const mangaCover = $('.img-responsive').attr('src');
      const mangaTitle = $('.img-responsive').attr('alt');
      const mangaTotalChapter = $('.chapters h5 a').length;
      const chapterElements = $('.chapters h5 a');
      const availableChapters = getAvailableChapter(chapterElements);
      const mangaInfo = {
        mangaTitle,
        mangaCover,
        mangaTotalChapter,
        availableChapters,
      }
      return mangaInfo;
    });
}

function getAvailableChapter(chapterElements) {
  const availableChapters = [];
  const $ = cheerio;
  chapterElements.each((i, element) => {
    const chapterNumber = $(element).siblings('em').text();
    const chapterLink = $(element).attr('href');
    const chapterObject = {
      chapterNumber,
      chapterLink,
    };
    availableChapters.push(chapterObject);
  });
  return availableChapters;
}

function getChapterImages(chapterLink) {
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
      console.log(chapterImages);
    });
}

