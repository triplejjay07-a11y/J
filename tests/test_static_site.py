import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]


class ReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        for name in ("href", "src"):
            value = attributes.get(name)
            if value:
                self.references.append(value)

        if tag == "meta" and attributes.get("property") == "og:image":
            value = attributes.get("content")
            if value:
                self.references.append(value)


def local_path(reference):
    parsed = urlparse(reference)
    if parsed.scheme or parsed.netloc or reference.startswith("#"):
        return None

    path = parsed.path
    if not path:
        return None

    return path.lstrip("/")


class StaticSiteTests(unittest.TestCase):
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

        for path in required_paths:
            with self.subTest(path=path):
                self.assertTrue((ROOT / path).is_file())

    def test_uploaded_browser_suffixes_are_not_deployed(self):
        suffixed_files = [
            path.name
            for path in ROOT.iterdir()
            if path.is_file() and "[" in path.name and "]" in path.name
        ]

        self.assertEqual([], suffixed_files)

    def test_html_local_references_resolve(self):
        html_files = sorted(ROOT.glob("*.html"))
        self.assertTrue(html_files)

        for html_file in html_files:
            parser = ReferenceParser()
            parser.feed(html_file.read_text(encoding="utf-8"))

            for reference in parser.references:
                target = local_path(reference)
                if target is None:
                    continue

                with self.subTest(page=html_file.name, reference=reference):
                    self.assertTrue((ROOT / target).exists())

    def test_robots_and_sitemap_are_served_at_canonical_paths(self):
        robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
        sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")

        self.assertIn("Sitemap: https://example.com/sitemap.xml", robots)
        self.assertIn("https://example.com/thanks.html", sitemap)
        self.assertIn("https://example.com/privacy.html", sitemap)


if __name__ == "__main__":
    unittest.main()
