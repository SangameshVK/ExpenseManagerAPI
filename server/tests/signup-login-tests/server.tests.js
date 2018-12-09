const expect = require("expect");
const request = require("supertest");
const httpStatusCodes = require('http-status-codes');

const {app} = require("../../server"); //Server should always be loaded before any other project file
const {User} = require("../../models/user");
const testUtils = require("./testUtils");
const constants = require("../../utils/constants");

const email = constants.TestEmail;
const password = constants.TestPassword;
const validSignupFailure = `Failing because could not signup user ${email} in valid signup test case`;
var tokenCount = 0;

describe('POST /signup', () => {
    // Following two test cases have to be executed one after another without any changes to User collection.
    // TO FIND OUT: Is there a guarantee that their callbacks will execute in order
                 // => YES, callback of next test case is called only after done() is called from previous test case
    it('should signup a user', (done) => {
        User.deleteMany({}, () => {
            request(app)
                .post('/signup')
                .send({email, password})
                .expect(httpStatusCodes.OK)
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
        if (tokenCount == 0) {
            return done(validSignupFailure);
        }
        request(app)
            .post('/signup')
            .send({email, password})
            .expect(httpStatusCodes.BAD_REQUEST)
            .end(done);
    });
});

describe("POST /login", () => {
    it("should login with valid credentials", (done) => {
        if (tokenCount == 0) {
            return done(validSignupFailure);
        }
        request(app)
            .post('/login')
            .send({email, password})
            .expect(httpStatusCodes.OK)
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

    it("reject login with non existent email", (done) => {
        if (tokenCount == 0) {
            return done(validSignupFailure);
        }
        request(app)
            .post('/login')
            .send({email: 'wrongEmail' + email, password})
            .expect(httpStatusCodes.BAD_REQUEST)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeFalsy();
                expect(res.body.error).toBe(constants.UserDoesNotExistMsg);
            })
            .end(done);
    });

    it("reject login with wrong password", (done) => {
        if (tokenCount == 0) {
            return done(validSignupFailure);
        }
        request(app)
            .post('/login')
            .send({email, password: password + 'wrongPass'})
            .expect(httpStatusCodes.UNAUTHORIZED)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeFalsy();
                expect(res.body.error).toBe(constants.PasswordIncorrectMsg);
            })
            .end(async (err) => {
                if (err) { return done(err) }
                try {
                    var user = await User.findOne({email});
                    expect(user.tokens.length).toBe(tokenCount);
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });
});