import html.parser
import pathlib
import unittest
from urllib.parse import urlparse


ROOT = pathlib.Path(__file__).resolve().parents[1]


class LocalReferenceParser(html.parser.HTMLParser):
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


def is_local_path(reference):
    parsed = urlparse(reference)
    return (
        not parsed.scheme
        and not parsed.netloc
        and not reference.startswith("#")
        and not reference.startswith("mailto:")
        and not reference.startswith("tel:")
    )


def normalize_path(reference):
    return urlparse(reference).path


class StaticSiteDeploymentTests(unittest.TestCase):
    def test_required_deployment_paths_exist(self):
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

    def test_uploaded_browser_suffix_files_are_not_deployed(self):
        suffixed_files = sorted(path.name for path in ROOT.glob("*[[]1[]]*"))

        self.assertEqual([], suffixed_files)

    def test_html_local_references_resolve(self):
        missing = []

        for html_file in sorted(ROOT.glob("*.html")):
            parser = LocalReferenceParser()
            parser.feed(html_file.read_text(encoding="utf-8"))

            for reference in parser.references:
                if not is_local_path(reference):
                    continue

                path = normalize_path(reference)
                if not path or path.startswith("#"):
                    continue

                if not (ROOT / path).exists():
                    missing.append(f"{html_file.name}: {reference}")

        self.assertEqual([], missing)


if __name__ == "__main__":
    unittest.main()
