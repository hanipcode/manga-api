'use strict';

var request = require('request-promise');
var cheerio = require('cheerio');

function buildMangaDB() {
  return getMangaList().then(function (mangaList) {
    var mangaDB = [];
    var mangaPromises = mangaList.map(function (mangaObject) {
      return getMangaInfo(mangaObject.identifier);
    });
    return Promise.all(mangaPromises);
  });
}

function getMangaList() {
  return request('http://komikid.com/changeMangaList?type=text').then(function (body) {
    var mangaList = [];
    var $ = cheerio.load(body);
    $(".manga-list a").each(function (i, element) {
      var mangaTitle = $(element).find('h6').text();
      var mangaUri = $(element).attr('href');
      var mangaIdentifier = mangaUri.split('/manga/')[1];
      var mangaObject = {
        title: mangaTitle,
        uri: mangaUri,
        identifier: mangaIdentifier
      };
      mangaList.push(mangaObject);
    });
    return mangaList;
  });
}

function getMangaInfo(mangaIdentifier) {
  return request('http://komikid.com/manga/' + mangaIdentifier).then(function (body) {
    var $ = cheerio.load(body);
    var mangaCover = $('.img-responsive').attr('src');
    var mangaTitle = $('.img-responsive').attr('alt');
    var mangaTotalChapter = $('.chapters h5 a').length;
    var chapterElements = $('.chapters h5 a');
    var availableChapters = getAvailableChapter(chapterElements);
    var mangaInfo = {
      mangaTitle: mangaTitle,
      mangaCover: mangaCover,
      mangaTotalChapter: mangaTotalChapter,
      availableChapters: availableChapters
    };
    return mangaInfo;
  });
}

function getAvailableChapter(chapterElements) {
  var availableChapters = [];
  var $ = cheerio;
  chapterElements.each(function (i, element) {
    var chapterNumber = $(element).siblings('em').text();
    var chapterLink = $(element).attr('href');
    var chapterObject = {
      chapterNumber: chapterNumber,
      chapterLink: chapterLink
    };
    availableChapters.push(chapterObject);
  });
  return availableChapters;
}

function getChapterImages(chapterLink) {
  return request(chapterLink).then(function (body) {
    var chapterImages = [];
    var $ = cheerio.load(body);
    var chapterPagesElements = $("#all").children(".img-responsive");
    chapterPagesElements.each(function (i, element) {
      var imageTitle = $(element).attr("alt");
      var imageLink = $(element).attr("src");
      var chapterImageObject = {
        imageTitle: imageTitle,
        imageLink: imageLink
      };
      chapterImages.push(chapterImageObject);
    });
    console.log(chapterImages);
  });
}