import { CDSHookCard, CDSHookCardSource, CDSHookCardLink, type CDSHookCardIndicator } from './card';

describe('CDSHookCardSource', () => {
  it('should create instance with all properties', () => {
    const source = new CDSHookCardSource({
      label: 'Test Source',
      url: 'https://example.com',
      icon: 'https://example.com/icon.png',
    });

    expect(source.label).toBe('Test Source');
    expect(source.url).toBe('https://example.com');
    expect(source.icon).toBe('https://example.com/icon.png');
  });

  it('should create instance with partial properties', () => {
    const source = new CDSHookCardSource({
      label: 'Test Source',
    });

    expect(source.label).toBe('Test Source');
    expect(source.url).toBeUndefined();
    expect(source.icon).toBeUndefined();
  });
});

describe('CDSHookCardLink', () => {
  it('should create instance with required properties', () => {
    const link = new CDSHookCardLink({
      label: 'View Details',
      url: 'https://example.com/details',
    });

    expect(link.label).toBe('View Details');
    expect(link.url).toBe('https://example.com/details');
  });
});

describe('CDSHookCard', () => {
  it('should create card with all properties', () => {
    const card = new CDSHookCard({
      summary: 'Test summary',
      detail: 'Test detail',
      indicator: 'warning',
      source: {
        label: 'Test Source',
        url: 'https://example.com',
      },
      links: [
        {
          label: 'Link 1',
          url: 'https://example.com/1',
        },
      ],
    });

    expect(card.summary).toBe('Test summary');
    expect(card.detail).toBe('Test detail');
    expect(card.indicator).toBe('warning');
    expect(card.source).toBeInstanceOf(CDSHookCardSource);
    expect(card.source?.label).toBe('Test Source');
    expect(card.links).toHaveLength(1);
    expect(card.links?.[0]).toBeInstanceOf(CDSHookCardLink);
  });

  it('should create card with minimal properties', () => {
    const card = new CDSHookCard({
      summary: 'Minimal card',
    });

    expect(card.summary).toBe('Minimal card');
    expect(card.detail).toBeUndefined();
    expect(card.indicator).toBeUndefined();
    expect(card.source).toBeUndefined();
    expect(card.links).toBeUndefined();
  });

  it('should create card using from factory method', () => {
    const card = CDSHookCard.from({
      summary: 'Factory card',
      indicator: 'info',
    });

    expect(card).toBeInstanceOf(CDSHookCard);
    expect(card.summary).toBe('Factory card');
    expect(card.indicator).toBe('info');
  });

  it('should handle nested objects correctly', () => {
    const card = new CDSHookCard({
      summary: 'Nested test',
      source: {
        label: 'Source',
        url: 'https://source.com',
        icon: 'https://source.com/icon.png',
      },
      links: [
        { label: 'Link 1', url: 'https://link1.com' },
        { label: 'Link 2', url: 'https://link2.com' },
      ],
    });

    expect(card.source).toBeInstanceOf(CDSHookCardSource);
    expect(card.links).toHaveLength(2);
    expect(card.links?.[0]).toBeInstanceOf(CDSHookCardLink);
    expect(card.links?.[1]).toBeInstanceOf(CDSHookCardLink);
    expect(card.links?.[0].label).toBe('Link 1');
    expect(card.links?.[1].label).toBe('Link 2');
  });

  it('should accept all valid indicator types', () => {
    const indicators: CDSHookCardIndicator[] = ['info', 'warning', 'hard-stop'];
    
    indicators.forEach((indicator) => {
      const card = new CDSHookCard({
        summary: 'Test',
        indicator,
      });
      expect(card.indicator).toBe(indicator);
    });
  });

  it('should handle empty initialization', () => {
    const card = new CDSHookCard();
    
    // The card should exist but have undefined properties
    expect(card).toBeInstanceOf(CDSHookCard);
  });
});
