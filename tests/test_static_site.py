from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import unittest


ROOT = Path(__file__).resolve().parents[1]


class ReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)

        for attribute in ("href", "src"):
            value = attrs.get(attribute)
            if value:
                self.references.append(value)

        if tag == "meta" and attrs.get("property") == "og:image" and attrs.get("content"):
            self.references.append(attrs["content"])


def is_local_file_reference(reference):
    parsed = urlparse(reference)

    return (
        not parsed.scheme
        and not parsed.netloc
        and not reference.startswith("#")
        and not reference.startswith("mailto:")
        and not reference.startswith("tel:")
    )


class StaticSitePathTests(unittest.TestCase):
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

    def test_uploaded_browser_suffix_paths_are_not_deployed(self):
        stale_paths = [
            "index[1].html",
            "privacy[1].html",
            "thanks[1].html",
            "robots[1].txt",
            "sitemap[1].xml",
            "styles.css",
        ]

        for path in stale_paths:
            with self.subTest(path=path):
                self.assertFalse((ROOT / path).exists())

    def test_html_local_references_resolve(self):
        for html_path in ROOT.glob("*.html"):
            parser = ReferenceParser()
            parser.feed(html_path.read_text(encoding="utf-8"))

            for reference in parser.references:
                if not is_local_file_reference(reference):
                    continue

                target_path = reference.split("#", 1)[0].split("?", 1)[0]

                if not target_path:
                    continue

                with self.subTest(page=html_path.name, reference=reference):
                    self.assertTrue((ROOT / target_path).is_file())

    def test_sitemap_and_robots_reference_canonical_pages(self):
        sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
        robots = (ROOT / "robots.txt").read_text(encoding="utf-8")

        self.assertIn("https://example.com/", sitemap)
        self.assertIn("https://example.com/privacy.html", sitemap)
        self.assertIn("https://example.com/thanks.html", sitemap)
        self.assertIn("Sitemap: https://example.com/sitemap.xml", robots)


if __name__ == "__main__":
    unittest.main()
