import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from xml.etree import ElementTree


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


class ReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = set()

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        for attr in ("href", "src"):
            if attr in attributes:
                self.references.add(attributes[attr])

        if tag == "meta" and attributes.get("property") == "og:image":
            content = attributes.get("content")
            if content:
                self.references.add(content)


def is_local_reference(reference):
    parsed = urlparse(reference)
    return not parsed.scheme and not parsed.netloc and parsed.path


class StaticSiteTests(unittest.TestCase):
    def test_required_deploy_paths_exist(self):
        missing = sorted(path for path in REQUIRED_DEPLOY_PATHS if not (ROOT / path).is_file())
        self.assertEqual([], missing)

    def test_uploaded_browser_suffixes_are_not_deployed(self):
        suffixed_files = sorted(path.name for path in ROOT.glob("*[[]1[]]*"))
        self.assertEqual([], suffixed_files)

    def test_html_local_references_resolve(self):
        missing = []

        for html_path in sorted(ROOT.glob("*.html")):
            parser = ReferenceParser()
            parser.feed(html_path.read_text(encoding="utf-8"))

            for reference in parser.references:
                if not is_local_reference(reference):
                    continue

                target = urlparse(reference).path
                if target.startswith("#"):
                    continue

                if not (html_path.parent / target).is_file():
                    missing.append(f"{html_path.name}: {reference}")

        self.assertEqual([], missing)

    def test_robots_points_to_existing_sitemap(self):
        robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
        self.assertIn("Sitemap: https://example.com/sitemap.xml", robots)
        self.assertTrue((ROOT / "sitemap.xml").is_file())

    def test_sitemap_references_canonical_pages(self):
        namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        tree = ElementTree.parse(ROOT / "sitemap.xml")
        locations = {
            loc.text
            for loc in tree.findall(".//sm:loc", namespace)
        }

        self.assertEqual(
            {
                "https://example.com/",
                "https://example.com/thanks.html",
                "https://example.com/privacy.html",
            },
            locations,
        )


if __name__ == "__main__":
    unittest.main()
