const expect = require("expect");
const request = require("supertest");

const {app} = require("../server"); //Server should always be loaded before any other project file
const {User} = require("../models/user");
const testUtils = require("./testUtils");
const constants = require("../utils/constants");

var email = constants.TestEmail;
var password = constants.TestPassword;
var tokenCount = 0;

describe('POST /signup', async () => {
    // Following two test cases have to be executed one after another without any changes to User collection.
    it('should signup a user', (done) => {
        User.deleteMany({}, () => {
            request(app)
                .post('/signup')
                .send({email, password})
                .expect(200)
                .expect(testUtils.verifyAuthResponse)
                .end(async (err, res) => {
                    if (err) { return done(err); }
                    try {
                        await testUtils.verifyUserInDB(res, tokenCount);
                        ++tokenCount; 
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        });
    });

    it('should not signup with duplicate email', (done) => {
        request(app)
            .post('/signup')
            .send({email, password})
            .expect(400)
            .end(done);
    });
});

describe("POST /login", async () => {
    it("should login with valid credentials", (done) => {
        request(app)
            .post('/login')
            .send({email, password})
            .expect(200)
            .expect(testUtils.verifyAuthResponse)
            .end(async (err) => {
                if (err) { return done(err); }
                try {
                    await testUtils.verifyUserInDB(res, tokenCount);
                    ++tokenCount; 
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });
});