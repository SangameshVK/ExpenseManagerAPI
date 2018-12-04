const expect = require("expect");
const request = require("supertest");

const {app} = require("../server"); //Server should always be loaded before any other project file
const {User} = require("../models/user")

describe('POST /signup', async () => {
    // Following two test cases have to be executed one after another without any changes to User collection.
    var email = 'abcd@gmail.com';
    var password = 'test1234';
    it('should signup a user', (done) => {
        User.deleteMany({}, () => {
            request(app)
                .post('/signup')
                .send({email, password})
                .expect(200)
                .expect((res) => {
                    expect(res.headers['x-auth']).toBeTruthy();
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.email).toBe(email);
                })
                .end(async (err) => {
                    if (err) {
                        done(err);
                    }
                    try {
                        var user = await User.findOne({email});
                        expect(user).toBeTruthy();
                        expect(user.password).not.toBe(password);
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