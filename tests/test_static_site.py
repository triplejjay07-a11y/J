from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import unittest


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
    ATTRIBUTES = {
        "a": ("href",),
        "link": ("href",),
        "script": ("src",),
        "img": ("src",),
    }

    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)

        for attribute in self.ATTRIBUTES.get(tag, ()):
            value = attributes.get(attribute)
            if value:
                self.references.append(value)

        if tag == "meta" and attributes.get("property") == "og:image":
            value = attributes.get("content")
            if value:
                self.references.append(value)


def is_local_reference(value):
    parsed = urlparse(value)
    return not parsed.scheme and not parsed.netloc and not value.startswith("#")


def referenced_path(source, value):
    parsed = urlparse(value)
    path = parsed.path.lstrip("/")

    if not path:
        return None

    return (source.parent / path).resolve()


class StaticSiteTests(unittest.TestCase):
    def test_expected_deploy_paths_exist(self):
        missing = sorted(path for path in REQUIRED_DEPLOY_PATHS if not (ROOT / path).exists())
        self.assertEqual(missing, [])

    def test_uploaded_duplicate_suffixes_are_not_deployed(self):
        suffixed_files = sorted(path.name for path in ROOT.glob("*[[]1[]]*"))
        self.assertEqual(suffixed_files, [])

    def test_html_local_references_exist(self):
        broken = []

        for html_file in sorted(ROOT.glob("*.html")):
            parser = LocalReferenceParser()
            parser.feed(html_file.read_text(encoding="utf-8"))

            for reference in parser.references:
                if not is_local_reference(reference):
                    continue

                target = referenced_path(html_file, reference)
                if target and not target.exists():
                    broken.append(f"{html_file.name}: {reference}")

        self.assertEqual(broken, [])


if __name__ == "__main__":
    unittest.main()
