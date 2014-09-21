ddescribe('$$interimElementFactory service', function() {
  var $compilerSpy, resolvingPromise;
  beforeEach(module('material.services.interimElement', function($provide) {
    var $materialCompiler = {
      compile: function() { }
    };
    $compilerSpy = spyOn($materialCompiler, 'compile');

    $provide.value('$materialCompiler', $materialCompiler);
  }));

  beforeEach(inject(function($q) {
    $compilerSpy.andCallFake(function() {
      var deferred = $q.defer();
      deferred.resolve(true);
      return deferred.promise;
    });
  }));

  describe('construction', function() {
  });

  describe('instance', function() {
    describe('#show', function() {
      forwardsToMaterialCompiler('templateUrl');
    });
  });

  function forwardsToMaterialCompiler(optionName) {
    it('forwards option ' + optionName + ' to $materialCompiler', inject(function($$interimElementFactory) {
      var options = {};
      options[optionName] = 'testing';
      var Service = $$interimElementFactory();
      Service.show(options);
      expect($compilerSpy.mostRecentCall.args[0][optionName]).toBeDefined();
    }));
  }
});

