import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]


class LocalReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)

        for attribute in ("href", "src", "action"):
            value = attributes.get(attribute)
            if value:
                self.references.append(value)

        if tag == "meta" and attributes.get("property") == "og:image":
            content = attributes.get("content")
            if content:
                self.references.append(content)


def is_local_reference(reference):
    parsed = urlparse(reference)
    if parsed.scheme or parsed.netloc:
        return False
    if reference.startswith(("#", "mailto:", "tel:")):
        return False
    return True


def reference_path(page, reference):
    parsed = urlparse(reference)
    path = parsed.path

    if not path:
        return None

    if path.startswith("/"):
        return ROOT / path.lstrip("/")

    return page.parent / path


class StaticSiteTests(unittest.TestCase):
    def test_expected_deploy_paths_exist(self):
        expected_paths = [
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

        missing = [path for path in expected_paths if not (ROOT / path).is_file()]
        self.assertEqual([], missing)

    def test_uploaded_browser_suffix_files_are_not_deployed(self):
        suffixed_files = sorted(path.name for path in ROOT.glob("*[[]1[]]*"))
        self.assertEqual([], suffixed_files)

    def test_html_local_references_resolve(self):
        missing = []

        for page in ROOT.glob("*.html"):
            parser = LocalReferenceParser()
            parser.feed(page.read_text(encoding="utf-8"))

            for reference in parser.references:
                if not is_local_reference(reference):
                    continue

                target = reference_path(page, reference)
                if target and not target.is_file():
                    missing.append(f"{page.name}: {reference}")

        self.assertEqual([], missing)


if __name__ == "__main__":
    unittest.main()
