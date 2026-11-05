/*
 * api.js: the ONLY producer of translations for the UI.
 *
 * Backend contract (replace the body with fetch() to a real GNMT service):
 *   translateText(src, dir, opts) -> Promise<{
 *     tgt:         string,        // translated text
 *     srcTokens:   string[],      // source tokens, length S
 *     tgtTokens:   string[],      // target tokens, length T
 *     attention:   number[T][S],  // decoder-step x encoder-state weights, each row softmax-normalised (sums to 1)
 *     logP:        number,        // sequence log-probability (<= 0)
 *     ms:          number         // server-side latency in ms
 *   }>
 *   src:  source text; dir: "en" (EN->VI) or "vi" (VI->EN)
 *   opts: { model, beam, lenNorm, cov }  // GNMT model name, beam size, length-norm alpha, coverage beta
 * The current body is a local mock using the phrase table and pseudo attention.
 */
import { translate } from "./translate.js";
import { attnMat, hash } from "./attention.js";
import { toks } from "./tokens.js";

export async function translateText(src, dir, opts = {}) {
  const { model = "GNMT 8-layer LSTM", beam = 4 } = opts;
  const tgt = translate(src, dir), srcTokens = toks(src), tgtTokens = toks(tgt);
  const ms = Math.round((model.includes("8") ? 210 : 120) + beam * 14 + hash(src.length, beam, 1) * 40);
  const logP = -+(0.2 + hash(src.length, dir.length, 5) * 0.9).toFixed(2);
  const attention = srcTokens.length && tgtTokens.length ? attnMat(tgtTokens.length, srcTokens.length) : [];
  return { tgt, srcTokens, tgtTokens, attention, logP, ms };
}
