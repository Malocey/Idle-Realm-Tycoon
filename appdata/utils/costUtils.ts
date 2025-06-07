
import { Cost, ResourceType } from '../types';

/**
 * Merges multiple arrays of Cost objects, summing amounts for the same resource type.
 * @param costsArrays - An array of Cost arrays.
 * @returns A single Cost array with merged costs.
 */
export const mergeCosts = (...costsArrays: Cost[][]): Cost[] => {
  const merged: Map<ResourceType, number> = new Map();

  costsArrays.forEach(costsArray => {
    if (costsArray) {
      costsArray.forEach(cost => {
        merged.set(cost.resource, (merged.get(cost.resource) || 0) + cost.amount);
      });
    }
  });

  return Array.from(merged, ([resource, amount]) => ({ resource, amount }));
};
