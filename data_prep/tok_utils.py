"""Worker functions for word-level tokenization (module-level so multiprocessing 'spawn' on Windows can pickle them)."""
from collections import Counter

import nltk
from nltk.tokenize import NLTKWordTokenizer
from pyvi import ViTokenizer

try:
    nltk.data.find('tokenizers/punkt_tab')
    from nltk import word_tokenize as _en_tok
    EN_BACKEND = 'nltk.word_tokenize (punkt_tab)'
except LookupError:  # no data available: Treebank-style tokenizer needs no download
    _en_tok = NLTKWordTokenizer().tokenize
    EN_BACKEND = 'NLTKWordTokenizer (fallback)'


def tok_one(args):
    """Tokenize one sentence. args = (lang, text) -> list[str]."""
    lang, s = args
    return _en_tok(s) if lang == 'en' else ViTokenizer.tokenize(s).split(' ')


def tok_chunk(args):
    """Tokenize a chunk of sentences. args = (lang, texts) -> list[list[str]]."""
    lang, texts = args
    f = _en_tok if lang == 'en' else (lambda s: ViTokenizer.tokenize(s).split(' '))
    return [f(s) for s in texts]


def count_chunk(args):
    """Tokenize a chunk and return only the word Counter (saves IPC for 1M sentences)."""
    lang, texts = args
    c = Counter()
    for t in tok_chunk((lang, texts)):
        c.update(t)
    return c
