const expect = require('expect');
const request = require('supertest');
const httpStatusCodes = require('http-status-codes');

const {app} = require('../../server'); //Server should always be loaded before any other project file
const {DefaultCategory} = require('../../utils/constants');
const {User} = require('../../models/user');
const {Expense} = require('../../models/expense');
const {expenses, populateExpenses, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateExpenses);

describe('POST /expense', () => {
    var category = 'Dinner';
    var amount = 100;
    var description = 'Daal Kichdi';
    var dateTime = new Date().getTime();

    describe('should add expense', () => {
        it('with all fields', (done) => {
            request(app)
                .post('/expense')
                .set('x-auth', users[0].tokens[0].token)
                .send({category, amount, description, dateTime})
                .expect(httpStatusCodes.OK)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    var creator = users[0]._id.toHexString();
                    expect(res.body).toMatchObject({category, amount, creator, description, dateTime});
                })
                .end(async (err, res) => {
                    if(err) { return done(err); }
                    try {
                        var expense = await Expense.findById(res.body._id);
                        expect(expense).toMatchObject({category, amount, creator: users[0]._id, description, dateTime});
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        });

        it('without category, using default category', (done) => {
            request(app)
                .post('/expense')
                .set('x-auth', users[1].tokens[0].token)
                .send({amount, description, dateTime})
                .expect(httpStatusCodes.OK)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    var creator = users[1]._id.toHexString();
                    expect(res.body).toMatchObject({category: DefaultCategory, amount, creator, description, dateTime});
                })
                .end(async (err, res) => {
                    if(err) { return done(err); }
                    try {
                        var expense = await Expense.findById(res.body._id);
                        expect(expense).toMatchObject({category: DefaultCategory, amount, creator: users[1]._id, description, dateTime});
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        })

        it('without description', (done) => {
            request(app)
                .post('/expense')
                .set('x-auth', users[0].tokens[0].token)
                .send({category, amount, dateTime})
                .expect(httpStatusCodes.OK)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    var creator = users[0]._id.toHexString();
                    expect(res.body).toMatchObject({category, amount, creator, dateTime});
                })
                .end(async (err, res) => {
                    if (err) { return done(err) }
                    try {
                        var expense = await Expense.findById(res.body._id);
                        expect(expense).toMatchObject({category, amount, dateTime, creator: users[0]._id});
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        });

        it('without dateTime, defaulting to dateTime of object creation', (done) => {
            request(app)
                .post('/expense')
                .set('x-auth', users[1].tokens[0].token)
                .send({category, amount, description})
                .expect(httpStatusCodes.OK)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.dateTime).toBeTruthy();
                    var creator = users[1]._id.toHexString();
                    expect(res.body).toMatchObject({category, amount, creator, description});
                })
                .end(async (err, res) => {
                    if(err) { return done(err); }
                    try {
                        var expense = await Expense.findById(res.body._id);
                        expect(expense).toMatchObject({category, amount, description, dateTime: res.body.dateTime, creator: users[1]._id});
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        });
    });

    it('should pick creator from token and not from request body', (done) => {
        var creator = users[1]._id;
        request(app)
            .post('/expense')
            .set('x-auth', users[0].tokens[0].token)
            .send({category, creator, amount, description, dateTime})
            .expect(httpStatusCodes.OK)
            .expect((res) => {
                expect(res.body._id).toBeTruthy();
                // Should be user[0]'s Id even if creator passed was user[1]
                expect(res.body.creator).toBe(users[0]._id.toHexString());
            })
            .end(async (err, res) => {
                if(err) { return done(err); }
                try {
                    var expense = await Expense.findById(res.body._id);
                    expect(expense).toMatchObject({category, amount, creator: users[0]._id, description, dateTime});
                    done();
                } catch (e) {
                    done(e);
                }
            });
    })

    describe('should not add expense', () => {
        it('without x-auth token', (done) => {
            request(app)
            .post('/expense')
            .send({category, amount, description, dateTime})
            .expect(httpStatusCodes.UNAUTHORIZED)
            .end(done); 
        })

        it('without amount', (done) => {
            request(app)
                .post('/expense')
                .set('x-auth', users[0].tokens[0].token)
                .send({category, description})
                .expect(httpStatusCodes.BAD_REQUEST)
                .end(done);
        });

        //TODO: Test cases with invalid amount, invalid user
    });
});