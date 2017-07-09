import { expect } from 'chai';

const request = require('request');

describe("Scraping the web", () => {
  describe("Getting Manga List in Text", () => {
    let HTMLContent;
    beforeEach((done) => {
      request.get("http://google.com", (error, responseObject, responseBody) => {
        HTMLContent = responseBody;
        done();
      })
    });
    it("Should Not be Empty", (done) => {
      expect(HTMLContent).to.be.not.empty;
      done();
    });
  });

  describe("Manga Object" () => {
    it("should not be Empty");
    it("should be the type of object");
    it("should have a title");
    it("should have a link");
  });
})
