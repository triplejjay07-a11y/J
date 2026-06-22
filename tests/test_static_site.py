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
        attrs = dict(attrs)

        for attribute in ("href", "src"):
            value = attrs.get(attribute)
            if value:
                self.references.append(value)

        if attrs.get("property") == "og:image" and attrs.get("content"):
            self.references.append(attrs["content"])


def is_local_reference(reference):
    parsed = urlparse(reference)
    if parsed.scheme or parsed.netloc:
        return False
    if reference.startswith(("#", "mailto:", "tel:")):
        return False
    return bool(parsed.path)


def local_path(reference):
    parsed = urlparse(reference)
    return parsed.path.lstrip("/")


class StaticSiteDeploymentTests(unittest.TestCase):
    def test_canonical_deployment_files_exist(self):
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

        for relative_path in expected_paths:
            with self.subTest(path=relative_path):
                self.assertTrue((ROOT / relative_path).is_file())

    def test_uploaded_browser_suffix_files_are_not_deployed(self):
        suffixed_files = sorted(ROOT.glob("*[[]1[]]*"))
        self.assertEqual([], [path.name for path in suffixed_files])

    def test_html_local_references_resolve(self):
        html_files = sorted(ROOT.glob("*.html"))
        self.assertTrue(html_files)

        for html_file in html_files:
            parser = LocalReferenceParser()
            parser.feed(html_file.read_text(encoding="utf-8"))

            for reference in parser.references:
                if not is_local_reference(reference):
                    continue

                path = local_path(reference)
                with self.subTest(page=html_file.name, reference=reference):
                    self.assertTrue((ROOT / path).exists())


if __name__ == "__main__":
    unittest.main()
