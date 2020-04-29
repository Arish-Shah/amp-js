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
    test('should contain only lowercase alphanumerical characters', () => {
      const alphaNumericalRegex = /^[a-z0-9]+$/;
      expect(marker.match(alphaNumericalRegex)).not.toBeNull();
    });
    test('should be at least 10 characters long', () => {
      expect(marker.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('nodeMarker', () => {
    test('should contain the random marker', () => {
      expect(nodeMarker.indexOf(marker)).toBeGreaterThan(0);
    });
    test('should contain the failMarker after a double quote, wrapped in spaces', () => {
      expect(nodeMarker.indexOf(`" ${failMarker} `)).toBeGreaterThan(0);
    });
  });

  describe('failMarker', () => {
    test('should contain the random marker', () => {
      expect(nodeMarker.indexOf(marker)).toBeGreaterThan(0);
    });
  });

  describe('commentMarker', () => {
    test('should contain the random marker', () => {
      expect(commentMarker.indexOf(marker)).toBeGreaterThan(0);
    });
  });

  describe('attributeMarker', () => {
    test('should be a CSS font-family definition', () => {
      expect(attributeMarker.slice(0, 12) === 'font-family:').toBe(true);
    });
    test('should contain the random marker', () => {
      expect(attributeMarker.indexOf(marker)).toBeGreaterThan(0);
    });
  });

  describe('IEStyleMarker', () => {
    test('should be an IE11 font-family definition', () => {
      const IEStyleRegex = /^font-family: [a-z0-9]+;$/;
      expect(IEStyleMarker.match(IEStyleRegex)).not.toBeNull();
    });
    test('should contain the random marker', () => {
      expect(attributeMarker.indexOf(marker)).toBeGreaterThan(0);
    });
  });
});
