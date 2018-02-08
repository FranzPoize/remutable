"use strict";

var _ = _interopRequireWildcard(require("../"));

var _should = _interopRequireDefault(require("should"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var robert = 'Robert Heinlein';
var isaac = 'Isaac Asimov';
var dan = 'Dan Simmons';
var bard = 'William Shakespeare';
var manu = 'Emmanuel Kant';
var _global = global,
    it = _global.it,
    describe = _global.describe;
describe('Remutable', function () {
  describe('just after creation', function () {
    it('should not be dirty', function () {
      return new _.default().dirty.should.not.be.ok;
    });
    it('should have default hash', function () {
      return new _.default().hash.should.be.exactly(-1549353149);
    });
  });
  describe('after setting two values', function () {
    describe('before committing the changes', function () {
      var userList = new _.default().set('1', robert).set('2', isaac);
      it('should be dirty', function () {
        return userList.dirty.should.be.ok;
      });
      it('head should not be modified', function () {
        return (0, _should.default)(userList.head.get('1')).be.exactly(void 0);
      });
      it('working should be modified', function () {
        return (0, _should.default)(userList.working.get('1')).be.exactly(robert);
      });
    });
    describe('after committing the changes', function () {
      var userList = new _.default().set('1', robert).set('2', isaac);
      userList.commit();
      it('head should be modified', function () {
        (0, _should.default)(userList.head.get('1')).be.exactly(robert);
        (0, _should.default)(userList.head.get('2')).be.exactly(isaac);
      });
    });
  });
  describe('after uncommmitted changes', function () {
    var userList = new _.default().set('1', robert).set('2', isaac);
    userList.commit();
    userList.set('3', dan);
    it('working should be modified', function () {
      return (0, _should.default)(userList.working.get('3')).be.exactly(dan);
    });
  });
  describe('after rollback', function () {
    var userList = new _.default().set('1', robert).set('2', isaac);
    userList.commit();
    userList.set('3', dan);
    userList.rollback();
    it('working should be restored', function () {
      return (0, _should.default)(userList.working.get('3')).be.exactly(void 0);
    });
  });
  describe('toJSON()', function () {
    var userList = new _.default().set('1', robert).set('2', isaac);
    userList.commit();
    userList.set('3', dan);
    userList.rollback();
    var json = userList.toJSON();
    it('should output the correct JSON string', function () {
      return json.should.be.exactly('{"h":1232569233,"v":1,"d":{"1":"Robert Heinlein","2":"Isaac Asimov"}}');
    });
  });
  describe('toJSON() into fromJSON()', function () {
    var userList = new _.default().set('1', robert).set('2', isaac);
    userList.commit();
    userList.set('3', dan);
    userList.rollback();
    var json = userList.toJSON();

    var userListCopy = _.default.fromJSON(json);

    it('should be idempotent', function () {
      userListCopy.toJSON().should.be.exactly(json);
      userListCopy.head.size.should.be.exactly(userList.head.size);
    });
  });
});
describe('Patch', function () {
  var userList = new _.default().set('1', robert).set('2', isaac);
  userList.commit();
  userList.set('3', dan);
  userList.rollback();

  var userListCopy = _.default.fromJSON(userList.toJSON());

  userList.set('3', dan);
  var patch = userList.commit();
  var jsonPatch = patch.toJSON();
  describe('toJSON()', function () {
    return it('should output the correct JSON string', function () {
      return (0, _should.default)(jsonPatch).be.exactly(JSON.stringify({
        m: {
          '3': {
            t: 'Dan Simmons'
          }
        },
        f: {
          h: 1232569233,
          v: 1
        },
        t: {
          h: -1034672275,
          v: 2
        }
      }));
    });
  });

  var patchCopy = _.Patch.fromJSON(jsonPatch);

  describe('after transmission in JSON form', function () {
    userListCopy.apply(patchCopy);
    it('should correctly update a local copy', function () {
      (0, _should.default)(userListCopy.head.get('3')).be.exactly(dan);
    });
  });
});
describe('Patch revert, combine, Consumer, Producer', function () {
  var userList = new _.default().set('1', robert).set('2', isaac);
  userList.commit();
  userList.set('3', dan);
  userList.rollback();

  var userListCopy = _.default.fromJSON(userList.toJSON());

  userList.set('3', dan);
  var patch = userList.commit();
  var jsonPatch = patch.toJSON();

  var patchCopy = _.Patch.fromJSON(jsonPatch);

  userListCopy.apply(patchCopy);
  it('should not throw', function () {
    // It's possible to implement an undo stack by reverting patches
    userListCopy.set('4', bard);
    var patch1 = userListCopy.commit();
    userListCopy.set('5', manu);
    var patch2 = userListCopy.commit();
    userListCopy.head.has('5').should.be.exactly(true);
    userListCopy.head.contains(manu).should.be.exactly(true);

    var revert2 = _.Patch.revert(patch2);

    userListCopy.apply(revert2);
    userListCopy.head.has('4').should.be.exactly(true);
    userListCopy.head.has('5').should.be.exactly(false);
    userListCopy.head.contains(bard).should.be.exactly(true);
    userListCopy.head.contains(manu).should.be.exactly(false);

    var revert1 = _.Patch.revert(patch1);

    userListCopy.apply(revert1);
    userListCopy.head.has('4').should.be.exactly(false);
    userListCopy.head.contains(bard).should.be.exactly(false); // Several small patches can be combined into a bigger one

    var userListCopy2 = _.default.fromJSON(userList.toJSON());

    userList.set('4', bard);
    var patchA = userList.commit();
    userList.set('5', manu);
    var patchB = userList.commit();

    var patchC = _.Patch.combine(patchA, patchB);

    patchC.source.should.be.exactly(patchA.source);
    patchC.target.should.be.exactly(patchC.target);
    userListCopy2.apply(patchC);
    userListCopy2.head.contains(bard).should.be.exactly(true);
    userListCopy2.head.contains(manu).should.be.exactly(true); // We make some changes without recording the patch objects

    userList.delete('5');
    userList.commit();
    userList.delete('4');
    userList.commit(); // We can deep-diff and regenerate a new patch object
    // It is relatively slow and should be used with care.

    var diffPatch = _.Patch.fromDiff(userListCopy2, userList);

    userListCopy2.apply(diffPatch);
    userListCopy2.head.has('5').should.be.exactly(false); // We can also restrict to Consumer and Producer facades.

    var userListProducer = userList.createProducer();
    var userListConsummer = userList.createConsumer();
    userListProducer.should.not.have.property('get');
    userListConsummer.should.not.have.property('set');
    userListProducer.set('5', manu).commit();
    userListConsummer.head.get('5').should.be.exactly(manu);
  });
});