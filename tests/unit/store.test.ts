import { describe, expect, test } from 'vitest';
import { join } from 'node:path';
import { readdirSync } from 'node:fs';

import { getFigures } from '../../src/lib/store';

const FIGURE_COUNT = 22;
const FIGURE_KEYS = ['alt', 'id', 'label'] as const;

const contentRoot = join(process.cwd(), 'src/content');

function listIds(collection: string) {
    return readdirSync(join(contentRoot, collection))
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
}

describe('getFigures', () => {
    test('returns all twenty-two gallery entries with filename-stem ids', async () => {
        const figures = await getFigures();

        expect(figures).toHaveLength(FIGURE_COUNT);
        expect(figures.map(figure => figure.id).sort()).toEqual(listIds('gallery').sort());
    });

    test('sorts the entries ascending by id', async () => {
        const figures = await getFigures();

        const expectedIds = listIds('gallery').sort((idA, idB) => idA.localeCompare(idB));

        expect(figures.map(figure => figure.id)).toEqual(expectedIds);
    });

    test('carries a non-empty alt and label alongside the id on every figure', async () => {
        const figures = await getFigures();

        for (const figure of figures) {
            expect(Object.keys(figure).sort(), figure.id).toEqual([...FIGURE_KEYS]);
            expect(figure.alt.trim(), figure.id).not.toBe('');
            expect(figure.label.trim(), figure.id).not.toBe('');
        }
    });
});
