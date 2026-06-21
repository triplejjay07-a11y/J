from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
import unittest


ROOT = Path(__file__).resolve().parents[1]


class LocalReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        for attribute in ("href", "src"):
            value = attributes.get(attribute)
            if value:
                self.references.append(value)

        if tag == "meta" and attributes.get("property") == "og:image":
            content = attributes.get("content")
            if content:
                self.references.append(content)


def is_local_reference(reference):
    parsed = urlparse(reference)
    return parsed.scheme == "" and not reference.startswith(("#", "mailto:", "tel:"))


def path_for_reference(page, reference):
    parsed = urlparse(reference)
    path = unquote(parsed.path)

    if not path or path.startswith("#"):
        return None

    if path.startswith("/"):
        return ROOT / path.lstrip("/")

    return page.parent / path


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

        missing = [path for path in required_paths if not (ROOT / path).is_file()]

        self.assertEqual([], missing)

    def test_uploaded_browser_suffix_paths_are_not_deployed(self):
        stale_paths = [
            "index[1].html",
            "privacy[1].html",
            "thanks[1].html",
            "robots[1].txt",
            "sitemap[1].xml",
            "styles.css",
        ]

        present = [path for path in stale_paths if (ROOT / path).exists()]

        self.assertEqual([], present)

    def test_html_local_references_exist(self):
        missing = []

        for page in sorted(ROOT.glob("*.html")):
            parser = LocalReferenceParser()
            parser.feed(page.read_text(encoding="utf-8"))

            for reference in parser.references:
                if not is_local_reference(reference):
                    continue

                target = path_for_reference(page, reference)
                if target and not target.exists():
                    missing.append(f"{page.name}: {reference}")

        self.assertEqual([], missing)


if __name__ == "__main__":
    unittest.main()
