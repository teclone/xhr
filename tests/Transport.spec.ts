import { Transport } from '../src/Transport';

describe('Xhr Transport', function() {
  describe('supported', function() {
    it(`should return true if xhr Transport is supported`, function() {
      expect(Transport.supported).toEqual(true);
    });
  });
});
