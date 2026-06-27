import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]
REQUIRED_DEPLOY_PATHS = {
    "index.html",
    "privacy.html",
    "thanks.html",
    "robots.txt",
    "sitemap.xml",
    "css/styles.css",
    "js/main.js",
    "assets/favicon.svg",
    "assets/og-image.svg",
}


class LocalReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)

        for attr in ("href", "src"):
            if attr in attributes:
                self.references.append(attributes[attr])

        if tag == "meta" and attributes.get("property") == "og:image":
            content = attributes.get("content")
            if content:
                self.references.append(content)


def is_local_reference(reference):
    parsed = urlparse(reference)
    return not parsed.scheme and not parsed.netloc


def normalize_reference(reference):
    parsed = urlparse(reference)
    if parsed.path:
        return unquote(parsed.path).lstrip("/")
    return ""


class StaticSiteDeployTests(unittest.TestCase):
    def test_required_deploy_paths_exist(self):
        missing = sorted(path for path in REQUIRED_DEPLOY_PATHS if not (ROOT / path).is_file())
        self.assertEqual([], missing)

    def test_html_local_references_exist(self):
        missing = []

        for html_file in sorted(ROOT.glob("*.html")):
            parser = LocalReferenceParser()
            parser.feed(html_file.read_text(encoding="utf-8"))

            for reference in parser.references:
                if not is_local_reference(reference):
                    continue

                normalized = normalize_reference(reference)
                if not normalized:
                    continue

                if not (ROOT / normalized).is_file():
                    missing.append(f"{html_file.name}: {reference}")

        self.assertEqual([], missing)

    def test_uploaded_browser_suffixes_are_not_deployed(self):
        stale_files = sorted(path.name for path in ROOT.glob("*[[]1[]]*"))
        self.assertEqual([], stale_files)


if __name__ == "__main__":
    unittest.main()
