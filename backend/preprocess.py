import re

URDU_NORMALIZATION = {
    'ي': 'ی',
    'ك': 'ک',
    'ه': 'ہ',
    '\u200c': '',
    '\u200d': '',
    '\u200b': '',
}


def normalize_urdu(text: str) -> str:
    for k, v in URDU_NORMALIZATION.items():
        text = text.replace(k, v)
    return text


def clean_urdu_text(text: str) -> str:
    text = normalize_urdu(text)
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()
