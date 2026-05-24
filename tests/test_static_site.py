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
        attrs = dict(attrs)

        for attr in ("href", "src"):
            value = attrs.get(attr)
            if value:
                self.references.append(value)

        if tag == "meta" and attrs.get("property") == "og:image":
            value = attrs.get("content")
            if value:
                self.references.append(value)


def is_local_file_reference(reference):
    parsed = urlparse(reference)
    if parsed.scheme in {"http", "https", "mailto", "tel"}:
        return False
    if reference.startswith("#"):
        return False
    return bool(parsed.path)


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

        for path in required_paths:
            with self.subTest(path=path):
                self.assertTrue((ROOT / path).is_file(), f"{path} is missing")

    def test_browser_download_suffixes_are_not_deploy_paths(self):
        suffixed_paths = list(ROOT.glob("*[[]1[]].*"))
        self.assertEqual([], suffixed_paths)

    def test_html_local_references_resolve(self):
        for page in ("index.html", "privacy.html", "thanks.html"):
            parser = ReferenceParser()
            parser.feed((ROOT / page).read_text(encoding="utf-8"))

            for reference in parser.references:
                if not is_local_file_reference(reference):
                    continue

                target = (ROOT / urlparse(reference).path).resolve()
                with self.subTest(page=page, reference=reference):
                    self.assertTrue(
                        target.is_relative_to(ROOT),
                        f"{reference} escapes the site root",
                    )
                    self.assertTrue(target.is_file(), f"{reference} is missing")

    def test_sitemap_and_robots_are_at_canonical_paths(self):
        sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
        robots = (ROOT / "robots.txt").read_text(encoding="utf-8")

        self.assertIn("https://example.com/", sitemap)
        self.assertIn("https://example.com/thanks.html", sitemap)
        self.assertIn("https://example.com/privacy.html", sitemap)
        self.assertIn("Sitemap: https://example.com/sitemap.xml", robots)


if __name__ == "__main__":
    unittest.main()
