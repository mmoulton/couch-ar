var domain;

beforeEach(function() {
    domain = require('couch-ar');

});

describe('init() method with host and port options', function() {
    it('creates db', function() {
        domain = require('couch-ar');
        domain.init({
                    dbName: 'couch-ar-host-port-test',
                    root: __dirname + '/../testDomain',
                    host: 'localhost',
                    port: 5984
                },
                function() {
                    // delay so that everything can be setup
                    setTimeout(asyncSpecDone, 500);
                }
        );
        asyncSpecWait();
    });
});


/*describe('init() method without host and port options', function() {
    it('creates db', function() {
        domain.init({
                    dbName: 'couch-ar-test',
                    root: __dirname + '/../testDomain'
                }, function() {
            // delay so that everything can be setup
            setTimeout(asyncSpecDone, 500);
        });
        asyncSpecWait();
    });

    it('adds the domain constructors to couch-ar', function() {
        expect(require('couch-ar').TestUser).toBeDefined();
    });
});*/


describe('TestUser', function() {

    describe('save() method', function() {
        var dateCreated,lastUpdated;
        var user;
        var rev;
        it('should set id and rev before callback', function() {
            user = domain.TestUser.create({username:'tester1', firstName:'Test', lastName:'Tester',erroneous:'xxxxxxxx'});
            user.save(function(err, res) {
                rev = user.rev;
                expect(res.ok).toBeTruthy();
                expect(user.id).toBeDefined();
                expect(user.rev).toBeDefined();
                expect(user.erroneous).toBeDefined();
                expect(user.dateCreated).toBeDefined();
                dateCreated = user.dateCreated;
                expect(user.lastUpdated).toBeDefined();
                lastUpdated = user.lastUpdated;
                asyncSpecDone();
            });
            asyncSpecWait();
        });

        it('should allow us to create more than one', function() {
            var u = domain.TestUser.create({username:'tester2', firstName:'Test2', lastName:'Tester2'});
            u.save(function(err, res) {
                expect(res.ok).toBeTruthy();
                domain.TestUser.list(function(users) {
                    expect(users.length).toEqual(2);
                    asyncSpecDone();
                })
                asyncSpecWait();
            });
        })


        it('should allow us to update the object after initial save', function() {
            user.username = 'tester';
            user.save(function(err, res) {
                expect(res.ok).toBeTruthy();
                expect(user.id).toBeDefined();
                expect(user.rev).toBeDefined();
                expect(rev).not.toEqual(user.rev);
                expect(user.dateCreated.getTime()).toEqual(dateCreated.getTime());
                expect(user.lastUpdated).not.toEqual(lastUpdated);
                asyncSpecDone();
            });
            asyncSpecWait();
        })

        it('should call beforeSave method before writing to the db', function() {
            expect(user.fullName).toEqual('Test Tester');
        });

        it('should not save properties not on propery list', function() {
            domain.TestUser.findByUsername('tester', function(u) {
                expect(u.erroneous).not.toBeDefined();
                asyncSpecDone();
            })
            asyncSpecWait();
        });
    });

    describe('findByUsername() method', function() {
        it('should find user when using findByUsername', function() {
            domain.TestUser.findByUsername('tester', function(user) {
                expect(user.username).toEqual('tester');
                expect(user.id).toBeDefined();
                expect(user.rev).toBeDefined();
                expect(user.dateCreated).toBeDefined();
                expect(user.lastUpdated).toBeDefined();
                asyncSpecDone();
            });
            asyncSpecWait();
        });
    });

    describe('queryOnUsername() method', function() {
        it('should query based on username when using queryOnUsername', function() {
            domain.TestUser.findByUsername('tester', function(user) {
                domain.TestUser.queryOnUsername({ key: JSON.stringify(user.username) }, function(queryUser) {
                    expect(user.id).toEqual(queryUser[0].id);
                    asyncSpecDone();
                });
            });
            asyncSpecWait();
        });
    });

    describe('findById() method', function() {
        it('should find a user using findById', function() {
            domain.TestUser.findByUsername('tester', function(user) {
                domain.TestUser.findById(user.id, function(user) {
                    expect(user.username).toEqual('tester');
                    expect(user.id).toBeDefined();
                    expect(user.rev).toBeDefined();
                    expect(user.dateCreated).toBeDefined();
                    expect(user.lastUpdated).toBeDefined();
                    asyncSpecDone();
                });
            });
            asyncSpecWait();
        });
    });


    describe('list() method', function() {
        it('should show records in db', function() {
            domain.TestUser.list(function(users) {
                expect(users.length).toBeGreaterThan(0);
                asyncSpecDone();
            });
        });
        asyncSpecWait();
    });


    describe('findAllByDateCreated()', function() {
        it('should return docs', function() {
            domain.TestUser.findAllByDateCreated(['a','Z'], function(users) {
                expect(users.length).toEqual(2);
                asyncSpecDone();
            })
            asyncSpecWait();
        })
    })


    describe('custom views', function() {
        it('should add the finder', function() {
            expect(domain.TestUser.findByFirstOrLastName).toBeDefined();
            expect(domain.TestUser.findAllByFirstOrLastName).toBeDefined();
        });

        it('findAll using custom view should return results', function() {
            domain.TestUser.findAllByFirstOrLastName('Tester', function(users) {
                expect(users.length).toBeGreaterThan(0);
                asyncSpecDone();
            })
            asyncSpecWait();
        });

        it('find using custom view should return results', function() {
            domain.TestUser.findByFirstOrLastName('Test', function(user) {
                expect(user).toBeDefined();
                expect(user.lastName).toEqual('Tester');
                asyncSpecDone();
            });
            asyncSpecWait();

        });
    })


    describe('remove() method', function() {
        it('should remove a record from couchDb', function() {
            domain.TestUser.findAllByUsername(['tester','testerZ'], function(users) {
                (function removeAll(u) {
                    u.remove(function(err, res) {
                        expect(res.ok).toBeTruthy();
                        users.length ? removeAll(users.shift()) : asyncSpecDone();
                    });
                }(users.shift()))
            });
        });
        asyncSpecWait();
    });


});