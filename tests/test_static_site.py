import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]


class LocalReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        for attr in ("href", "src"):
            value = attributes.get(attr)
            if value:
                self.references.append(value)

        if tag == "meta" and attributes.get("property") == "og:image":
            value = attributes.get("content")
            if value:
                self.references.append(value)


def is_local_reference(value):
    parsed = urlparse(value)
    return not parsed.scheme and not parsed.netloc and parsed.path


class StaticSiteTest(unittest.TestCase):
    def test_required_deploy_paths_exist(self):
        required_paths = [
            "index.html",
            "privacy.html",
            "thanks.html",
            "robots.txt",
            "sitemap.xml",
            "css/styles.css",
            "js/main.js",
            "assets/favicon.svg",
            "assets/og-image.svg",
        ]

        missing = [path for path in required_paths if not (ROOT / path).is_file()]

        self.assertEqual([], missing)

    def test_html_local_references_exist(self):
        missing = []
        for html_file in ROOT.glob("*.html"):
            parser = LocalReferenceParser()
            parser.feed(html_file.read_text(encoding="utf-8"))

            for reference in parser.references:
                if not is_local_reference(reference):
                    continue

                parsed = urlparse(reference)
                path = unquote(parsed.path)
                if path.startswith("/"):
                    target = ROOT / path.lstrip("/")
                else:
                    target = html_file.parent / path

                if not target.exists():
                    missing.append(f"{html_file.name}: {reference}")

        self.assertEqual([], missing)

    def test_no_browser_download_suffixes_are_deployed(self):
        suffixed_files = sorted(path.name for path in ROOT.glob("*[[]*[]]*"))

        self.assertEqual([], suffixed_files)


if __name__ == "__main__":
    unittest.main()
