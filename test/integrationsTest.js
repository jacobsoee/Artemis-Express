const should = require("should");
const app = require("../app");
var assert = require("assert");
const request = require("supertest");

//----------------------------------Base test-----------------------------------------------------//
describe("App", function () {
  it("app should return hello", function () {
    assert.equal(app.sayHello(), "hello");
  });
});

//----------------------------------app.js test---------------------------------------------------//

describe("index", () => {
  it("get('/')", async () => {
    let response = await request(app)
      .get("/")
      .expect(200)
      .expect("Content-Type", /html/);
    response.text.search(/<h1>/).should.greaterThan(0);
  });
});

describe("about", () => {
  it("get('/about')", async () => {
    let response = await request(app)
      .get("/about")
      .expect(200)
      .expect("Content-Type", /html/);
    response.text.search(/<table>/).should.equal(-1);
  });
});
