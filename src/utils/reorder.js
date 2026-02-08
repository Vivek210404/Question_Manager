/**
 * Utility function to reorder items in an array
 * @param {Array} list - The array to reorder
 * @param {number} startIndex - Starting index
 * @param {number} endIndex - Ending index
 * @returns {Array} New reordered array
 */
export function reorder(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}