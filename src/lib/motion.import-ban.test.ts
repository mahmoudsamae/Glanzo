/**
 * Step 2 guard: ESLint `no-restricted-imports` rejects `motion` from `framer-motion`.
 * LazyMotion `strict` rejects runtime `motion.*` usage — see MotionProvider.
 *
 * Negative case (must fail lint if uncommented):
 * import { motion } from "framer-motion";
 */
export {};
