import {
  marker,
  attributeMarker,
  commentMarker,
  nodeMarker,
  failMarker,
  IEStyleMarker
} from '../../src/template/markers.js';

describe('markers', () => {
  describe('marker', () => {
    it('should contain only lowercase alphanumerical characters', () => {
      const alphaNumericalRegex = /^[a-z0-9]+$/;
      expect(marker.match(alphaNumericalRegex)).not.toBeNull();
    });
    it('should be at least 10 characters long', () => {
      expect(marker.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('nodeMarker', () => {
    it('should contain the random marker', () => {
      expect(nodeMarker.indexOf(marker)).toBeGreaterThan(0);
    });
    it('should contain the failMarker after a double quote, wrapped in spaces', () => {
      expect(nodeMarker.indexOf(`" ${failMarker} `)).toBeGreaterThan(0);
    });
  });

  describe('failMarker', () => {
    it('should contain the random marker', () => {
      expect(nodeMarker.indexOf(marker)).toBeGreaterThan(0);
    });
  });

  describe('commentMarker', () => {
    it('should contain the random marker', () => {
      expect(commentMarker.indexOf(marker)).toBeGreaterThan(0);
    });
  });

  describe('attributeMarker', () => {
    it('should be a CSS font-family definition', () => {
      expect(attributeMarker.slice(0, 12) === 'font-family:').toBe(true);
    });
    it('should contain the random marker', () => {
      expect(attributeMarker.indexOf(marker)).toBeGreaterThan(0);
    });
  });

  describe('IEStyleMarker', () => {
    it('should be an IE11 font-family definition', () => {
      const IEStyleRegex = /^font-family: [a-z0-9]+;$/;
      expect(IEStyleMarker.match(IEStyleRegex)).not.toBeNull();
    });
    it('should contain the random marker', () => {
      expect(attributeMarker.indexOf(marker)).toBeGreaterThan(0);
    });
  });
});
