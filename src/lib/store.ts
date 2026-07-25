import { getCollection } from 'astro:content';

import type { CollectionEntry } from 'astro:content';

export async function getFigures(): Promise<(CollectionEntry<'gallery'>['data'] & { id: string })[]> {
    const entries = await getCollection('gallery');

    return entries
        .sort((entryA, entryB) => Number.parseInt(entryA.id) - Number.parseInt(entryB.id))
        .map(entry => ({ id: entry.id, ...entry.data }));
}
