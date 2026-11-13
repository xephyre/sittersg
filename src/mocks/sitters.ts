import { Sitter } from '../types';
import { PLAYTIME_PHOTO_UPDATE_URL, SITTERS_NORTH } from './sittersNorth';
import { SITTERS_EAST } from './sittersEast';

export { PLAYTIME_PHOTO_UPDATE_URL };

export const SEED_SITTERS: Sitter[] = [...SITTERS_NORTH, ...SITTERS_EAST];
