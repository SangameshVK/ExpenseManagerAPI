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
    var creator = users[0]._id.toHexString();
    var description = 'Daal Kichdi';
    var dateTime = new Date().getTime();

    describe('should add expense', () => {
        it('with all fields', (done) => {
            request(app)
                .post('/expense')
                .set('x-auth', users[0].tokens[0].token)
                .send({category, amount, creator, description, dateTime})
                .expect(httpStatusCodes.OK)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body).toMatchObject({category, amount, creator, description, dateTime});
                })
                .end(async (err, res) => {
                    if(err) { return done(err); }
                    try {
                        var expense = await Expense.findById(res.body._id);
                        expect(expense).toMatchObject({category, amount, description, dateTime});
                        expect(expense.creator.toHexString()).toBe(creator);
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
                .send({amount, creator, description, dateTime})
                .expect(httpStatusCodes.OK)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body).toMatchObject({category: DefaultCategory, amount, creator, description, dateTime});
                })
                .end(async (err, res) => {
                    if(err) { return done(err); }
                    try {
                        var expense = await Expense.findById(res.body._id);
                        expect(expense).toMatchObject({category: DefaultCategory, amount, description, dateTime});
                        expect(expense.creator.toHexString()).toBe(creator);
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
                .send({category, amount, creator, dateTime})
                .expect(httpStatusCodes.OK)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body).toMatchObject({category, amount, creator, dateTime});
                })
                .end(async (err, res) => {
                    if (err) { return done(err) }
                    try {
                        var expense = await Expense.findById(res.body._id);
                        expect(expense).toMatchObject({category, amount, dateTime});
                        expect(expense.creator.toHexString()).toBe(creator);
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
                .send({category, amount, creator, description})
                .expect(httpStatusCodes.OK)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.dateTime).toBeTruthy();
                    expect(res.body).toMatchObject({category, amount, creator, description});
                })
                .end(async (err, res) => {
                    if(err) { return done(err); }
                    try {
                        var expense = await Expense.findById(res.body._id);
                        expect(expense).toMatchObject({category, amount, description, dateTime: res.body.dateTime});
                        expect(expense.creator.toHexString()).toBe(creator);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        })
    });

    describe('should not add expense', () => {
        it('without x-auth token', (done) => {
            request(app)
            .post('/expense')
            .send({category, amount, creator, description, dateTime})
            .expect(httpStatusCodes.UNAUTHORIZED)
            .end(done); 
        })

        it('without amount', (done) => {
            request(app)
                .post('/expense')
                .set('x-auth', users[0].tokens[0].token)
                .send({category, creator, description})
                .expect(httpStatusCodes.BAD_REQUEST)
                .end(done);
        });

        it('without creator', (done) => {
            request(app)
                .post('/expense')
                .set('x-auth', users[1].tokens[0].token)
                .send({category, amount, dateTime, description})
                .expect(httpStatusCodes.BAD_REQUEST)
                .end(done);
        });

        //TODO: Test cases with invalid amount, invalid user
    });
});