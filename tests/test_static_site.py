import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]


class ReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for attr in ("href", "src"):
            if attr in attrs:
                self.references.append(attrs[attr])

        if tag == "meta" and attrs.get("property") == "og:image" and "content" in attrs:
            self.references.append(attrs["content"])


def is_local_reference(reference):
    parsed = urlparse(reference)
    if parsed.scheme in {"http", "https", "mailto", "tel"}:
        return False
    if reference.startswith("#") or not reference.strip():
        return False
    return True


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
                self.assertTrue((ROOT / path).is_file(), f"{path} must exist for static hosting")

    def test_uploaded_browser_suffixes_are_not_deploy_entrypoints(self):
        suffixed_uploads = sorted(path.name for path in ROOT.glob("*[[]1[]].*"))

        self.assertEqual([], suffixed_uploads)

    def test_local_html_references_resolve(self):
        html_files = sorted(ROOT.glob("*.html"))
        self.assertGreater(html_files, [])

        for html_file in html_files:
            parser = ReferenceParser()
            parser.feed(html_file.read_text(encoding="utf-8"))

            for reference in parser.references:
                if not is_local_reference(reference):
                    continue

                parsed = urlparse(reference)
                raw_path = unquote(parsed.path)
                target = ROOT / raw_path.lstrip("/") if raw_path.startswith("/") else html_file.parent / raw_path

                with self.subTest(page=html_file.name, reference=reference):
                    self.assertTrue(target.exists(), f"{reference} from {html_file.name} does not resolve")


if __name__ == "__main__":
    unittest.main()
